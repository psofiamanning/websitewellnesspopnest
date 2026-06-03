import { getSupabaseAdmin } from './supabaseClient.js'

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Guarda un correo capturado por el popup de clase gratis.
 * Idempotente: si el correo ya estaba registrado para la misma oferta,
 * lo trata como éxito (alreadyRegistered: true).
 */
export async function saveLeadEmail({ email, source, offer }) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail || !EMAIL_RE.test(normalizedEmail)) {
    return { ok: false, error: 'Correo electrónico no válido.' }
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('lead_emails').insert({
    email: normalizedEmail,
    source: source || 'free_class_popup',
    offer: offer || 'clase_gratis',
  })

  if (error) {
    if (error.code === '23505') {
      // Ya registrado: sigue contando como éxito para el usuario.
      return { ok: true, alreadyRegistered: true }
    }
    if (error.code === '42P01') {
      throw new Error(
        'La tabla lead_emails no existe. Ejecuta server/sql/add_lead_emails.sql en Supabase.'
      )
    }
    throw error
  }

  return { ok: true, alreadyRegistered: false }
}
