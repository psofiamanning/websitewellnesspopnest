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

/** `date` del calendario como YYYY-MM-DD (string). */
function toYyyyMmDd(date) {
  if (date == null || date === '') return ''
  if (typeof date === 'string') return date.slice(0, 10)
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return String(date).slice(0, 10)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Slots con `valid_from` / `valid_until` (nullable): ventana para **nuevas** reservas.
 * Reservas ya guardadas siguen apuntando al mismo `schedule_id`; no se borran filas.
 */
function isScheduleSlotOpenForNewBookings(schedule, requestedDateYyyyMmDd) {
  if (!schedule || schedule.status !== 'active') return false
  const day = requestedDateYyyyMmDd
  if (!day) return false
  if (schedule.valid_from && day < schedule.valid_from) return false
  if (schedule.valid_until && day > schedule.valid_until) return false
  return true
}

export async function findScheduleBySlot(className, date, time) {
  const supabase = getSupabaseAdmin()
  const dateKey = toYyyyMmDd(date)
  const t1 = normalizeTime(time)
  const t2 = t1.length === 5 ? `${t1}:00` : t1
  const { data, error } = await supabase
    .from('schedules')
    .select(
      `
      id, spots_available, spots_total, scheduled_date, scheduled_time, status,
      valid_from, valid_until,
      classes!inner (name),
      teachers (full_name)
    `
    )
    .eq('scheduled_date', dateKey)
    .in('scheduled_time', [t1, t2])
    .eq('status', 'active')
  if (error) throw error
  const row = (data || []).find(
    (s) =>
      (s.classes?.name || '').trim() === (className || '').trim() &&
      isScheduleSlotOpenForNewBookings(s, dateKey)
  )
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
  if (t === 'profesor') return 'coach'
  return t || 'clase'
}

function isMissingPackageCreditColumnError(err) {
  const m = `${err?.message || ''} ${err?.details || ''}`.toLowerCase()
  return m.includes('package_credit_deducted')
}

async function decrementScheduleSpot(scheduleId, currentSpots) {
  const supabase = getSupabaseAdmin()
  const next = Math.max(0, (currentSpots ?? 0) - 1)
  const { error } = await supabase.from('schedules').update({ spots_available: next }).eq('id', scheduleId)
  if (error) throw error
}

/** Reservas que cuentan para cupo/saldo de paquete (no canceladas). */
export async function countBookingsForCustomerPackage(customerPackageId) {
  const supabase = getSupabaseAdmin()
  const id = Number(customerPackageId)
  if (!Number.isFinite(id)) return 0
  const { count, error } = await supabase
    .from('bookings_new')
    .select('*', { count: 'exact', head: true })
    .eq('customer_package_id', id)
    .neq('status', 'cancelled')
  if (error) {
    console.error('countBookingsForCustomerPackage:', error.message)
    return 0
  }
  return count ?? 0
}

/** Map customer_package_id -> número de reservas no canceladas (para UI en lote). */
export async function countBookingsByCustomerPackageIds(packageIds) {
  const map = new Map()
  const ids = (packageIds || []).map(Number).filter((n) => Number.isFinite(n))
  if (!ids.length) return map
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('bookings_new')
    .select('customer_package_id')
    .in('customer_package_id', ids)
    .neq('status', 'cancelled')
  if (error) {
    console.error('countBookingsByCustomerPackageIds:', error.message)
    return map
  }
  for (const row of data || []) {
    const pid = row.customer_package_id
    if (pid == null) continue
    map.set(pid, (map.get(pid) ?? 0) + 1)
  }
  return map
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

  const PAQUETE_20_NOMBRE = 'Paquete de 20 Clases'

  if (paymentMethod === 'package') {
    const packageId = flat.packageId != null ? Number(flat.packageId) : NaN
    if (Number.isNaN(packageId)) {
      throw new Error('No tienes clases disponibles en este paquete o el paquete no existe.')
    }
    const { data: cp, error: cpErr } = await supabase
      .from('customer_packages')
      .select(
        `
        id,
        classes_remaining,
        classes_total,
        packages ( name, total_classes )
      `
      )
      .eq('id', packageId)
      .eq('customer_id', profile.id)
      .eq('payment_status', 'succeeded')
      .gt('classes_remaining', 0)
      .maybeSingle()
    if (cpErr || !cp) {
      throw new Error('No tienes clases disponibles en este paquete o el paquete no existe.')
    }

    const pkgName = cp.packages?.name?.trim() || ''
    const packageTotal =
      cp.classes_total ?? cp.packages?.total_classes ?? 0
    const prevBookings = await countBookingsForCustomerPackage(cp.id)

    if (pkgName === PAQUETE_20_NOMBRE && packageTotal > 0 && prevBookings >= packageTotal) {
      throw new Error('Ya usaste las 20 reservaciones incluidas en este paquete.')
    }

    let deductCredit = true
    if (pkgName === PAQUETE_20_NOMBRE) {
      deductCredit = prevBookings >= 2
    }

    const insertRow = {
      customer_id: profile.id,
      schedule_id: schedule.id,
      customer_package_id: cp.id,
      type,
      status,
      payment_method: 'package',
      package_credit_deducted: deductCredit,
    }

    let { data: booking, error: bErr } = await supabase
      .from('bookings_new')
      .insert(insertRow)
      .select(BOOKING_RELATIONS)
      .single()

    if (bErr && isMissingPackageCreditColumnError(bErr)) {
      const { package_credit_deducted: _omit, ...fallbackRow } = insertRow
      const retry = await supabase.from('bookings_new').insert(fallbackRow).select(BOOKING_RELATIONS).single()
      booking = retry.data
      bErr = retry.error
      console.warn(
        'bookings_new.package_credit_deducted no existe; ejecuta server/sql/add_booking_package_credit_deducted.sql en Supabase.'
      )
    }
    if (bErr) throw bErr
    if (!booking) throw new Error('No se pudo crear la reserva con paquete.')

    if (deductCredit) {
      const { error: upCp } = await supabase
        .from('customer_packages')
        .update({ classes_remaining: Math.max(0, cp.classes_remaining - 1) })
        .eq('id', cp.id)
      if (upCp) throw upCp
    }

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

  let sel = await supabase
    .from('bookings_new')
    .select('id, status, schedule_id, customer_package_id, package_credit_deducted')
    .eq('id', numId)
    .single()

  if (sel.error && isMissingPackageCreditColumnError(sel.error)) {
    sel = await supabase
      .from('bookings_new')
      .select('id, status, schedule_id, customer_package_id')
      .eq('id', numId)
      .single()
  }

  const cur = sel.data
  const error = sel.error && !cur ? sel.error : null
  if (error || !cur || cur.status === 'cancelled') return null

  await supabase.from('bookings_new').update({ status: 'cancelled' }).eq('id', numId)

  /** Solo devuelve clase al paquete si esa reserva había descontado saldo (Paquete 20: primeras 2 tienen package_credit_deducted = false). */
  if (cur.customer_package_id && cur.package_credit_deducted !== false) {
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
