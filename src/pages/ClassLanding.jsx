import { Link, Navigate, useParams } from 'react-router-dom'
import { getClassLandingData } from '../data/classLandings'
import { SINGLE_CLASS_PRICE_MXN } from '../config/pricing'
import PracticeDot from '../components/ui/PracticeDot'
import { dotClassForClassId } from '../utils/redesignScheduleFromData'
import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/components.css'
import '../styles/classLandingShell.css'

function ClassLanding() {
  const { slug } = useParams()
  const data = getClassLandingData(slug)

  if (!data) {
    return <Navigate to="/classes" replace />
  }

  const practice = dotClassForClassId(data.classId)

  return (
    <div className="clp-page clp-page--with-site-nav">
      <div className="clp-shell">
        <header className="clp-hero">
          <p className="pn-eyebrow clp-hero__eyebrow">Práctica · Del Carmen, Coyoacán</p>
          <h1 className="clp-hero__title">{data.h1}</h1>
          <p className="pn-text-lg clp-hero__intro">{data.intro}</p>
          <div className="clp-hero__meta">
            <PracticeDot practice={practice} size={10} aria-hidden />
            <span className="pn-text-sm">
              {data.teacher} · {data.duration} min · grupos reducidos
            </span>
          </div>
          <div className="clp-hero__actions">
            <Link to={data.bookingPath} className="pn-btn pn-btn--primary">
              Reservar {data.name}
            </Link>
            <Link to={data.horarioPath} className="pn-btn pn-btn--ghost">
              Ver horario
            </Link>
          </div>
        </header>

        <div className="clp-layout">
          <div className="clp-main">
            <section className="clp-section">
              <h2 className="pn-h3">Sobre esta práctica</h2>
              <div className="clp-prose">
                {data.paragraphs.map((para, i) => (
                  <p key={i} className="pn-text">
                    {para}
                  </p>
                ))}
              </div>
            </section>

            <section className="clp-section">
              <h2 className="pn-h3">¿Para quién es?</h2>
              <p className="pn-text">
                Ideal si buscas un espacio tranquilo en <strong>Coyoacán</strong> para practicar con
                atención, sin grupos grandes. Abierto a distintos niveles; la coach adapta la sesión
                al ritmo del salón.
              </p>
            </section>

            {data.scheduleSummary && (
              <section className="clp-section">
                <h2 className="pn-h3">Horario habitual</h2>
                <p className="pn-text">{data.scheduleSummary}</p>
                <p className="pn-text-sm clp-muted">
                  El horario puede variar. Consulta fechas disponibles al reservar o en{' '}
                  <Link to={data.horarioPath}>Horario semanal</Link>.
                </p>
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
                <img src={data.image} alt="" loading="lazy" decoding="async" />
              </div>
              <p className="pn-h4 clp-card__name">{data.name}</p>
              <p className="pn-text-sm clp-muted">
                <PracticeDot practice={practice} /> {data.teacher}
              </p>
              <p className="clp-card__price">
                ${SINGLE_CLASS_PRICE_MXN.toFixed(0)} MXN <span>por clase</span>
              </p>
              <Link to={data.bookingPath} className="pn-btn pn-btn--primary clp-card__cta">
                Reservar en línea
              </Link>
            </div>
          </aside>
        </div>

        <section className="clp-related">
          <h2 className="pn-h4">Otras prácticas en Coyoacán</h2>
          <ul className="clp-related__list">
            {data.otherLandings.map((item) => (
              <li key={item.slug}>
                <Link to={item.path}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

export default ClassLanding
