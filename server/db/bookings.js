/**
 * Bookings: Supabase normalized tables only (bookings_new + related).
 * All public reads return the legacy flat shape via adaptBookingRow.
 */

import { getSupabaseAdmin } from './supabaseClient.js'
import { adaptBookingRow } from './bookingAdapter.js'
import { upsertProfileFromCustomer } from './users.js'

const BOOKING_RELATIONS = `
  *,
  profiles (first_name, last_name, email, phone),
  schedules (
    scheduled_date, scheduled_time,
    classes (name, duration_minutes),
    teachers (full_name)
  ),
  customer_packages (
    id,
    classes_remaining,
    packages (name, total_classes)
  ),
  payments_new (amount, currency, status, method, card_last_four, stripe_payment_intent_id)
`

function normalizeTime(t) {
  if (t == null || t === '') return t
  const s = String(t).trim()
  const parts = s.split(':')
  const h = (parts[0] || '0').padStart(2, '0')
  const m = (parts[1] || '00').padStart(2, '0')
  const sec = parts[2] != null ? parts[2].padStart(2, '0') : null
  return sec != null ? `${h}:${m}:${sec}` : `${h}:${m}`
}

export async function findScheduleBySlot(className, date, time) {
  const supabase = getSupabaseAdmin()
  const t1 = normalizeTime(time)
  const t2 = t1.length === 5 ? `${t1}:00` : t1
  const { data, error } = await supabase
    .from('schedules')
    .select(
      `
      id, spots_available, spots_total, scheduled_date, scheduled_time, status,
      classes!inner (name),
      teachers (full_name)
    `
    )
    .eq('scheduled_date', date)
    .in('scheduled_time', [t1, t2])
    .eq('status', 'active')
  if (error) throw error
  const row = (data || []).find((s) => (s.classes?.name || '').trim() === (className || '').trim())
  return row || null
}

/** Capacity from schedules.spots_* (source of truth). */
export async function getAvailabilityForSlot(className, date, time) {
  const schedule = await findScheduleBySlot(className, date, time)
  if (!schedule) {
    return {
      available: false,
      currentCount: 0,
      maxBookings: 0,
      remainingSpots: 0,
      schedule: null,
    }
  }
  const maxBookings = schedule.spots_total ?? 0
  const remainingSpots = Math.max(0, schedule.spots_available ?? 0)
  const currentCount = Math.max(0, maxBookings - remainingSpots)
  return {
    available: remainingSpots > 0,
    currentCount,
    maxBookings,
    remainingSpots,
    schedule,
  }
}

async function fetchBookingsWithRelations() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('bookings_new')
    .select(BOOKING_RELATIONS)
    .order('id', { ascending: true })
  if (error) {
    console.error('Supabase getBookings error:', error.message)
    return []
  }
  return data || []
}

export async function getBookings() {
  const rows = await fetchBookingsWithRelations()
  return rows.map(adaptBookingRow).filter(Boolean)
}

export async function getBookingById(bookingId) {
  const supabase = getSupabaseAdmin()
  const numId = Number(bookingId)
  if (Number.isNaN(numId)) return null
  const { data, error } = await supabase
    .from('bookings_new')
    .select(BOOKING_RELATIONS)
    .eq('id', numId)
    .maybeSingle()
  if (error || !data) return null
  return adaptBookingRow(data)
}

