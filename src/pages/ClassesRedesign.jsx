import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { classTypes } from '../data/classes'
import { SINGLE_CLASS_PRICE_MXN } from '../config/pricing'
import { dotClassForClassId } from '../utils/redesignScheduleFromData'
import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/components.css'
import '../styles/classesShell.css'

function ClassesRedesign() {
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  const scrollToClass = (classId) => {
    const el = document.getElementById(`cr-class-${classId}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="cr-page">
      <div className="cr-shell">
        <nav className={`cr-nav${navOpen ? ' cr-nav--open' : ''}`}>
          <Link to="/" className="pn-nav__logo" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="pn-serif pn-nav__logo-e">e</span>
            <span className="pn-nav__logo-name">studio popnest</span>
          </Link>
          <div className="cr-nav__links">
            <Link to="/classes" className="cr-nav__link" onClick={() => setNavOpen(false)}>
              Prácticas (actual)
            </Link>
            <Link to="/horario" className="cr-nav__link" onClick={() => setNavOpen(false)}>
              Horario
            </Link>
            <Link to="/coaches" className="cr-nav__link" onClick={() => setNavOpen(false)}>
              Maestras
            </Link>
            <Link to="/classes" className="pn-btn pn-btn--primary pn-btn--sm" onClick={() => setNavOpen(false)}>
              Reservar
            </Link>
          </div>
          <button
            type="button"
            className="cr-menu"
            aria-label={navOpen ? 'Cerrar menú' : 'Menú'}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </nav>

        <header className="cr-hero">
          <div className="pn-eyebrow" style={{ marginBottom: 16 }}>
            Vista previa · rediseño
          </div>
          <h1 className="cr-title">
            Todas las <span className="pn-serif" style={{ color: 'var(--pn-color-primary)' }}>prácticas.</span>
          </h1>
          <p className="pn-text-lg cr-lead">
            Yoga, pilates, meditación, sound healing y tai chi en Coyoacán. Elige una clase y reserva en línea; esta
            página es solo diseño — la ruta pública sigue siendo <strong>/classes</strong>.
          </p>
          <div className="cr-chips">
            {classTypes.map((c) => (
              <button key={c.id} type="button" className="cr-chip" onClick={() => scrollToClass(c.id)}>
                {c.name}
              </button>
            ))}
          </div>
        </header>

        <main className="cr-main">
          <div className="cr-grid">
            {classTypes.map((c) => (
              <article key={c.id} id={`cr-class-${c.id}`} className="cr-card">
                <div className="cr-card__media">
                  <img src={c.image} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="cr-card__body">
                  <div className="cr-card__head">
                    <span className={`pn-dot pn-dot--${dotClassForClassId(c.id)}`} aria-hidden />
                    <h2 className="cr-card__name">{c.name}</h2>
                  </div>
                  <p className="cr-meta">
                    <strong>Coach:</strong> {c.teacher}
                    <br />
                    <strong>Duración:</strong> {c.duration} min
                  </p>
                  <p className="pn-text cr-meta">{c.description}</p>
                  <p className="cr-price">${SINGLE_CLASS_PRICE_MXN.toFixed(0)} MXN · clase individual</p>
                  <div className="cr-actions">
                    <Link to={`/booking/class/${c.id}`} className="pn-btn pn-btn--ghost">
                      Ver más
                    </Link>
                    <Link to={`/booking/class/${c.id}`} className="pn-btn pn-btn--primary">
                      Reservar
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default ClassesRedesign
