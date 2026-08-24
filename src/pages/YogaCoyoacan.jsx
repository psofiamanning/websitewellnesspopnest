import { Link } from 'react-router-dom'
import classIconHatha from '../assets/class-hatha-yoga.png'
import classIconPower from '../assets/class-power-yoga.png'
import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/components.css'
import '../styles/classLandingShell.css'

const STYLES = [
  {
    slug: 'hatha-yoga-coyoacan',
    name: 'Hatha Yoga',
    teacher: 'Blanca Bear',
    image: classIconHatha,
    description:
      'Práctica clásica con posturas sostenidas, respiración consciente y cierre de relajación. Ritmo claro y accesible, ideal para construir base técnica y presencia.'
  },
  {
    slug: 'power-yoga-coyoacan',
    name: 'Power Yoga',
    teacher: 'Rocío Enciso',
    image: classIconPower,
    description:
      'Práctica vigorosa con secuencias fluidas entre posturas de pie, equilibrios y trabajo de fuerza. Para quien busca movimiento intenso sin perder la consciencia respiratoria.'
  }
]

const FAQ_ITEMS = [
  {
    q: '¿Qué diferencia hay entre Hatha Yoga y Power Yoga?',
    a: 'Hatha Yoga tiene un ritmo más pausado, enfocado en posturas sostenidas y respiración; es ideal para empezar o para una práctica calmada. Power Yoga es más dinámico y físico, con secuencias fluidas que exigen fuerza y resistencia.'
  },
  {
    q: '¿Necesito experiencia previa para tomar yoga en Coyoacán?',
    a: 'No. Ambos estilos están pensados para distintos niveles; las coaches adaptan posturas y ritmo dentro de grupos reducidos.'
  },
  {
    q: '¿Cómo reservo mi clase de yoga?',
    a: 'Puedes reservar clase por clase desde el horario semanal o comprar un paquete de varias clases para ahorrar por sesión.'
  }
]

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a }
  }))
}

function YogaCoyoacan() {
  return (
    <div className="clp-page clp-page--with-site-nav">
      <div className="clp-shell">
        <header className="clp-hero">
          <p className="pn-eyebrow clp-hero__eyebrow">Yoga · Del Carmen, Coyoacán</p>
          <h1 className="clp-hero__title">Yoga en Coyoacán</h1>
          <p className="pn-text-lg clp-hero__intro">
            Clases de yoga en un estudio boutique en Coyoacán, a pasos del Museo Frida Kahlo.
            Hatha Yoga y Power Yoga con coaches especializadas, grupos reducidos y horarios flexibles.
          </p>
          <div className="clp-hero__actions">
            <Link to="/horario" className="pn-btn pn-btn--primary">
              Ver horario
            </Link>
            <Link to="/classes" className="pn-btn pn-btn--ghost">
              Ver todas las prácticas
            </Link>
          </div>
        </header>

        <div className="clp-layout">
          <div className="clp-main">
            <section className="clp-section">
              <h2 className="pn-h3">Estilos de yoga en Estudio Popnest</h2>
              <p className="pn-text">
                Ofrecemos dos estilos de yoga en Coyoacán, pensados para distintos ritmos y objetivos.
                Cada clase dura 60 minutos, en grupos reducidos.
              </p>
              <dl className="clp-faq__list">
                {STYLES.map((style) => (
                  <div key={style.slug} className="clp-faq__row">
                    <dt>
                      <Link to={`/clases/${style.slug}`}>{style.name}</Link> · {style.teacher}
                    </dt>
                    <dd>{style.description}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="clp-section">
              <h2 className="pn-h3">¿Para quién es el yoga en Coyoacán?</h2>
              <p className="pn-text">
                Ideal si buscas un espacio tranquilo en <strong>Coyoacán</strong> para practicar con
                atención, sin grupos grandes. Ya sea que prefieras un ritmo pausado (Hatha Yoga) o
                una práctica más física (Power Yoga), la coach adapta la sesión a tu nivel.
              </p>
            </section>

            <section className="clp-section">
              <h2 className="pn-h3">Horario de yoga</h2>
              <p className="pn-text">
                Hatha Yoga y Power Yoga se imparten en horarios distintos a lo largo de la semana.
                Consulta días y horas disponibles en el{' '}
                <Link to="/horario">horario semanal</Link>.
              </p>
            </section>

            {FAQ_ITEMS.length > 0 && (
              <section className="clp-section clp-faq">
                <h2 className="pn-h3">Preguntas frecuentes</h2>
                <dl className="clp-faq__list">
                  {FAQ_ITEMS.map((item) => (
                    <div key={item.q} className="clp-faq__row">
                      <dt>{item.q}</dt>
                      <dd>{item.a}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <section className="clp-section">
              <h2 className="pn-h3">Estudio en Coyoacán</h2>
              <p className="pn-text">
                Las clases se imparten en <strong>Estudio Popnest Wellness</strong>, Londres 105,
                Colonia Del Carmen, Coyoacán, CDMX. Estudio boutique con salón dedicado a yoga,
                meditación y bienestar.
              </p>
              <p className="pn-text">
                <Link to="/ubicacion">Cómo llegar</Link>
                {' · '}
                <Link to="/classes">Ver todas las prácticas</Link>
              </p>
            </section>
          </div>

          <aside className="clp-aside">
            <div className="clp-card">
              <div className="clp-card__image">
                <img
                  src={classIconHatha}
                  alt="Clase de Yoga en Coyoacán — Estudio Popnest Wellness"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="pn-h4 clp-card__name">Yoga en Coyoacán</p>
              <p className="pn-text-sm clp-muted">Grupos reducidos · 60 min</p>
              <Link to="/horario" className="pn-btn pn-btn--primary clp-card__cta">
                Ver horario
              </Link>
            </div>
          </aside>
        </div>

        <section className="clp-related">
          <h2 className="pn-h4">Otras prácticas en Coyoacán</h2>
          <ul className="clp-related__list">
            <li>
              <Link to="/clases/pilates-coyoacan">Pilates</Link>
            </li>
            <li>
              <Link to="/clases/meditacion-coyoacan">Meditación</Link>
            </li>
            <li>
              <Link to="/clases/sound-healing-coyoacan">Sound Healing</Link>
            </li>
            <li>
              <Link to="/clases/tai-chi-coyoacan">Tai Chi</Link>
            </li>
          </ul>
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
    </div>
  )
}

export default YogaCoyoacan
