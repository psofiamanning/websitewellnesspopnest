import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { classTypes } from '../data/classes'
import { SINGLE_CLASS_PRICE_MXN } from '../config/pricing'
import { dotClassForClassId } from '../utils/redesignScheduleFromData'
import Logo from '../components/Logo'
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
    const el = document.getElementById(`cl-class-${classId}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const n = classTypes.length

  return (
    <div className="cl-page">
      <div className="cl-shell">
        <nav className={`cl-nav${navOpen ? ' cl-nav--open' : ''}`}>
          <Link to="/" className="pn-nav__logo pn-nav__logo--official" style={{ textDecoration: 'none' }}>
            <Logo height="42px" variant="primary" style={{ maxWidth: '200px' }} />
          </Link>
          <div className="cl-nav__links">
            <Link to="/classes" className="cl-nav__link" onClick={() => setNavOpen(false)}>
              Prácticas (actual)
            </Link>
            <Link to="/horario" className="cl-nav__link" onClick={() => setNavOpen(false)}>
              Horario
            </Link>
            <Link to="/classes" className="pn-btn pn-btn--primary pn-btn--sm" onClick={() => setNavOpen(false)}>
              Reservar
            </Link>
          </div>
          <button
            type="button"
            className="cl-menu"
            aria-label={navOpen ? 'Cerrar menú' : 'Menú'}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </nav>

        <header className="cl-hero">
          <div>
            <div className="pn-eyebrow" style={{ marginBottom: 16 }}>
              Vista previa · rediseño
            </div>
            <h1 className="cl-hero__title">
              Elige tu <span className="pn-serif" style={{ color: 'var(--pn-color-primary)' }}>práctica.</span>
            </h1>
            <p className="pn-text-lg cl-hero__lead">
              Cada disciplina tiene su propia energía: fuerza, escucha, ritmo o silencio. Reserva en línea; la ruta
              pública sigue siendo <strong>/classes</strong>.
            </p>
          </div>
          <aside className="cl-hero-aside" aria-label="En resumen">
            <div className="cl-hero-stat">
              <strong>{n}</strong>
              <span>disciplinas</span>
            </div>
            <div className="cl-hero-stat">
              <strong>60</strong>
              <span>min por sesión</span>
            </div>
            <div className="cl-hero-stat">
              <strong>CDMX</strong>
              <span>Coyoacán</span>
            </div>
          </aside>
        </header>

        <div className="cl-rail">
          <div className="cl-rail__inner">
            <span className="cl-rail__label">Ir a</span>
            {classTypes.map((c) => (
              <button key={c.id} type="button" className="cl-chip" onClick={() => scrollToClass(c.id)}>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <main className="cl-body">
          <div className="cl-practice-grid">
            {classTypes.map((c) => {
              const dot = dotClassForClassId(c.id)
              return (
                <Link
                  key={c.id}
                  id={`cl-class-${c.id}`}
                  to={`/booking/class/${c.id}`}
                  className="pn-practice-card"
                >
                  <div className="pn-practice-card__image pn-practice-card__image--class-icon">
                    <img src={c.image} alt="" loading="lazy" decoding="async" />
                  </div>
                  <div className="cl-pcard__head">
                    <span className={`pn-dot pn-dot--${dot}`} aria-hidden />
                    <h2 className="pn-h4">{c.name}</h2>
                  </div>
                  <p className="cl-pcard__meta">
                    {c.teacher} · {c.duration} min
                  </p>
                  <p className="cl-pcard__desc">{c.description}</p>
                  <p className="cl-pcard__price">${SINGLE_CLASS_PRICE_MXN.toFixed(0)} MXN · clase</p>
                  <span className="pn-practice-card__arrow">Reservar →</span>
                </Link>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}

export default ClassesRedesign
