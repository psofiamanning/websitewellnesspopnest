import { Link } from 'react-router-dom'
import { classTypes } from '../data/classes'
import { getLandingSlugForClassId } from '../data/classLandings'
import { getLandingNavItems } from '../data/classLandingRoutes'
import { dotClassForClassId } from '../utils/redesignScheduleFromData'
import { SINGLE_CLASS_PRICE_MXN } from '../config/pricing'
import { getClassImageAlt } from '../utils/seo'
import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/components.css'
import '../styles/classesShell.css'

function PracticeCard({ c }) {
  const dot = dotClassForClassId(c.id)
  const landingSlug = getLandingSlugForClassId(c.id)
  return (
    <article id={`cl-class-${c.id}`} className="pn-practice-card pn-practice-card--mosaic">
      <Link to={`/booking/class/${c.id}`} className="cl-pcard__mosaic-link">
        <div className="pn-practice-card__image pn-practice-card__image--mosaic pn-practice-card__image--class-icon">
          <img src={c.image} alt={getClassImageAlt(c.name)} loading="lazy" decoding="async" />
        </div>
        <div className="cl-pcard__mosaic-body">
          <div className="cl-pcard__head">
            <span className={`pn-dot pn-dot--${dot}`} aria-hidden />
            <h2 className="pn-h4 cl-pcard__title-mosaic">{c.name}</h2>
          </div>
          <p className="cl-pcard__meta cl-pcard__meta--mosaic">
            {c.teacher} · {c.duration} min
          </p>
          <p className="cl-pcard__desc cl-pcard__desc--mosaic">{c.description}</p>
          <div className="cl-pcard__mosaic-footer">
            <span className="cl-pcard__price-mosaic">
              ${SINGLE_CLASS_PRICE_MXN.toFixed(0)} MXN · clase
            </span>
            <span className="cl-pcard__link-mosaic" aria-hidden>
              Reservar →
            </span>
          </div>
        </div>
      </Link>
      {landingSlug && (
        <Link to={`/clases/${landingSlug}`} className="cl-pcard__guide-link">
          Guía de {c.name} en Coyoacán
        </Link>
      )}
    </article>
  )
}

function Classes() {
  const row1 = classTypes.slice(0, 4)
  const row2 = classTypes.slice(4)

  return (
    <div className="cl-page cl-page--with-site-nav">
      <div className="cl-shell cl-shell--practices-page">
        <header className="cl-hero cl-hero--centered">
          <div className="cl-hero__center">
            <p className="cl-hero__eyebrow">
              PRÁCTICAS<span className="cl-hero__eyebrow-dot">·</span>COYOACÁN
            </p>
            <h1 className="cl-hero__title-mosaic">
              <span className="cl-hero__title-mosaic-line">Clases en </span>
              <em className="cl-hero__title-mosaic-accent pn-serif">Coyoacán.</em>
            </h1>
            <div className="cl-hero__rule" aria-hidden />
          </div>
          <p className="cl-hero__guides pn-text-sm">
            Guías por práctica en Coyoacán:{' '}
            <Link to="/clases/yoga-coyoacan">Yoga</Link>
            {getLandingNavItems().map((item) => (
              <span key={item.slug}>
                {' · '}
                <Link to={item.path}>{item.name}</Link>
              </span>
            ))}
          </p>
        </header>

        <main className="cl-body cl-body--practices-mosaic">
          <div className="cl-practice-site">
            <div className="cl-practice-row">
              {row1.map((c) => (
                <PracticeCard key={c.id} c={c} />
              ))}
            </div>
            <div className="cl-practice-row cl-practice-row--last">
              {row2.map((c) => (
                <PracticeCard key={c.id} c={c} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Classes
