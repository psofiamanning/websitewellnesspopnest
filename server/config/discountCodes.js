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
  return getDiscountCodes().find((c) => normalizeDiscountCode(c.code) === normalized) || null
}
