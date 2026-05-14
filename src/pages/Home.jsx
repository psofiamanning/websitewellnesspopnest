import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import studioPhoto1 from '../assets/studio-photo-1.png'
import studioPhoto2 from '../assets/studio-photo-2.png'
import studioPhoto3 from '../assets/studio-photo-3.png'
import studioPhoto4 from '../assets/studio-photo-4.png'
import { buildRedesignScheduleSnippets } from '../utils/redesignScheduleFromData'
import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/components.css'
import '../styles/homeShell.css'

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Londres+105,+Del+Carmen,+Coyoacán,+04100+Ciudad+de+México,+CDMX'
const WA_WELLNESS =
  'https://wa.me/525554379644?text=' + encodeURIComponent('Hola, me interesa wellness corporativo para equipos.')

const SPACE_SLIDES = [
  { src: studioPhoto1, alt: 'Espacio de meditación y práctica', ey: 'Amplitud y luz', em: 'Para verse y sentirse mejor' },
  { src: studioPhoto3, alt: 'Espacio tranquilo', ey: 'Acústica cuidada', em: 'Silencio que sostiene la práctica' },
  { src: studioPhoto4, alt: 'Vista del estudio', ey: 'El estudio', em: 'Un refugio en Del Carmen' },
  { src: studioPhoto2, alt: 'Ambiente del estudio', ey: 'Detalle del salón', em: 'Materiales y calma' },
]

