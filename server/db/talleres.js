// Capa de datos para Talleres (workshops). Contenido editable desde /admin.
import { getSupabaseAdmin } from './supabaseClient.js'

const TALLER_BUCKET = 'talleres'

/** La tabla puede no existir todavía (falta correr add_talleres.sql). */
function isMissingTable(error) {
  if (!error) return false
  const msg = error.message || ''
  return (
    error.code === '42P01' ||        // Postgres: relation does not exist
    error.code === 'PGRST205' ||     // PostgREST: table not found in schema cache
    /relation .* does not exist/i.test(msg) ||
    /could not find the table/i.test(msg) ||
    /schema cache/i.test(msg)
  )
}

const TALLER_COLUMNS =
  'id, title, tema, descripcion, comida, price, image_url, fecha, hora, lugar, spots_total, spots_available, is_active, payment_link, created_at, updated_at'

/** Talleres publicados (para la web pública), próximos primero. */
export async function listActiveTalleres() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('talleres')
    .select(TALLER_COLUMNS)
    .eq('is_active', true)
    .order('fecha', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (error) {
    if (isMissingTable(error)) return []
    throw error
  }
  return data || []
}

/** Todos los talleres (panel admin), incluidos borradores. */
export async function listAllTalleres() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('talleres')
    .select(TALLER_COLUMNS)
    .order('created_at', { ascending: false })
  if (error) {
    if (isMissingTable(error)) return []
    throw error
  }
  return data || []
}

export async function getTallerById(id) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('talleres')
    .select(TALLER_COLUMNS)
    .eq('id', id)
    .maybeSingle()
  if (error) {
    if (isMissingTable(error)) return null
    throw error
  }
  return data || null
}

/** Sólo los campos permitidos; evita inyectar columnas raras desde el cliente. */
function sanitizeTallerInput(body = {}) {
  const out = {}
  if (body.title !== undefined) out.title = String(body.title).trim()
  if (body.tema !== undefined) out.tema = body.tema ? String(body.tema).trim() : null
  if (body.descripcion !== undefined) out.descripcion = body.descripcion ? String(body.descripcion).trim() : null
  if (body.comida !== undefined) out.comida = body.comida ? String(body.comida).trim() : null
  if (body.price !== undefined) out.price = Number(body.price) || 0
  if (body.image_url !== undefined) out.image_url = body.image_url ? String(body.image_url) : null
  if (body.fecha !== undefined) out.fecha = body.fecha || null
  if (body.hora !== undefined) out.hora = body.hora ? String(body.hora).trim() : null
  if (body.lugar !== undefined) out.lugar = body.lugar ? String(body.lugar).trim() : null
  if (body.spots_total !== undefined) out.spots_total = Math.max(0, parseInt(body.spots_total, 10) || 0)
  if (body.is_active !== undefined) out.is_active = !!body.is_active
  if (body.payment_link !== undefined) out.payment_link = body.payment_link ? String(body.payment_link).trim() : null
  return out
}

export async function createTaller(body) {
  const supabase = getSupabaseAdmin()
  const input = sanitizeTallerInput(body)
  if (!input.title) throw new Error('El título es obligatorio.')
  // Al crear, los lugares disponibles arrancan igual que el total.
  if (input.spots_total !== undefined) input.spots_available = input.spots_total
  const { data, error } = await supabase
    .from('talleres')
    .insert(input)
    .select(TALLER_COLUMNS)
    .single()
  if (error) {
    if (isMissingTable(error)) throw new Error('Falta crear la tabla: corre server/sql/add_talleres.sql en Supabase.')
    throw error
  }
  return data
}

export async function updateTaller(id, body) {
  const supabase = getSupabaseAdmin()
  const patch = sanitizeTallerInput(body)
  patch.updated_at = new Date().toISOString()

  // Si cambia el cupo total, ajusta los disponibles conservando los ya vendidos.
  if (patch.spots_total !== undefined) {
    const current = await getTallerById(id)
    if (current) {
      const sold = Math.max(0, (current.spots_total || 0) - (current.spots_available || 0))
      patch.spots_available = Math.max(0, patch.spots_total - sold)
    }
  }

  const { data, error } = await supabase
    .from('talleres')
    .update(patch)
    .eq('id', id)
    .select(TALLER_COLUMNS)
    .single()
  if (error) {
    if (isMissingTable(error)) throw new Error('Falta crear la tabla: corre server/sql/add_talleres.sql en Supabase.')
    throw error
  }
  return data
}

export async function deleteTaller(id) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('talleres').delete().eq('id', id)
  if (error) {
    if (isMissingTable(error)) return { deleted: false }
    throw error
  }
  return { deleted: true }
}

/** Resta un lugar de forma segura vía función SQL. Devuelve la fila o null si no hay cupo. */
export async function decrementTallerSpot(id) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.rpc('decrement_taller_spot', { p_taller_id: id })
  if (error) {
    if (isMissingTable(error)) throw new Error('Falta crear la tabla/función: corre server/sql/add_talleres.sql en Supabase.')
    throw error
  }
  // rpc devuelve la fila (objeto) o null si no pudo restar.
  return data || null
}

export async function createTallerBooking(booking) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('taller_bookings')
    .insert({
      taller_id: booking.tallerId ?? null,
      taller_title: booking.tallerTitle ?? null,
      customer_name: booking.customerName ?? null,
      customer_email: booking.customerEmail ?? null,
      customer_phone: booking.customerPhone ?? null,
      amount_paid: booking.amountPaid ?? null,
      currency: booking.currency ?? 'mxn',
      payment_status: booking.paymentStatus ?? null,
      stripe_payment_intent_id: booking.stripePaymentIntentId ?? null,
    })
    .select('*')
    .single()
  if (error) {
    if (isMissingTable(error)) throw new Error('Falta crear la tabla: corre server/sql/add_talleres.sql en Supabase.')
    throw error
  }
  return data
}

export async function listTallerBookings(tallerId) {
  const supabase = getSupabaseAdmin()
  let q = supabase.from('taller_bookings').select('*').order('created_at', { ascending: false })
  if (tallerId) q = q.eq('taller_id', tallerId)
  const { data, error } = await q
  if (error) {
    if (isMissingTable(error)) return []
    throw error
  }
  return data || []
}

/**
 * Sube una imagen (data URL base64) a Supabase Storage y devuelve la URL pública.
 * Crea el bucket público "talleres" si no existe.
 */
export async function uploadTallerImage(dataUrl, filename = 'taller') {
  const supabase = getSupabaseAdmin()
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl || '')
  if (!match) throw new Error('Imagen inválida: se espera un data URL base64 (image/*).')
  const contentType = match[1]
  const ext = (contentType.split('/')[1] || 'png').replace('jpeg', 'jpg')
  const buffer = Buffer.from(match[2], 'base64')

  // Asegurar bucket público (idempotente).
  try {
    await supabase.storage.createBucket(TALLER_BUCKET, { public: true })
  } catch (_e) {
    // Si ya existe, Supabase devuelve error; lo ignoramos.
  }

  const safe = String(filename).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'taller'
  const path = `${safe}-${buffer.length}.${ext}`

  const { error: upErr } = await supabase.storage
    .from(TALLER_BUCKET)
    .upload(path, buffer, { contentType, upsert: true })
  if (upErr) throw upErr

  const { data } = supabase.storage.from(TALLER_BUCKET).getPublicUrl(path)
  return data?.publicUrl || null
}
