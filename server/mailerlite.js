/**
 * Integración con MailerLite (marketing / automatizaciones).
 *
 * Cuando alguien deja su correo en el popup, lo damos de alta como suscriptor
 * en MailerLite y lo metemos a un grupo. Ese grupo dispara la automatización
 * (correo de bienvenida / clase gratis) que TÚ armas en el panel de MailerLite.
 *
 * Config (variables de entorno en Railway):
 *   MAILERLITE_API_KEY   -> API key de MailerLite (Integrations -> API)
 *   MAILERLITE_GROUP_ID  -> ID del grupo al que entran (dispara la automatización)
 */

const MAILERLITE_API_KEY = (process.env.MAILERLITE_API_KEY || '').trim()
const MAILERLITE_GROUP_ID = (process.env.MAILERLITE_GROUP_ID || '').trim()
const ML_BASE = 'https://connect.mailerlite.com/api'

/** true si hay API key configurada (usamos MailerLite en vez del envío directo). */
export function isMailerLiteConfigured() {
  return Boolean(MAILERLITE_API_KEY)
}

/**
 * Alta/actualización de suscriptor en MailerLite (upsert por email, idempotente).
 * Si hay MAILERLITE_GROUP_ID, lo agrega a ese grupo para disparar la automatización.
 * @returns {Promise<{ ok: boolean, skipped?: boolean }>}
 */
export async function upsertMailerLiteSubscriber({ email, fields = {}, groups = [] } = {}) {
  if (!MAILERLITE_API_KEY) {
    console.warn('⚠️ MailerLite no configurado: falta MAILERLITE_API_KEY')
    return { ok: false, skipped: true }
  }
  if (!email) return { ok: false, skipped: true }

  const groupIds = [...groups]
  if (MAILERLITE_GROUP_ID) groupIds.push(MAILERLITE_GROUP_ID)

  const body = { email: String(email).trim().toLowerCase() }
  if (Object.keys(fields).length) body.fields = fields
  if (groupIds.length) body.groups = groupIds

  const res = await fetch(`${ML_BASE}/subscribers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${MAILERLITE_API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`MailerLite HTTP ${res.status}: ${text.slice(0, 300)}`)
  }
  return { ok: true }
}
