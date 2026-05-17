import { useNavigate } from 'react-router-dom'
import { teachers } from '../data/classes'
import { formatCoachSpecialtyLabel } from '../utils/coachLabels'
import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/components.css'
import '../styles/coachesShell.css'

/** Texto comparable: minúsculas, sin acentos, espacios colapsados */
function normalizeCoachLabel(s) {
  if (!s || typeof s !== 'string') return ''
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Si la especialidad ya nombra la misma clase que el chip,
 * no mostramos el chip — evita duplicados.
 */
function specialtyCoversClassName(specialty, className) {
  const ns = normalizeCoachLabel(specialty)
  const nc = normalizeCoachLabel(className)
  if (!nc.length) return true
  if (ns === nc) return true
  if (nc.length >= 4 && ns.includes(nc)) return true
  return false
}

function classesWithoutSpecialtyDuplication(specialty, classesList) {
  return classesList.filter((c) => !specialtyCoversClassName(specialty, c))
}

/** Retratos que se ven mejor centradas (no desde arriba). */
function coachImageFocus(coachId) {
  if (coachId === 3 || coachId === 5) return 'center'
  return undefined
}

function Teachers() {
  const navigate = useNavigate()

  const goToCoachBooking = (coachId) => {
    navigate(`/booking/coach/${coachId}`)
  }

  return (
    <div className="coach-page coach-page--with-site-nav">
      <div className="coach-shell">
        <header className="coach-hero">
          <p className="pn-eyebrow">
            EQUIPO<span className="coach-hero__eyebrow-dot">·</span>ESTUDIO
          </p>
          <h1 className="coach-hero__title">
            Nuestros <em className="pn-serif">coaches.</em>
          </h1>
          <p className="pn-text-lg">
            Conoce al equipo que imparte las clases en el estudio. Cada persona acompaña la práctica
            con experiencia y cuidado.
          </p>
          <div className="coach-hero__rule" aria-hidden />
        </header>

        <main className="coach-body">
          <div className="coach-grid">
            {teachers.map((coach) => {
              const extraClasses = classesWithoutSpecialtyDuplication(coach.specialty, coach.classes)
              const focus = coachImageFocus(coach.id)
              return (
                <article key={coach.id} className="coach-card" aria-labelledby={`coach-name-${coach.id}`}>
                  <div className="coach-card__media">
                    <img
                      src={coach.image}
                      alt=""
                      className="coach-card__img"
                      data-coach-focus={focus || undefined}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="sr-only">{coach.name}</span>
                  </div>

                  <div className="coach-card__body">
                    <div className="coach-card__top">
                      <h2 id={`coach-name-${coach.id}`} className="coach-card__name">
                        {coach.name}
                      </h2>
                      <p className="coach-card__specialty">{formatCoachSpecialtyLabel(coach.specialty)}</p>
                      <p className="coach-card__bio">{coach.bio || '\u00a0'}</p>
                      <div
                        className={`coach-card__chips${extraClasses.length === 0 ? ' coach-card__chips--empty' : ''}`}
                        aria-hidden={extraClasses.length === 0}
                      >
                        {extraClasses.map((className, idx) => (
                          <span key={idx} className="coach-card__chip">
                            {className}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="coach-card__actions">
                      <button
                        type="button"
                        className="coach-card__link coach-card__link--quiet"
                        onClick={() => goToCoachBooking(coach.id)}
                      >
                        Leer más
                      </button>
                      <button
                        type="button"
                        className="coach-card__link coach-card__link--cta"
                        onClick={() => goToCoachBooking(coach.id)}
                      >
                        Ver clases →
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Teachers
