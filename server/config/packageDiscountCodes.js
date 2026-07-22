/**
 * Códigos de descuento para PAQUETES (descuento porcentual sobre el precio del paquete).
 *
 * Estos son códigos de marcador de posición (placeholder). Cámbialos por los reales
 * editando DEFAULT_CODES o con la variable de entorno PACKAGE_DISCOUNT_CODES:
 *   VERANO50:50,AMIGO20:20   (CODIGO:porcentaje, separados por coma)
 */
// Códigos opacos: el porcentaje NO va en el texto del código para que no se adivinen.
// Alfabeto sin 0/O/1/I/L para evitar confusiones al leerlos/teclearlos.
const DEFAULT_CODES = [
  { code: 'PNWDAEGQP', percent: 50, label: '50% de descuento', active: true },
  { code: 'PNWU3M747', percent: 40, label: '40% de descuento', active: true },
  { code: 'PNWBVSWER', percent: 30, label: '30% de descuento', active: true },
  { code: 'PNWSNXMT9', percent: 20, label: '20% de descuento', active: true },
  { code: 'PNW8E4B6S', percent: 10, label: '10% de descuento', active: true },
]

function parseEnvPackageDiscountCodes() {
  const raw = process.env.PACKAGE_DISCOUNT_CODES
  if (!raw || !String(raw).trim()) return null
  return String(raw)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const sep = part.indexOf(':')
      if (sep === -1) return null
      const code = part.slice(0, sep).trim()
      const percent = Number(part.slice(sep + 1).trim())
      if (!code || !Number.isFinite(percent) || percent <= 0 || percent >= 100) return null
      return { code, percent, label: `${percent}% de descuento`, active: true }
    })
    .filter(Boolean)
}

let cachedCodes = null

export function getPackageDiscountCodes() {
  if (!cachedCodes) {
    cachedCodes = parseEnvPackageDiscountCodes() || DEFAULT_CODES
  }
  return cachedCodes.filter((c) => c.active !== false)
}

export function normalizePackageDiscountCode(code) {
  return String(code || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
}

export function findPackageDiscountCode(code) {
  const normalized = normalizePackageDiscountCode(code)
  if (!normalized) return null
  return getPackageDiscountCodes().find((c) => normalizePackageDiscountCode(c.code) === normalized) || null
}
