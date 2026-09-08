// Capa de datos para la renta del salón al público (reservas pagadas +
// solicitudes especiales para "sobre horario de clase").
import { getSupabaseAdmin } from './supabaseClient.js'

/** Las tablas pueden no existir todavía (falta correr add_salon_bookings.sql). */
function isMissingTable(error) {
  if (!error) return false
  const msg = error.message || ''
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    /relation .* does not exist/i.test(msg) ||
    /could not find the table/i.test(msg) ||
    /schema cache/i.test(msg)
  )
}

const SALON_BOOKING_COLUMNS =
  'id, customer_name, customer_email, customer_phone, booking_date, start_time, end_time, ' +
  'slot_key, num_people, hours, hourly_rate_snapshot, base_amount, extra_proyector, extra_montaje, ' +
  'extras_amount, total_amount, currency, status, notes, stripe_checkout_session_id, ' +
  'stripe_payment_intent_id, created_at, updated_at, paid_at'

/**
 * Reservas de salón que bloquean disponibilidad ese día: pagadas, o pendientes
 * creadas en los últimos 30 minutos (ventana de vigencia de la Checkout
 * Session). Las pendientes más viejas ya vencieron en Stripe y dejan de
 * contar solas.
 */
async function listSalonBookingRangesForDate(date) {
  const supabase = getSupabaseAdmin()
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('salon_bookings')
    .select('start_time, end_time, status, created_at')
    .eq('booking_date', date)
    .or(`status.eq.paid,and(status.eq.pending,created_at.gte.${thirtyMinAgo})`)
  if (error) {
    if (isMissingTable(error)) return []
    throw error
  }
  return (data || []).map((b) => ({ startTime: b.start_time, endTime: b.end_time }))
}

function timeStrToMinutes(t) {
  const [h, m] = String(t || '0:0').split(':').map(Number)
  return h * 60 + m
}

function minutesToTimeStr(totalMinutes) {
  const h = Math.floor(totalMinutes / 60) % 24
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Clases del horario regular ese día (activas y vigentes): el salón ya está
 * ocupado durante su horario, sin importar la franja de renta elegida.
 */
async function listClassScheduleRangesForDate(date) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('schedules')
    .select('scheduled_time, status, valid_from, valid_until, classes(duration_minutes)')
    .eq('scheduled_date', date)
    .eq('status', 'active')
  if (error) {
    if (isMissingTable(error)) return []
    throw error
  }
  return (data || [])
    .filter((s) => (!s.valid_from || date >= s.valid_from) && (!s.valid_until || date <= s.valid_until))
    .map((s) => {
      const startMin = timeStrToMinutes(s.scheduled_time)
      const duration = Number(s.classes?.duration_minutes) || 60
      return { startTime: minutesToTimeStr(startMin), endTime: minutesToTimeStr(startMin + duration) }
    })
}

/** Todo lo que ocupa el salón ese día: reservas de salón vigentes + clases activas del horario regular. */
async function listBlockingRangesForDate(date) {
  const [bookings, classes] = await Promise.all([
    listSalonBookingRangesForDate(date),
    listClassScheduleRangesForDate(date),
  ])
  return [...bookings, ...classes]
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart
}

/** true si [startTime, endTime) traslapa una reserva vigente o una clase ese día. */
export async function checkSalonOverlap({ date, startTime, endTime }) {
  const existing = await listBlockingRangesForDate(date)
  return existing.some((b) => rangesOverlap(startTime, endTime, b.startTime, b.endTime))
}

/** Público: rangos ya ocupados ese día (reservas + clases), para pintar el selector de horario. */
export async function listBookedRangesForDate(date) {
  return listBlockingRangesForDate(date)
}

export async function createPendingSalonBooking(fields) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('salon_bookings')
    .insert({
      customer_name: fields.customerName,
      customer_email: fields.customerEmail,
      customer_phone: fields.customerPhone || null,
      booking_date: fields.date,
      start_time: fields.startTime,
      end_time: fields.endTime,
      slot_key: fields.slotKey,
      num_people: fields.numPeople,
      hours: fields.hours,
      hourly_rate_snapshot: fields.hourlyRate,
      base_amount: fields.baseAmount,
      extra_proyector: !!fields.extraProyector,
      extra_montaje: !!fields.extraMontaje,
      extras_amount: fields.extrasAmount,
      total_amount: fields.totalAmount,
      currency: 'mxn',
      status: 'pending',
      notes: fields.notes || null,
    })
    .select(SALON_BOOKING_COLUMNS)
    .single()
  if (error) {
    if (isMissingTable(error)) throw new Error('Falta crear la tabla: corre server/sql/add_salon_bookings.sql en Supabase.')
    throw error
  }
  return data
}

