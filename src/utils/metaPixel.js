/**
 * Meta (Facebook) Pixel - inicialización y eventos para envío de leads a Meta.
 * Configura VITE_META_PIXEL_ID en .env con tu Pixel ID de Meta Events Manager.
 */

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID

export function getMetaPixelId() {
  return PIXEL_ID || null
}

/**
 * Carga el script del pixel e inicializa con tu ID. Llamar una vez al montar la app.
 */
export function initMetaPixel() {
  if (!PIXEL_ID || typeof window === 'undefined') return
  if (window.fbq) {
    window.fbq('track', 'PageView')
    return
  }
  const f = window
  const b = document
  const e = 'script'
  const v = 'https://connect.facebook.net/en_US/fbevents.js'
  const n = (f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
  })
  if (!f._fbq) f._fbq = n
  n.push = n
  n.loaded = !0
  n.version = '2.0'
  n.queue = []
  const t = b.createElement(e)
  t.async = !0
  t.src = v
  const s = b.getElementsByTagName(e)[0]
  s.parentNode.insertBefore(t, s)
  window.fbq('init', PIXEL_ID)
  window.fbq('track', 'PageView')
}

/**
 * Dispara un PageView (útil en SPA al cambiar de ruta).
 */
export function trackMetaPageView() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView')
  }
}

/**
 * Dispara el evento Lead para Meta (registro, reserva, compra de paquete).
 * @param {Object} [params] - { content_name?: string, value?: number, currency?: string }
 */
export function trackMetaLead(params = {}) {
  if (typeof window === 'undefined' || !window.fbq) return
  window.fbq('track', 'Lead', {
    content_name: params.content_name || 'lead',
    value: params.value != null ? params.value : 0,
    currency: params.currency || 'MXN'
  })
}