function Home() {
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)
  const sliderRef = useRef(null)
  const nextBtnRef = useRef(null)

  const scheduleSnippets = useMemo(() => buildRedesignScheduleSnippets(new Date()), [])

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        window.requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      }
    }
  }, [location.hash, location.pathname])

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const track = sliderRef.current
    const btn = nextBtnRef.current
    if (!track || !btn) return
    const onNext = () => {
      const w = track.clientWidth
      const maxScroll = track.scrollWidth - w - 1
      if (maxScroll <= 0) return
      if (track.scrollLeft >= maxScroll - 2) {
        track.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        track.scrollBy({ left: w, behavior: 'smooth' })
      }
    }
    btn.addEventListener('click', onNext)
    return () => btn.removeEventListener('click', onNext)
  }, [])

  return (
    <div className="home-page">
      <div className="home-shell">
        <nav className={`home-nav${navOpen ? ' home-nav--open' : ''}`}>
          <Link to="/" className="pn-nav__logo" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="pn-serif pn-nav__logo-e">e</span>
            <span className="pn-nav__logo-name">studio popnest</span>
          </Link>
          <div className="home-nav__links">
            <Link to="/classes" className="home-nav__link" onClick={() => setNavOpen(false)}>
              Prácticas
            </Link>
            <Link to="/horario" className="home-nav__link" onClick={() => setNavOpen(false)}>
              Horario
            </Link>
            <Link to="/coaches" className="home-nav__link" onClick={() => setNavOpen(false)}>
              Maestras
            </Link>
            <Link to="/ubicacion" className="home-nav__link" onClick={() => setNavOpen(false)}>
              Contacto
            </Link>
            <Link to="/classes" className="pn-btn pn-btn--primary pn-btn--sm" onClick={() => setNavOpen(false)}>
              Reservar
            </Link>
          </div>
          <button
            type="button"
            className="home-menu"
            aria-label={navOpen ? 'Cerrar menú' : 'Menú'}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </nav>

        <main>
          <section className="home-hero">
            <div className="home-hero__copy">
              <div className="pn-eyebrow" style={{ marginBottom: 20 }}>
                Estudio de bienestar en Coyoacán
              </div>
              <h1 className="home-hero__title">
                Respirar,
                <br />
                mover,
                <br />
                <span className="pn-serif" style={{ color: 'var(--pn-color-primary)' }}>
                  reconectar.
                </span>
              </h1>
              <p className="pn-text-lg home-hero__body">
                Un estudio boutique de yoga, pilates y meditación para volver al cuerpo, bajar el ritmo y practicar con
                calma.
              </p>
              <div className="home-hero__actions">
                <Link to="/classes" className="pn-btn pn-btn--primary">
                  Reservar una clase
                </Link>
                <Link to="/classes" className="pn-btn pn-btn--ghost">
                  Explorar prácticas
                </Link>
              </div>
            </div>

            <aside
              className="home-today"
              dangerouslySetInnerHTML={{ __html: scheduleSnippets.homeTodayAside }}
            />
          </section>

          <section className="home-section pn-section--bg-secondary">
            <div className="home-section__head">
              <div>
                <div className="pn-eyebrow" style={{ marginBottom: 16 }}>
                  Lo que practicamos
                </div>
                <h2 className="pn-h1">
                  Nuestras <span className="pn-serif" style={{ color: 'var(--pn-color-primary)' }}>prácticas.</span>
                </h2>
              </div>
              <p className="pn-text">
                Cada práctica propone una manera distinta de habitar el cuerpo: fuerza, pausa, respiración, escucha y
                presencia.
              </p>
            </div>

            <div className="home-practices">
              <Link to="/horario" className="home-practice-card">
                <div className="home-practice-card__top">
                  <span className="pn-dot pn-dot--yoga" />
                  <h3 className="pn-h4">Yoga</h3>
                </div>
                <p className="pn-text-sm">Hatha, Vinyasa y prácticas suaves para respirar mejor.</p>
                <span className="home-practice-card__arrow">Ver horarios →</span>
              </Link>
              <Link to="/horario" className="home-practice-card">
                <div className="home-practice-card__top">
                  <span className="pn-dot pn-dot--pilates" />
                  <h3 className="pn-h4">Pilates</h3>
                </div>
                <p className="pn-text-sm">Fuerza, centro y movilidad con atención precisa.</p>
                <span className="home-practice-card__arrow">Ver horarios →</span>
              </Link>
              <Link to="/horario" className="home-practice-card">
                <div className="home-practice-card__top">
                  <span className="pn-dot pn-dot--meditation" />
                  <h3 className="pn-h4">Meditación</h3>
                </div>
                <p className="pn-text-sm">Espacios para bajar el ritmo y volver al presente.</p>
                <span className="home-practice-card__arrow">Ver horarios →</span>
              </Link>
              <Link to="/horario" className="home-practice-card">
                <div className="home-practice-card__top">
                  <span className="pn-dot pn-dot--sound" />
                  <h3 className="pn-h4">Sound Healing</h3>
                </div>
                <p className="pn-text-sm">Sesiones sonoras para descansar el sistema nervioso.</p>
                <span className="home-practice-card__arrow">Ver horarios →</span>
              </Link>
            </div>
          </section>

          <section id="sobre-nosotros" className="home-about-phil">
            <div className="pn-eyebrow" style={{ marginBottom: 16 }}>
              Sobre el estudio
            </div>
            <h2 className="pn-h1">
              Nuestra <span className="pn-serif" style={{ color: 'var(--pn-color-primary)' }}>filosofía.</span>
            </h2>
            <div className="home-about-phil__copy">
              <p className="pn-text">
                Creemos en el bienestar como una pausa honesta: grupos reducidos, maestras presentes y un ritmo que
                respeta al cuerpo. Aquí la práctica importa tanto como el descanso.
              </p>
              <p className="pn-text">
                Trabajamos con presencia, silencio compartido y la idea de que cada clase sea un momento real para
                volver a ti — sin prisa, con intención.
              </p>
            </div>
            <div className="home-about-phil__stats">
              <div className="home-about-phil__stat">
                <strong>8</strong>
                <span>personas por clase</span>
              </div>
              <div className="home-about-phil__stat">
                <strong>5</strong>
                <span>prácticas distintas</span>
              </div>
              <div className="home-about-phil__stat">
                <strong>60 min</strong>
                <span>por sesión</span>
              </div>
            </div>
            <blockquote className="home-about-phil__quote">
              Un espacio para el cuerpo, en una ciudad que rara vez le da tiempo.
            </blockquote>
          </section>

          <section className="home-about-space">
            <div className="pn-eyebrow" style={{ marginBottom: 16 }}>
              02 · El lugar
            </div>
            <h2 className="pn-h1">
              El <span className="pn-serif" style={{ color: 'var(--pn-color-primary)' }}>espacio.</span>
            </h2>
            <p className="pn-text home-about-space__lead">
              Materiales nobles, concreto pulido y madera natural. Un salón pensado para la luz, el silencio y la
              escucha.
            </p>
            <div className="home-space-slider-wrap">
              <div className="home-space-slider__viewport">
                <div
                  ref={sliderRef}
                  id="home-space-slider"
                  className="home-space-slider__track"
                  tabIndex={0}
                  aria-label="Galería del estudio"
                >
                  {SPACE_SLIDES.map((slide) => (
                    <div key={slide.alt} className="home-space-slider__slide">
                      <img src={slide.src} alt={slide.alt} loading="lazy" decoding="async" />
                      <div className="home-about-space__label">
                        <span className="home-about-space__ey">{slide.ey}</span>
                        <em>{slide.em}</em>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                ref={nextBtnRef}
                className="home-space-slider__btn"
                aria-label="Ver siguiente imagen"
              >
                →
              </button>
              <p className="home-space-slider__hint">Desliza o usa la flecha · misma galería que la web</p>
            </div>
            <div className="home-about-space__pillars">
              <div className="home-about-space__pillar">
                <div className="home-about-space__pillar-num">01</div>
                <h3>Diseñado con cuidado</h3>
                <p>Madera, textura y proporciones pensadas para que el cuerpo se ubique sin esfuerzo.</p>
              </div>
              <div className="home-about-space__pillar">
                <div className="home-about-space__pillar-num">02</div>
                <h3>Una energía cálida</h3>
                <p>Ambiente cálido y abierto: menos ruido, más escucha.</p>
              </div>
              <div className="home-about-space__pillar">
                <div className="home-about-space__pillar-num">03</div>
                <h3>En el centro, lejos del bullicio</h3>
                <p>Del Carmen, Coyoacán: un refugio tranquilo a pasos de la vida de la colonia.</p>
              </div>
              <div className="home-about-space__pillar">
                <div className="home-about-space__pillar-num">04</div>
                <h3>Una hora para ti</h3>
                <p>Sin distracciones. Sin prisa. Solo presencia y la práctica como prioridad.</p>
              </div>
            </div>
          </section>

          <section className="home-about-locate">
            <div className="pn-eyebrow pn-eyebrow--on-dark" style={{ marginBottom: 16 }}>
              03 · Dónde nos encuentras
            </div>
            <div className="home-about-locate__grid">
              <div className="home-about-locate__copy">
                <h2 className="pn-h1" style={{ color: 'var(--pn-color-on-dark)' }}>
                  En el corazón de <span className="pn-serif" style={{ color: 'var(--pn-color-primary)' }}>Coyoacán.</span>
                </h2>
                <p className="pn-text-lg" style={{ marginTop: 22, color: 'var(--pn-color-on-dark-muted)' }}>
                  Estamos al fondo de un lugar que combina galería de arte, cafetería y espacio de coworking. Ahí,
                  apartado del paso, está nuestro salón de yoga y meditación.
                </p>
              </div>
              <a
                className="home-about-locate__visual"
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir ubicación en Google Maps"
              >
                <img src={studioPhoto1} alt="Espacio de meditación y práctica en Del Carmen" loading="lazy" decoding="async" />
                <div className="home-about-locate__pin">
                  <span className="home-about-locate__ey">Visítanos</span>
                  <strong>Londres 105</strong>
                </div>
              </a>
            </div>
            <dl className="home-about-locate__details">
              <div className="home-about-locate__row">
                <dt>Dirección</dt>
                <dd>Londres 105, Del Carmen</dd>
              </div>
              <div className="home-about-locate__row">
                <dt>Alcaldía</dt>
                <dd>Coyoacán, CDMX · 04100</dd>
              </div>
              <div className="home-about-locate__row">
                <dt>A pasos de</dt>
                <dd>
                  <em>Plaza Hidalgo</em> y el centro de Coyoacán
                </dd>
              </div>
            </dl>
          </section>

          <section id="horarios" className="home-section">
            <div className="home-section__head">
              <div>
                <div className="pn-eyebrow" style={{ marginBottom: 16 }}>
                  Programa semanal
                </div>
                <h2 className="pn-h1">
                  Próximas <span className="pn-serif" style={{ color: 'var(--pn-color-primary)' }}>clases.</span>
                </h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Link to="/horario" className="pn-btn pn-btn--ghost">
                  Ver horario completo
                </Link>
              </div>
            </div>
            <div className="home-classes" dangerouslySetInnerHTML={{ __html: scheduleSnippets.homeWeekStrip }} />
          </section>

          <section id="preguntas-frecuentes" className="home-section home-faq pn-section--bg-secondary">
            <div className="pn-eyebrow" style={{ marginBottom: 16 }}>
              Dudas comunes
            </div>
            <h2 className="pn-h1">
              Preguntas <span className="pn-serif" style={{ color: 'var(--pn-color-primary)' }}>frecuentes.</span>
            </h2>
            <dl className="home-faq__list">
              <div className="home-faq__row">
                <dt>¿Dónde está el estudio?</dt>
                <dd>
                  Estamos en <strong>Coyoacán, CDMX</strong> — Colonia Del Carmen, en Londres 105. Es un espacio que
                  comparte entrada con galería, cafetería y coworking.{' '}
                  <Link to="/ubicacion">Ver cómo llegar</Link>.
                </dd>
              </div>
              <div className="home-faq__row">
                <dt>¿Cómo reservo una clase?</dt>
                <dd>
                  Elige tu clase en <Link to="/classes">Clases</Link>, selecciona fecha y hora, completa tus datos y
                  pago. Recibirás confirmación por correo.
                </dd>
              </div>
              <div className="home-faq__row">
                <dt>¿Dudas sobre reservas, paquetes o pagos?</dt>
                <dd>
                  Escríbenos por{' '}
                  <a href="mailto:info@estudiopopnest.com">correo</a> o{' '}
                  <a href="https://wa.me/525554379644" target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                  .
                </dd>
              </div>
            </dl>
          </section>

          <section className="home-work">
            <div>
              <div className="pn-eyebrow" style={{ marginBottom: 16 }}>
                También para equipos
              </div>
              <h2 className="pn-h1">
                Trabajar también es <span className="pn-serif" style={{ color: 'var(--pn-color-primary)' }}>cuidarse.</span>
              </h2>
              <p className="pn-text" style={{ marginTop: 18 }}>
                Llevamos prácticas de bienestar a empresas que quieren ofrecer pausas reales a sus equipos.
              </p>
              <a href={WA_WELLNESS} className="pn-btn pn-btn--primary" style={{ marginTop: 26 }} target="_blank" rel="noopener noreferrer">
                Ver wellness
              </a>
            </div>
            <div>
              <div className="home-work__item">
                <span className="home-work__num">01</span>
                <p className="pn-text-sm">Sesiones de movimiento, meditación y respiración para equipos.</p>
                <span>→</span>
              </div>
              <div className="home-work__item">
                <span className="home-work__num">02</span>
                <p className="pn-text-sm">Programas mensuales diseñados según el ritmo de tu oficina.</p>
                <span>→</span>
              </div>
              <div className="home-work__item">
                <span className="home-work__num">03</span>
                <p className="pn-text-sm">Prácticas guiadas por coaches de Estudio Popnest.</p>
                <span>→</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default Home
