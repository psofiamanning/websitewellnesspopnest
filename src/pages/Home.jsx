import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import studioPhoto1 from '../assets/studio-photo-1.png'
import studioPhoto2 from '../assets/studio-photo-2.png'
import studioPhoto3 from '../assets/studio-photo-3.png'
import studioPhoto4 from '../assets/studio-photo-4.png'
import { classTypes } from '../data/classes'
import { getLandingSlugForClassId } from '../data/classLandings'
import { PACKAGE_OFFERS } from '../data/packageOffers'
import { buildRedesignScheduleSnippets, dotClassForClassId } from '../utils/redesignScheduleFromData'
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
    <div className="home-page pn-page-with-site-nav">
      <div className="home-shell">

        <main>
          <section id="inicio" className="home-hero">
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
                <a href="#clases" className="pn-btn pn-btn--ghost">
                  Ver clases
                </a>
              </div>
            </div>

            <aside
              className="home-today"
              dangerouslySetInnerHTML={{ __html: scheduleSnippets.homeTodayAside }}
            />
          </section>

          <section id="clases" className="home-section pn-section--bg-secondary">
            <div className="home-section__head">
              <div>
                <div className="pn-eyebrow" style={{ marginBottom: 16 }}>
                  01 · Clases
                </div>
                <h2 className="pn-h1">
                  Elige tu <span className="pn-serif" style={{ color: 'var(--pn-color-primary)' }}>práctica.</span>
                </h2>
              </div>
              <p className="pn-text">
                Yoga, pilates, meditación, sound healing y tai chi. Sesiones de 60 minutos en grupos reducidos.
              </p>
            </div>

            <div className="home-class-spotlights">
              {classTypes.map((c) => {
                const dot = dotClassForClassId(c.id)
                const landingSlug = getLandingSlugForClassId(c.id)
                return (
                  <article key={c.id} className="home-class-spotlight">
                    <Link to={`/booking/class/${c.id}`} className="home-class-spotlight__link">
                      <div className="home-class-spotlight__img">
                        <img src={c.image} alt="" loading="lazy" decoding="async" />
                      </div>
                      <div className="home-class-spotlight__body">
                        <div className="home-class-spotlight__head">
                          <span className={`pn-dot pn-dot--${dot}`} aria-hidden />
                          <h3 className="pn-h4">{c.name}</h3>
                        </div>
                        <p className="pn-text-sm">
                          {c.teacher} · {c.duration} min
                        </p>
                      </div>
                    </Link>
                    {landingSlug ? (
                      <Link to={`/clases/${landingSlug}`} className="home-class-spotlight__guide">
                        Guía · {c.name} en Coyoacán
                      </Link>
                    ) : null}
                  </article>
                )
              })}
            </div>
            <div className="home-section__cta">
              <Link to="/classes" className="pn-btn pn-btn--ghost">
                Ver todas las clases
              </Link>
            </div>
          </section>

          <section id="horario" className="home-section">
            <div className="home-section__head">
              <div>
                <div className="pn-eyebrow" style={{ marginBottom: 16 }}>
                  02 · Horario
                </div>
                <h2 className="pn-h1">
                  Esta <span className="pn-serif" style={{ color: 'var(--pn-color-primary)' }}>semana.</span>
                </h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Link to="/horario" className="pn-btn pn-btn--ghost">
                  Ver horario completo
                </Link>
              </div>
            </div>
            <p className="pn-text home-section__lead">
              Vista rápida del programa. Consulta el horario completo para reservar fecha y hora.
            </p>
            <div className="home-classes" dangerouslySetInnerHTML={{ __html: scheduleSnippets.homeWeekStrip }} />
          </section>

          <section id="planes" className="home-section pn-section--bg-secondary">
            <div className="home-section__head">
              <div>
                <div className="pn-eyebrow" style={{ marginBottom: 16 }}>
                  03 · Planes
                </div>
                <h2 className="pn-h1">
                  Paquetes de <span className="pn-serif" style={{ color: 'var(--pn-color-primary)' }}>clases.</span>
                </h2>
              </div>
              <p className="pn-text">
                Ahorra comprando varias sesiones. Usa tus clases cuando quieras, para cualquier práctica del estudio.
              </p>
            </div>
            <div className="home-packages">
              {PACKAGE_OFFERS.map((pkg) => (
                <Link
                  key={pkg.id}
                  to="/packages"
                  className={`home-package-card${pkg.popular ? ' home-package-card--popular' : ''}`}
                >
                  {pkg.popular ? <span className="home-package-card__badge">Más popular</span> : null}
                  <h3 className="pn-h4">{pkg.name}</h3>
                  <p className="home-package-card__price">
                    <strong>${pkg.price.toLocaleString('es-MX')}</strong> MXN
                  </p>
                  {pkg.originalPrice ? (
                    <p className="home-package-card__save">
                      Antes ${pkg.originalPrice.toLocaleString('es-MX')} MXN
                    </p>
                  ) : null}
                  <p className="pn-text-sm home-package-card__desc">{pkg.description}</p>
                  <span className="home-package-card__arrow">Ver planes →</span>
                </Link>
              ))}
            </div>
            <div className="home-section__cta">
              <Link to="/packages" className="pn-btn pn-btn--primary">
                Comprar paquete
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
