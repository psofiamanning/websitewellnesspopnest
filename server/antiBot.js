// Defensas contra bots en registro y recuperación de contraseña.
// En oct-2026 la mayoría de los registros eran bots que usaban nuestros correos
// (confirmación, bienvenida, recuperación) para mandar mensajes a terceros, lo que
// daña la entregabilidad para las clientas reales.
import rateLimit from 'express-rate-limit'

const MINUTE = 60 * 1000

const tooMany = (message) => ({
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`🛑 Rate limit ${req.method} ${req.path} ip=${req.ip}`)
    res.status(429).json({ success: false, error: message })
  },
})

const emailKey = (req) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  return email || `ip:${req.ip}`
}

// Por IP, holgado: en el estudio varias clientas se registran desde el mismo wifi.
export const signupIpLimiter = rateLimit({
  windowMs: 60 * MINUTE,
  limit: 10,
  ...tooMany('Demasiados registros desde esta conexión. Intenta de nuevo en una hora.'),
})

export const forgotIpLimiter = rateLimit({
  windowMs: 60 * MINUTE,
  limit: 10,
  ...tooMany('Demasiadas solicitudes desde esta conexión. Intenta de nuevo en una hora.'),
})

// Por correo: nadie necesita más de 3 enlaces de recuperación en una hora.
export const forgotEmailLimiter = rateLimit({
  windowMs: 60 * MINUTE,
  limit: 3,
  keyGenerator: emailKey,
  ...tooMany('Ya te enviamos varios enlaces. Revisa tu bandeja (y spam) o intenta de nuevo en una hora.'),
})

// Reenvío del enlace de confirmación desde el login: uno cada 10 minutos por correo.
const confirmResends = new Map()
export function canResendConfirm(email) {
  const now = Date.now()
  const last = confirmResends.get(email)
  if (last && now - last < 10 * MINUTE) return false
  confirmResends.set(email, now)
  if (confirmResends.size > 5000) {
    for (const [k, t] of confirmResends) if (now - t >= 10 * MINUTE) confirmResends.delete(k)
  }
  return true
}

// Honeypot + tiempo mínimo de llenado que manda el formulario.
// Devuelve null si pasa; si no, { status, body } para responder.
// Si el honeypot viene lleno se responde como si todo hubiera salido bien, para no dar
// pistas. Si fue demasiado rápido se avisa: podría ser una persona con autocompletado.
export function checkFormSignals(req, { minMs, fakeSuccess }) {
  const { website, elapsedMs } = req.body || {}
  if (typeof website === 'string' && website.trim()) {
    console.warn(`🤖 Honeypot lleno en ${req.path} ip=${req.ip}`)
    return { status: 200, body: fakeSuccess }
  }
  if (typeof elapsedMs !== 'number' || !Number.isFinite(elapsedMs)) {
    // Bots que llaman la API directo, o una pestaña con la versión anterior del sitio.
    console.warn(`🤖 Sin elapsedMs en ${req.path} ip=${req.ip}`)
    return {
      status: 400,
      body: { success: false, error: 'Recarga la página e intenta de nuevo.' },
    }
  }
  if (elapsedMs < minMs) {
    console.warn(`🤖 Formulario llenado en ${elapsedMs} ms en ${req.path} ip=${req.ip}`)
    return {
      status: 400,
      body: { success: false, error: 'Espera unos segundos y vuelve a intentarlo.' },
    }
  }
  return null
}

// Los nombres van dentro de nuestros correos: un bot puede poner ahí un enlace o un
// anuncio y usarnos para mandarlo. Solo permitimos texto que parezca un nombre.
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'\-]{0,49}$/u
export function isValidPersonName(name) {
  if (typeof name !== 'string') return false
  const n = name.trim()
  return NAME_RE.test(n) && !/\p{L}\.\p{L}{2,}/u.test(n) // sin dominios tipo «bit.ly»
}

export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