export async function findBookingByStripePaymentIntentId(paymentIntentId) {
  if (!paymentIntentId) return null
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('payments_new')
    .select('booking_id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .limit(1)
    .maybeSingle()
  if (error || !data?.booking_id) return null
  return getBookingById(String(data.booking_id))
}

function mapDbPaymentMethod(pm) {
  const p = (pm || '').toLowerCase()
  if (p === 'package') return 'package'
  if (p === 'manual') return 'manual'
  return 'card'
}

function shouldDecrementSpotOnInsert(flat) {
  const st = flat.status || 'pending'
  if (st !== 'confirmed') return false
  if (flat.paymentMethod === 'package' || flat.paymentMethod === 'manual') return true
  return flat.payment?.status === 'succeeded'
}

function mapBookingTypeForDb(t) {
  if (t === 'class') return 'clase'
  return t || 'clase'
}

async function decrementScheduleSpot(scheduleId, currentSpots) {
  const supabase = getSupabaseAdmin()
  const next = Math.max(0, (currentSpots ?? 0) - 1)
  const { error } = await supabase.from('schedules').update({ spots_available: next }).eq('id', scheduleId)
  if (error) throw error
}

async function incrementScheduleSpot(scheduleId) {
  const supabase = getSupabaseAdmin()
  const { data: row, error: rErr } = await supabase
    .from('schedules')
    .select('spots_available, spots_total')
    .eq('id', scheduleId)
    .single()
  if (rErr || !row) throw rErr || new Error('Schedule not found')
  const cap = row.spots_total != null ? row.spots_total : (row.spots_available ?? 0) + 1
  const next = Math.min(cap, (row.spots_available ?? 0) + 1)
  const { error } = await supabase.from('schedules').update({ spots_available: next }).eq('id', scheduleId)
  if (error) throw error
}

/**
 * Persist a booking from the legacy flat payload used by POST /api/bookings and /api/confirm-booking.
 */
export async function saveBooking(flat) {
  const supabase = getSupabaseAdmin()
  const customer = flat.customer || {}
  const profile = await upsertProfileFromCustomer(customer)
  const schedule = await findScheduleBySlot(flat.className, flat.date, flat.time)
  if (!schedule) {
    throw new Error('No hay un horario activo para esa clase, fecha y hora.')
  }

  const avail = schedule.spots_available ?? 0
  if (flat.status === 'confirmed' && avail <= 0) {
    throw new Error(
      'Lo sentimos, esta clase ya no tiene lugares disponibles para esta fecha y hora. Por favor selecciona otra fecha u hora.'
    )
  }

  const paymentMethod = mapDbPaymentMethod(flat.paymentMethod)
  const type = mapBookingTypeForDb(flat.type)
  const status = flat.status || 'pending'

  if (paymentMethod === 'package') {
    const packageId = flat.packageId != null ? Number(flat.packageId) : NaN
    if (Number.isNaN(packageId)) {
      throw new Error('No tienes clases disponibles en este paquete o el paquete no existe.')
    }
    const { data: cp, error: cpErr } = await supabase
      .from('customer_packages')
      .select('id, classes_remaining')
      .eq('id', packageId)
      .eq('customer_id', profile.id)
      .eq('payment_status', 'succeeded')
      .gt('classes_remaining', 0)
      .maybeSingle()
    if (cpErr || !cp) {
      throw new Error('No tienes clases disponibles en este paquete o el paquete no existe.')
    }

    const { data: booking, error: bErr } = await supabase
      .from('bookings_new')
      .insert({
        customer_id: profile.id,
        schedule_id: schedule.id,
        customer_package_id: cp.id,
        type,
        status,
        payment_method: 'package',
      })
      .select(BOOKING_RELATIONS)
      .single()
    if (bErr) throw bErr

    const { error: upCp } = await supabase
      .from('customer_packages')
      .update({ classes_remaining: Math.max(0, cp.classes_remaining - 1) })
      .eq('id', cp.id)
    if (upCp) throw upCp

    const decPkg = shouldDecrementSpotOnInsert({ ...flat, status, paymentMethod: 'package' })
    if (decPkg) await decrementScheduleSpot(schedule.id, avail)

    return adaptBookingRow(booking)
  }

  if (paymentMethod === 'manual') {
    const manualStatus = status || 'confirmed'
    const { data: booking, error: bErr } = await supabase
      .from('bookings_new')
      .insert({
        customer_id: profile.id,
        schedule_id: schedule.id,
        customer_package_id: null,
        type,
        status: manualStatus,
        payment_method: 'manual',
      })
      .select(BOOKING_RELATIONS)
      .single()
    if (bErr) throw bErr

    const decMan = shouldDecrementSpotOnInsert({ ...flat, status: manualStatus, paymentMethod: 'manual' })
    if (decMan) await decrementScheduleSpot(schedule.id, avail)

    return adaptBookingRow(booking)
  }

  // card
  const stripePaymentIntentId =
    flat.paymentIntentId || flat.stripeInfo?.paymentIntentId || null
  const amount = flat.payment?.amount ?? 0
  const cardLastFour = flat.payment?.cardLastFour || flat.payment?.card_last_four || null

  const { data: booking, error: bErr } = await supabase
    .from('bookings_new')
    .insert({
      customer_id: profile.id,
      schedule_id: schedule.id,
      customer_package_id: null,
      type,
      status,
      payment_method: 'card',
    })
    .select(BOOKING_RELATIONS)
    .single()
  if (bErr) throw bErr

  const payStatus =
    flat.payment?.status === 'succeeded' || status === 'confirmed' ? 'succeeded' : (flat.payment?.status || 'pending')

  const { error: pErr } = await supabase.from('payments_new').insert({
    booking_id: booking.id,
    customer_id: profile.id,
    customer_package_id: null,
    amount,
    currency: 'MXN',
    method: 'card',
    status: payStatus,
    stripe_payment_intent_id: stripePaymentIntentId,
    card_last_four: cardLastFour,
  })
  if (pErr) throw pErr

  const decCard = shouldDecrementSpotOnInsert({ ...flat, status, paymentMethod: 'card' })
  if (decCard) await decrementScheduleSpot(schedule.id, avail)

  const { data: full, error: fErr } = await supabase
    .from('bookings_new')
    .select(BOOKING_RELATIONS)
    .eq('id', booking.id)
    .single()
  if (fErr || !full) return adaptBookingRow(booking)
  return adaptBookingRow(full)
}

export async function updateBooking(bookingId, updates) {
  const supabase = getSupabaseAdmin()
  const numId = Number(bookingId)
  if (Number.isNaN(numId)) return null

  if (updates.date != null && updates.time != null) {
    const { data: cur, error: curErr } = await supabase
      .from('bookings_new')
      .select(
        `
        id, status, schedule_id, customer_package_id,
        schedules ( classes (name) )
      `
      )
      .eq('id', numId)
      .single()
    if (curErr || !cur) return null

    const className = cur.schedules?.classes?.name
    const newSched = await findScheduleBySlot(className, updates.date, updates.time)
    if (!newSched || (newSched.spots_available ?? 0) <= 0) return null

    const oldId = cur.schedule_id
    await incrementScheduleSpot(oldId)
    await decrementScheduleSpot(newSched.id, newSched.spots_available)

    const { data: updated, error: uErr } = await supabase
      .from('bookings_new')
      .update({ schedule_id: newSched.id })
      .eq('id', numId)
      .select(BOOKING_RELATIONS)
      .single()
    if (uErr || !updated) return null

    return adaptBookingRow(updated)
  }

  if (updates.paymentStatus != null || updates.status != null) {
    const { data: cur, error: curErr } = await supabase
      .from('bookings_new')
      .select('status, schedule_id')
      .eq('id', numId)
      .single()
    if (curErr || !cur) return null

    const nextStatus = updates.status ?? cur.status
    if (nextStatus === 'confirmed' && cur.status === 'pending') {
      const { data: sch } = await supabase
        .from('schedules')
        .select('spots_available')
        .eq('id', cur.schedule_id)
        .single()
      if (sch && (sch.spots_available ?? 0) > 0) {
        await decrementScheduleSpot(cur.schedule_id, sch.spots_available)
      }
    }

    const patch = {}
    if (updates.status != null) patch.status = updates.status
    if (Object.keys(patch).length) {
      const { error: bUp } = await supabase.from('bookings_new').update(patch).eq('id', numId)
      if (bUp) return null
    }

    if (updates.paymentStatus != null) {
      const map = updates.paymentStatus === 'succeeded' ? 'succeeded' : updates.paymentStatus === 'failed' ? 'failed' : updates.paymentStatus
      const { error: pUp } = await supabase.from('payments_new').update({ status: map }).eq('booking_id', numId)
      if (pUp) return null
    }

    return getBookingById(String(numId))
  }

  return getBookingById(String(numId))
}

export async function cancelBookingNormalized(bookingId) {
  const supabase = getSupabaseAdmin()
  const numId = Number(bookingId)
  if (Number.isNaN(numId)) return null

  const { data: cur, error } = await supabase
    .from('bookings_new')
    .select('id, status, schedule_id, customer_package_id')
    .eq('id', numId)
    .single()
  if (error || !cur || cur.status === 'cancelled') return null

  await supabase.from('bookings_new').update({ status: 'cancelled' }).eq('id', numId)

  if (cur.customer_package_id) {
    const { data: cp } = await supabase
      .from('customer_packages')
      .select('classes_remaining')
      .eq('id', cur.customer_package_id)
      .single()
    if (cp) {
      await supabase
        .from('customer_packages')
        .update({ classes_remaining: (cp.classes_remaining ?? 0) + 1 })
        .eq('id', cur.customer_package_id)
    }
  }

  if (cur.schedule_id) await incrementScheduleSpot(cur.schedule_id)

  return getBookingById(String(numId))
}

export function isUsingSupabase() {
  try {
    getSupabaseAdmin()
    return true
  } catch {
    return false
  }
}
