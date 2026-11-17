import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import studioPhoto1 from '../assets/studio-photo-1.png'
import studioPhoto2 from '../assets/studio-photo-2.png'
import studioPhoto3 from '../assets/studio-photo-3.png'
import studioPhoto4 from '../assets/studio-photo-4.png'
import logoEstudioPopnest from '../assets/logo-estudio-popnest.webp'
import logoEstudioPopnest480 from '../assets/logo-estudio-popnest-480.webp'
import { classTypes, getClassTeachersLabel } from '../data/classes'
import { getLandingSlugForClassId } from '../data/classLandings'
import { PACKAGE_OFFERS } from '../data/packageOffers'
import { shouldShowProposalPlans } from '../config/proposalPlans'
import { useFituneLive, FITUNE_URLS, FITUNE_LINK_PROPS } from '../config/fitune'
import { buildRedesignScheduleSnippets, dotClassForClassId } from '../utils/redesignScheduleFromData'
import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/components.css'
import '../styles/homeShell.css'

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Londres+105,+Del+Carmen,+Coyoacán,+04100+Ciudad+de+México,+CDMX'
const WA_WELLNESS =
  'https://wa.me/525554379644?text=' + encodeURIComponent('Hola, me interesa wellness corporativo para equipos.')

const HERO_VIDEO_SRC = '/videos/hero-classes.mp4'
const HERO_VIDEO_POSTER = '/videos/hero-classes-poster.webp'
/** Móvil: espera extra tras `load` antes de descargar el video. */
const MOBILE_VIDEO_DELAY_MS = 2500

/**
 * El HTML sale con preload="none" y sin autoplay (autoplay obliga a descargar el video).
 * Mientras no reproduce se ve el <img> del poster que está debajo.
 * Escritorio: arranca al montar. Móvil: espera al evento load + unos segundos (en reposo) para
 * que el video de 2.2 MB no compita con el poster (LCP) ni con fuentes/JS en redes lentas.
 * Ahorro de datos, conexión 2G/3G o movimiento reducido: se queda el poster.
 */
function useDeferredHeroVideo(videoRef) {
  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined
    const saveData = navigator.connection?.saveData === true
    const slowNetwork = ['slow-2g', '2g', '3g'].includes(navigator.connection?.effectiveType)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (saveData || slowNetwork || reducedMotion) return undefined

    // El poster es un <img> debajo (elemento LCP); el video aparece encima cuando ya reproduce.
    const onPlaying = () => video.classList.add('is-playing')
    video.addEventListener('playing', onPlaying, { once: true })
    const start = () => {
      video.preload = 'auto'
      video.play().catch(() => {})
    }
    let timer
    let idleId
    const startWhenIdle = () => {
      timer = window.setTimeout(() => {
        if (window.requestIdleCallback) idleId = window.requestIdleCallback(start, { timeout: 2000 })
        else start()
      }, MOBILE_VIDEO_DELAY_MS)
    }
    if (window.matchMedia('(min-width: 768px)').matches) {
      start()
    } else if (document.readyState === 'complete') {
      startWhenIdle()
    } else {
      window.addEventListener('load', startWhenIdle, { once: true })
    }
    return () => {
      window.clearTimeout(timer)
      if (idleId && window.cancelIdleCallback) window.cancelIdleCallback(idleId)
      window.removeEventListener('load', startWhenIdle)
      video.removeEventListener('playing', onPlaying)
    }
  }, [videoRef])
}

const HERO_TICKER_ITEMS = [
  'Hatha Yoga',
  'Pilates',
  'Power Yoga',
  'Sound Healing',
  'Tai Chi',
  'Stretching',
  'Belly Dance',
]

const SPACE_SLIDES = [
  { src: studioPhoto1, alt: 'Espacio de meditación y práctica', ey: 'Amplitud y luz', em: 'Para verse y sentirse mejor' },
  { src: studioPhoto3, alt: 'Espacio tranquilo', ey: 'Acústica cuidada', em: 'Silencio que sostiene la práctica' },
  { src: studioPhoto4, alt: 'Vista del estudio', ey: 'El estudio', em: 'Un refugio en Del Carmen' },
  { src: studioPhoto2, alt: 'Ambiente del estudio', ey: 'Detalle del salón', em: 'Materiales y calma' },
]

/**
 * FAQ del home: respuestas directas (para Google y buscadores de IA). `a` es el texto del
 * schema FAQPage; `node` (opcional) es la versión visible con enlaces — deben decir lo mismo.
 */
