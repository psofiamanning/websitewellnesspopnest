/**
 * Códigos de descuento para clase gratis (una vez por cliente y por código).
 *
 * Variable de entorno opcional DISCOUNT_CODES:
 *   BIENVENIDA:Clase de bienvenida,POPNEST:Promoción Popnest
 */
const DEFAULT_CODES = [
  { code: 'BIENVENIDA', label: 'Clase de bienvenida gratis', active: true },
  { code: 'POPNEST', label: 'Clase promocional gratis', active: true },
]

function parseEnvDiscountCodes() {
  const raw = process.env.DISCOUNT_CODES
  if (!raw || !String(raw).trim()) return null
  return String(raw)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const sep = part.indexOf(':')
      if (sep === -1) {
        return { code: part, label: 'Clase gratis', active: true }
      }
      const code = part.slice(0, sep).trim()
      const label = part.slice(sep + 1).trim() || 'Clase gratis'
      return { code, label, active: true }
    })
}

/**
 * Reglas extra por código (aplican aunque los códigos vengan de DISCOUNT_CODES).
 * validDays: días para canjearlo, contados desde que el correo se dejó en el
 * popup (lead_emails con esa `leadOffer`).
 * graceFrom/graceUntil: al arrancar la vigencia (oct 2026), quien dejó su correo
 * desde graceFrom tiene al menos hasta graceUntil, aunque ya pasaran sus 14 días.
 */
export const FREE_CLASS_PROMO_VALID_DAYS = 14

const CODE_RULES = {
  POPNEST: {
    validDays: FREE_CLASS_PROMO_VALID_DAYS,
    leadOffer: 'clase_gratis',
    graceFrom: '2026-09-01T00:00:00-06:00',
    graceUntil: '2026-10-21T23:59:59-06:00',
  },
}

let cachedCodes = null

export function getDiscountCodes() {
  if (!cachedCodes) {
    cachedCodes = parseEnvDiscountCodes() || DEFAULT_CODES
  }
  return cachedCodes.filter((c) => c.active !== false)
}

export function normalizeDiscountCode(code) {
  return String(code || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
}

export function findDiscountCode(code) {
  const normalized = normalizeDiscountCode(code)
  if (!normalized) return null
  const def = getDiscountCodes().find((c) => normalizeDiscountCode(c.code) === normalized)
  if (!def) return null
  return { ...def, ...(CODE_RULES[normalizeDiscountCode(def.code)] || {}) }
}