export async function attachStripeSessionToBooking(id, sessionId) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('salon_bookings')
    .update({ stripe_checkout_session_id: sessionId, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error && !isMissingTable(error)) throw error
}

/**
 * Marca una reserva como pagada. Idempotente: solo actualiza si sigue en
 * 'pending', así un reintento del webhook no la vuelve a procesar.
 * Devuelve la fila actualizada, o null si ya estaba procesada (o no existe).
 */
export async function markSalonBookingPaid({ stripeCheckoutSessionId, stripePaymentIntentId }) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('salon_bookings')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stripe_payment_intent_id: stripePaymentIntentId || null,
    })
    .eq('stripe_checkout_session_id', stripeCheckoutSessionId)
    .eq('status', 'pending')
    .select(SALON_BOOKING_COLUMNS)
    .maybeSingle()
  if (error) {
    if (isMissingTable(error)) return null
    throw error
  }
  return data || null
}

export async function expireSalonBooking(stripeCheckoutSessionId) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('salon_bookings')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .eq('stripe_checkout_session_id', stripeCheckoutSessionId)
    .eq('status', 'pending')
  if (error && !isMissingTable(error)) throw error
}

export async function getSalonBookingBySessionId(sessionId) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('salon_bookings')
    .select(SALON_BOOKING_COLUMNS)
    .eq('stripe_checkout_session_id', sessionId)
    .maybeSingle()
  if (error) {
    if (isMissingTable(error)) return null
    throw error
  }
  return data || null
}

export async function listAllSalonBookings() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('salon_bookings')
    .select(SALON_BOOKING_COLUMNS)
    .order('booking_date', { ascending: false })
    .order('start_time', { ascending: false })
  if (error) {
    if (isMissingTable(error)) return []
    throw error
  }
  return data || []
}

// ---- Solicitudes especiales ("sobre horario de clase") ----

function sanitizeSpecialRequestInput(body = {}) {
  const out = {}
  if (body.customerName !== undefined) out.customer_name = String(body.customerName || '').trim()
  if (body.customerEmail !== undefined) out.customer_email = String(body.customerEmail || '').trim().toLowerCase()
  if (body.customerPhone !== undefined) out.customer_phone = body.customerPhone ? String(body.customerPhone).trim() : null
  if (body.desiredDate !== undefined) out.desired_date = body.desiredDate || null
  if (body.desiredTime !== undefined) out.desired_time = body.desiredTime ? String(body.desiredTime).trim() : null
  if (body.durationHours !== undefined) out.duration_hours = body.durationHours ? Number(body.durationHours) : null
  if (body.numPeople !== undefined) out.num_people = body.numPeople ? parseInt(body.numPeople, 10) : null
  if (body.notes !== undefined) out.notes = body.notes ? String(body.notes).trim() : null
  return out
}

export async function createSalonSpecialRequest(body) {
  const supabase = getSupabaseAdmin()
  const input = sanitizeSpecialRequestInput(body)
  if (!input.customer_name || !input.customer_email) {
    throw new Error('Nombre y correo son obligatorios.')
  }
  const { data, error } = await supabase
    .from('salon_special_requests')
    .insert(input)
    .select('*')
    .single()
  if (error) {
    if (isMissingTable(error)) throw new Error('Falta crear la tabla: corre server/sql/add_salon_bookings.sql en Supabase.')
    throw error
  }
  return data
}

export async function listSalonSpecialRequests() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('salon_special_requests')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    if (isMissingTable(error)) return []
    throw error
  }
  return data || []
}

export async function updateSalonSpecialRequestStatus(id, status) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('salon_special_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()
  if (error) {
    if (isMissingTable(error)) throw new Error('Falta crear la tabla: corre server/sql/add_salon_bookings.sql en Supabase.')
    throw error
  }
  return data
}
