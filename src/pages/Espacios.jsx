import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/components.css'
import '../styles/espaciosShell.css'

/**
 * DESTINOS DE LAS DOS OPCIONES — punto único de edición.
 * `to` = ruta interna del sitio; `href` = link externo (otra web, WhatsApp, etc.).
 * Usa uno u otro en cada opción.
 */
const WELLNESS_LINK = { to: '/classes' }
const OFICINAS_LINK = {
  href:
    'https://wa.me/525554379644?text=' +
    encodeURIComponent('Hola, me interesa información sobre las oficinas en Popnest.'),
}

/** Renderiza la tarjeta como <Link> interno o <a> externo según el destino. */
function Door({ link, className, children }) {
  if (link.to) {
    return (
      <Link to={link.to} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <a href={link.href} className={className} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

/**
 * Portal interno (oculto) con dos accesos: Wellness y Oficinas.
 * No está enlazada desde el navbar, el footer ni el sitemap, y lleva
 * meta robots noindex (ver NOINDEX_PREFIXES en src/utils/seo.js).
 * Se comparte por link directo: https://popnest.app/espacios
 */
const CONSENT_SELECTOR = '[aria-labelledby="cookie-consent-title"]'

/**
 * Mide el banner de cookies y expone su altura en --esp-consent-h para que
 * el contenido quepa arriba de él (en móvil la página no hace scroll).
 */
function useConsentBannerHeight() {
  useEffect(() => {
    const root = document.documentElement
    const observer = new ResizeObserver(() => measure())
    let observed = null

    function measure() {
      const el = document.querySelector(CONSENT_SELECTOR)
      root.style.setProperty('--esp-consent-h', el ? `${el.offsetHeight}px` : '0px')
      if (el !== observed) {
        if (observed) observer.unobserve(observed)
        if (el) observer.observe(el)
        observed = el
      }
    }

    measure()
    // El banner aparece/desaparece según la respuesta del usuario.
    const mutations = new MutationObserver(() => measure())
    mutations.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutations.disconnect()
      root.style.removeProperty('--esp-consent-h')
    }
  }, [])
}

function Espacios() {
  useConsentBannerHeight()

  return (
    <div className="esp-page">
      <div className="esp-shell">
        <header className="esp-topbar">
          <Logo height="44px" />
        </header>

        {/* Título solo para lectores de pantalla: la página no muestra encabezado. */}
        <h1 className="esp-sr-only">Espacios Popnest</h1>

        <div className="esp-doors">
          <Door link={WELLNESS_LINK} className="esp-door">
            <div className="pn-eyebrow">01 · Practicar</div>
            <h2 className="pn-h2 esp-door__title">Wellness</h2>
            <p className="esp-door__sub">
              Clases en grupo en nuestro salón, con reserva en línea.
            </p>
            <ul className="esp-door__list">
              <li>Yoga</li>
              <li>Sound bath</li>
              <li>Meditación</li>
              <li>Pilates</li>
              <li>Tai chi</li>
              <li>Belly dance</li>
              <li>Talleres</li>
            </ul>
            <span className="esp-door__cta">Entrar →</span>
          </Door>

          <Door link={OFICINAS_LINK} className="esp-door esp-door--dark">
            <div className="pn-eyebrow pn-eyebrow--on-dark">02 · Trabajar</div>
            <h2 className="pn-h2 esp-door__title">Oficinas</h2>
            <p className="esp-door__sub">Espacio de trabajo en el mismo inmueble.</p>
            <ul className="esp-door__list">
              <li>Planes mensuales</li>
              <li>Planes diarios</li>
              <li>Paquetes</li>
              <li>Coworking</li>
              <li>Domicilio fiscal</li>
            </ul>
            <span className="esp-door__cta">Entrar →</span>
          </Door>
        </div>
      </div>

      <footer className="esp-foot">
        Estudio Popnest · Londres 105, Del Carmen, Coyoacán ·{' '}
        <a href="https://wa.me/525554379644" target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>
      </footer>
    </div>
  )
}

export default Espacios
