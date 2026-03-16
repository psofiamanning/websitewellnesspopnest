import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { hasCookieConsentAnswer, setCookieConsent, CONSENT_ACCEPTED, CONSENT_NECESSARY_ONLY, COOKIE_CONSENT_SHOW_EVENT } from '../utils/cookieConsent'
import { initMetaPixel, trackMetaPageView } from '../utils/metaPixel'

/**
 * Banner de consentimiento de cookies según prácticas en México (LFPDPPP).
 * Se muestra hasta que el usuario acepte o elija solo cookies necesarias.
 * Se puede reabrir desde el footer con "Preferencias de cookies" (evento popnest-show-cookie-consent).
 */
function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(!hasCookieConsentAnswer())
  }, [])

  useEffect(() => {
    const handler = () => setVisible(true)
    window.addEventListener(COOKIE_CONSENT_SHOW_EVENT, handler)
    return () => window.removeEventListener(COOKIE_CONSENT_SHOW_EVENT, handler)
  }, [])

  const handleAccept = () => {
    setCookieConsent(CONSENT_ACCEPTED)
    setVisible(false)
    initMetaPixel()
    trackMetaPageView()
  }

  const handleNecessaryOnly = () => {
    setCookieConsent(CONSENT_NECESSARY_ONLY)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] px-4 py-4 sm:px-6 sm:py-5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '2px solid #E5B3B0'
      }}
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 pr-0 sm:pr-4">
          <h2 id="cookie-consent-title" className="font-heading font-semibold text-base sm:text-lg mb-1" style={{ color: '#1F2937' }}>
            Uso de cookies
          </h2>
          <p id="cookie-consent-desc" className="font-body text-sm sm:text-base leading-relaxed" style={{ color: '#4B5563' }}>
            Utilizamos cookies propias y de terceros para el funcionamiento del sitio, la sesión de usuario y, si lo aceptas, para análisis y publicidad (Meta/Facebook). Puedes aceptar todas, o solo las necesarias. Más información en nuestra{' '}
            <Link to="/privacidad" className="underline font-medium hover:no-underline" style={{ color: '#B73D37' }}>
              política de privacidad
            </Link>.
          </p>
        </div>
        <div className="flex flex-col xs:flex-row gap-3 sm:flex-shrink-0">
          <button
            type="button"
            onClick={handleNecessaryOnly}
            className="font-body font-medium px-5 py-2.5 rounded-lg border-2 transition-colors"
            style={{
              borderColor: '#D48D88',
              color: '#B73D37',
              backgroundColor: '#FFFFFF'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FEF3F2'
              e.currentTarget.style.borderColor = '#B73D37'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF'
              e.currentTarget.style.borderColor = '#D48D88'
            }}
          >
            Solo necesarias
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="font-body font-semibold px-5 py-2.5 rounded-lg transition-all shadow-md"
            style={{
              backgroundColor: '#B73D37',
              color: '#FFFFFF',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#8B2E29'
              e.currentTarget.style.transform = 'scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#B73D37'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  )
}

export default CookieConsent