const HOME_FAQ = [
  {
    q: '¿Dónde está el estudio?',
    a: 'En Londres 105, colonia Del Carmen, Coyoacán, CDMX, a unos pasos del Museo Frida Kahlo. El estudio comparte entrada con galería, cafetería y coworking; el salón de clases está al fondo del inmueble.',
    node: (
      <>
        Estamos en <strong>Coyoacán, CDMX</strong> — Colonia Del Carmen, en Londres 105, a unos pasos del Museo Frida Kahlo. Es un espacio que comparte
        entrada con galería, cafetería y coworking. <Link to="/ubicacion">Ver cómo llegar</Link>.
      </>
    ),
  },
  {
    q: '¿Qué clases hay en Estudio Popnest?',
    a: 'Pilates mat, Hatha Yoga, Power Yoga, Tai Chi, Sound Healing (sound bath), Belly Dance y Stretching, todas de 60 minutos, de lunes a domingo. Además, un Run Club gratuito los miércoles y sábados.',
    node: (
      <>
        Pilates mat, Hatha Yoga, Power Yoga, Tai Chi, Sound Healing (sound bath), Belly Dance y Stretching, todas de 60
        minutos, de lunes a domingo. Consulta el <Link to="/horario">horario semanal</Link>. Además, un{' '}
        <Link to="/run-club">Run Club gratuito</Link> los miércoles y sábados.
      </>
    ),
  },
  {
    q: '¿Cuánto cuesta una clase?',
    a: 'La clase suelta cuesta $250 MXN. Hay paquetes desde $550 MXN por 3 clases, paquetes de 4 a 20 clases y un plan ilimitado mensual de $1,800 MXN.',
    node: (
      <>
        La clase suelta cuesta <strong>$250 MXN</strong>. Hay paquetes desde $550 MXN por 3 clases, paquetes de 4 a 20
        clases y un plan ilimitado mensual de $1,800 MXN. <Link to="/packages">Ver paquetes y precios</Link>.
      </>
    ),
  },
  {
    q: '¿Necesito experiencia previa?',
    a: 'No. Las clases son para todos los niveles y principiantes: las coaches dan opciones para cada cuerpo y los grupos son de máximo 10 personas, así que hay atención y correcciones personalizadas.',
  },
  {
    q: '¿Qué tipo de Pilates dan: mat o reformer?',
    a: 'Pilates mat, en colchoneta y sin máquinas reformer, enfocado en core, postura y control del movimiento, en grupos de máximo 10 personas.',
    node: (
      <>
        <Link to="/clases/pilates-coyoacan">Pilates mat</Link>, en colchoneta y sin máquinas reformer, enfocado en core,
        postura y control del movimiento, en grupos de máximo 10 personas.
      </>
    ),
  },
  {
    q: '¿Qué debo llevar?',
    a: 'Ropa cómoda y tu propio mat de yoga para Pilates, Yoga y Stretching; para Sound Healing, mat y una cobija.',
  },
  {
    q: '¿Cómo reservo una clase?',
    a: 'Elige tu clase en el horario, reserva y paga en línea; recibirás confirmación por correo. También puedes comprar un paquete para ahorrar por clase.',
    node: (
      <>
        Elige tu clase en el <Link to="/horario">horario</Link>, reserva y paga en línea; recibirás confirmación por
        correo. También puedes comprar un <Link to="/packages">paquete</Link> para ahorrar por clase.
      </>
    ),
  },
  {
    q: '¿Dudas sobre reservas, paquetes o pagos?',
    a: 'Escríbenos a info@estudiopopnest.com o por WhatsApp al +52 55 5437 9644.',
    node: (
      <>
        Escríbenos por <a href="mailto:info@estudiopopnest.com">correo</a> o{' '}
        <a href="https://wa.me/525554379644" target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>
        .
      </>
    ),
  },
]

const HOME_FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: HOME_FAQ.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

