import { useNavigate } from 'react-router-dom'
import { teachers } from '../data/classes'
import { formatCoachSpecialtyLabel } from '../utils/coachLabels'

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
 * Si la especialidad (píldora rosa) ya nombra la misma clase que el chip gris,
 * no mostramos el chip — evita "SOUND HEALING" + "Sound Healing".
 */
function specialtyCoversClassName(specialty, className) {
  const ns = normalizeCoachLabel(specialty)
  const nc = normalizeCoachLabel(className)
  if (!nc.length) return true
  if (ns === nc) return true
  if (nc.length >= 4 && ns.includes(nc)) return true
  return false
}

function classesWithoutSpecialtyDuplication(specialty, classes) {
  return classes.filter((c) => !specialtyCoversClassName(specialty, c))
}

function Teachers() {
  const navigate = useNavigate()

  const goToCoachBooking = (coachId) => {
    navigate(`/booking/coach/${coachId}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA]">
      <header
        className="relative z-10 shrink-0 border-b pt-24 pb-3 md:pb-4"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E5B3B0'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="mb-2 inline-block">
            <div className="h-1 w-16 rounded-full md:w-20" style={{ backgroundColor: '#D48D88' }} />
          </div>
          <h1
            className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.25rem] lg:text-4xl"
            style={{ color: '#1F2937', letterSpacing: '-0.03em', lineHeight: '1.15' }}
          >
            Nuestros coaches
          </h1>
          <p
            className="mt-2 max-w-3xl text-base font-body leading-relaxed text-gray-600 line-clamp-2 lg:line-clamp-2 lg:text-lg"
          >
            Conoce al equipo que imparte las clases en el estudio. Cada coach acompaña la práctica con experiencia y cuidado.
          </p>
        </div>
      </header>

      {/* Contenido acotado al alto útil para ver 5 tarjetas (3+2) sin scroll en laptop */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 sm:px-6 sm:py-5 lg:px-10 lg:py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 md:gap-5 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-5">
          {teachers.map((coach) => {
            const extraClasses = classesWithoutSpecialtyDuplication(coach.specialty, coach.classes)
            return (
              <article
                key={coach.id}
                aria-labelledby={`coach-name-${coach.id}`}
                className="group flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-white transition-shadow duration-300 sm:flex-row sm:items-stretch"
                style={{
                  boxShadow: '0 2px 10px rgba(183, 61, 55, 0.08)',
                  borderColor: '#E5B3B0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(183, 61, 55, 0.14)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(183, 61, 55, 0.08)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
              {/* Móvil: imagen arriba · sm+: columna izquierda (~42%, más ancha) */}
              <div
                className="relative h-44 w-full shrink-0 overflow-hidden bg-neutral-100 sm:h-auto sm:w-[42%] sm:min-w-[9.5rem] sm:max-w-[15rem] md:min-w-[10.5rem] md:max-w-[17rem] sm:self-stretch"
              >
                <img
                  src={coach.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] sm:absolute sm:inset-0"
                  style={{
                    objectPosition: coach.id === 3 ? 'center center' : coach.id === 5 ? 'center center' : 'center top'
                  }}
                />
                <span className="sr-only">{coach.name}</span>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>

              <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-3 p-4 sm:gap-3 sm:py-4 sm:pl-4 sm:pr-4 md:gap-3.5 md:py-5 md:pl-5 md:pr-5">
                <div className="min-w-0 space-y-2">
                  <h2
                    id={`coach-name-${coach.id}`}
                    className="line-clamp-2 font-heading text-lg font-bold leading-snug text-gray-900 sm:text-base md:text-lg"
                  >
                    {coach.name}
                  </h2>
                  <div className="inline-block max-w-full rounded-full px-2.5 py-1" style={{ backgroundColor: '#FEE2E2' }}>
                    <p className="line-clamp-2 font-body text-xs font-semibold leading-snug text-[#B73D37] sm:text-[0.8125rem]">
                      {formatCoachSpecialtyLabel(coach.specialty)}
                    </p>
                  </div>
                  {coach.bio && (
                    <p className="line-clamp-4 text-sm font-body leading-relaxed text-gray-600">
                      {coach.bio}
                    </p>
                  )}
                  {extraClasses.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {extraClasses.map((className, idx) => (
                        <span
                          key={idx}
                          className="rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 font-body text-sm font-medium leading-snug text-gray-800 md:text-[0.9375rem]"
                        >
                          {className}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2.5 border-t border-gray-100 pt-3 sm:pt-3.5">
                  <button
                    type="button"
                    onClick={() => goToCoachBooking(coach.id)}
                    className="min-h-10 min-w-0 flex-1 inline-flex items-center justify-center rounded-lg border-2 px-3 py-2 font-heading text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B73D37] focus-visible:ring-offset-1 sm:text-sm"
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#B73D37',
                      borderColor: '#B73D37',
                      letterSpacing: '0.06em',
                      fontFamily: "'Hanken Grotesk', sans-serif"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(183, 61, 55, 0.06)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF'
                    }}
                  >
                    Leer más
                  </button>
                  <button
                    type="button"
                    onClick={() => goToCoachBooking(coach.id)}
                    className="relative min-h-10 min-w-0 flex-1 inline-flex items-center justify-center overflow-hidden rounded-lg px-3 py-2 font-heading text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B73D37] focus-visible:ring-offset-1 sm:text-sm"
                    style={{
                      background: 'linear-gradient(135deg, #B73D37 0%, #8B2E29 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      letterSpacing: '0.06em',
                      boxShadow: '0 2px 8px rgba(183, 61, 55, 0.2)',
                      fontFamily: "'Hanken Grotesk', sans-serif"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #C76661 0%, #B73D37 100%)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(183, 61, 55, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #B73D37 0%, #8B2E29 100%)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(183, 61, 55, 0.2)'
                    }}
                  >
                    Ver clases
                  </button>
                </div>
              </div>
            </article>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default Teachers
