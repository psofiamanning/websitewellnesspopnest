/**
 * Consentimiento de cookies – prácticas en México (LFPDPPP).
 * Almacena la preferencia del usuario para no volver a mostrar el banner.
 */

const STORAGE_KEY = 'popnest_cookie_consent'

/** Nombre del evento para reabrir el banner desde el footer (Preferencias de cookies). */
export const COOKIE_CONSENT_SHOW_EVENT = 'popnest-show-cookie-consent'

export const CONSENT_ACCEPTED = 'accepted'
export const CONSENT_NECESSARY_ONLY = 'necessary_only'

/**
 * Obtiene el valor guardado: 'accepted' | 'necessary_only' | null (sin respuesta aún).
 */
export function getCookieConsent() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

/**
 * Guarda la preferencia del usuario.
 * @param {'accepted' | 'necessary_only'} value
 */
export function setCookieConsent(value) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch (e) {
    console.warn('No se pudo guardar el consentimiento de cookies:', e)
  }
}

/** Indica si el usuario ya dio su respuesta (aceptar o solo necesarias). */
export function hasCookieConsentAnswer() {
  const v = getCookieConsent()
  return v === CONSENT_ACCEPTED || v === CONSENT_NECESSARY_ONLY
}

/** Indica si se pueden usar cookies de marketing/analíticas (Meta Pixel, etc.). */
export function canUseMarketingCookies() {
  return getCookieConsent() === CONSENT_ACCEPTED
}