function Home() {
  const fituneLive = useFituneLive()
  const location = useLocation()
  const sliderRef = useRef(null)
  const heroVideoRef = useRef(null)
  useDeferredHeroVideo(heroVideoRef)
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
            <figure className="home-hero__visual">
              <img
                className="home-hero__poster"
                src={HERO_VIDEO_POSTER}
                alt=""
                width="720"
                height="1280"
                fetchpriority="high"
                decoding="async"
              />
              <video
                ref={heroVideoRef}
                className="home-hero__video"
                src={HERO_VIDEO_SRC}
                width="720"
                height="1280"
                muted
                loop
                playsInline
                preload="none"
                aria-label="Práctica de yoga en el Estudio Popnest"
              />
            </figure>

            <div className="home-hero__copy">
              <img
                src={logoEstudioPopnest}
                srcSet={`${logoEstudioPopnest480} 480w, ${logoEstudioPopnest} 640w`}
                sizes="(max-width: 860px) 240px, 420px"
                alt="Estudio Popnest"
                className="home-hero__logo"
                width="640"
                height="251"
              />
              <h1 className="home-hero__title">
                Tu pausa diaria
                <br />
                <span className="pn-serif" style={{ color: 'var(--pn-color-primary)' }}>
                  en Coyoacán.
                </span>
              </h1>
              <p className="pn-text-lg home-hero__body">
                Clases de pilates, yoga, tai chi, sound bath y belly dance para bajar el ritmo, todos los días.
              </p>
              <div className="home-hero__actions">
                {fituneLive ? (
                  <a href={FITUNE_URLS.schedule} className="pn-btn pn-btn--primary" {...FITUNE_LINK_PROPS}>
                    Reservar una clase
                  </a>
                ) : (
                  <Link to="/classes" className="pn-btn pn-btn--primary">
                    Reservar una clase
                  </Link>
                )}
                <a href="#clases" className="pn-btn pn-btn--ghost">
                  Ver clases
                </a>
              </div>
            </div>
          </section>

          <div className="home-ticker" aria-hidden="true">
            <div className="home-ticker__track">
              {[...HERO_TICKER_ITEMS, ...HERO_TICKER_ITEMS].map((item, i) => (
                <span className="home-ticker__item" key={i}>
                  {item}
                </span>
              ))}
            </div>
          </div>

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
                Yoga, pilates, sound healing, tai chi, belly dance y stretching. Sesiones de 60 minutos en grupos reducidos.
              </p>
            </div>

            <div className="home-class-spotlights">
              {classTypes.map((c) => {
                const dot = dotClassForClassId(c.id)
                const landingSlug = getLandingSlugForClassId(c.id)
                return (
                  <article key={c.id} className="home-class-spotlight">
                    <Link
                      to={landingSlug ? `/clases/${landingSlug}` : `/booking/class/${c.id}`}
                      className="home-class-spotlight__link"
                    >
                      <div className="home-class-spotlight__img">
                        <img src={c.image} alt={`Clase de ${c.name} en Coyoacán — Estudio Popnest Wellness`} loading="lazy" decoding="async" />
                      </div>
                      <div className="home-class-spotlight__body">
                        <div className="home-class-spotlight__head">
                          <span className={`pn-dot pn-dot--${dot}`} aria-hidden />
                          <h3 className="pn-h4">{c.name}</h3>
                        </div>
                        <p className="pn-text-sm">
                          {getClassTeachersLabel(c.id)} · {c.duration} min
                        </p>
                      </div>
                    </Link>
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
            <div
              className="home-today home-today--inline"
              dangerouslySetInnerHTML={{ __html: scheduleSnippets.homeTodayAside }}
            />
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
              {PACKAGE_OFFERS.filter((pkg) => !pkg.isProposal || shouldShowProposalPlans()).map((pkg) => (
                <Link
                  key={pkg.id}
                  to={pkg.isProposal ? '/packages?preview=equipo' : '/packages'}
                  className={`home-package-card${pkg.popular ? ' home-package-card--popular' : ''}${pkg.isProposal ? ' home-package-card--new' : ''}`}
                >
                  {pkg.isProposal ? (
                    <span className="home-package-card__badge home-package-card__badge--new">Nuevo</span>
                  ) : pkg.popular ? (
                    <span className="home-package-card__badge">Más popular</span>
                  ) : null}
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
                Creemos en el bienestar como una pausa honesta: grupos reducidos, coaches presentes y un ritmo que
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
                  En el corazón de <span className="pn-serif" style={{ color: 'var(--pn-color-secondary)' }}>Coyoacán.</span>
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
              {HOME_FAQ.map((item) => (
                <div className="home-faq__row" key={item.q}>
                  <dt>{item.q}</dt>
                  <dd>{item.node ?? item.a}</dd>
                </div>
              ))}
            </dl>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_FAQ_SCHEMA) }}
            />
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
