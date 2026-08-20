import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchTalleres } from '../services/talleresService'

/** Precio legible: 0 → "Gratis", si no "$1,200 MXN". */
function formatPrice(price) {
  const n = Number(price) || 0
  if (n <= 0) return 'Gratis'
  return `$${n.toLocaleString('es-MX')} MXN`
}

/** Fecha legible en español (evita desfase de zona usando componentes locales). */
function formatFecha(fecha) {
  if (!fecha) return null
  const [y, m, d] = String(fecha).split('-').map(Number)
  if (!y || !m || !d) return fecha
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
}

/** `fecha` (YYYY-MM-DD) → Date local a medianoche, para comparar contra "hoy" sin desfase de zona. */
function parseFechaLocal(fecha) {
  if (!fecha) return null
  const [y, m, d] = String(fecha).split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

/**
 * Ordena los talleres solos, sin que haya que reacomodarlos a mano al agregar uno nuevo:
 * próximos primero (los con fecha más cercana arriba, los sin fecha aún al final del grupo),
 * y hasta abajo los que ya pasaron (el más reciente primero).
 */
function ordenarTalleres(talleres) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const proximos = []
  const pasados = []
  for (const t of talleres) {
    const fecha = parseFechaLocal(t.fecha)
    if (fecha && fecha < hoy) pasados.push(t)
    else proximos.push(t)
  }

  proximos.sort((a, b) => {
    const fa = parseFechaLocal(a.fecha)
    const fb = parseFechaLocal(b.fecha)
    if (fa && fb) return fa - fb
    if (fa) return -1 // con fecha antes que sin fecha
    if (fb) return 1
    return 0
  })

  pasados.sort((a, b) => {
    const fa = parseFechaLocal(a.fecha)
    const fb = parseFechaLocal(b.fecha)
    return fb - fa // más reciente primero
  })

  return { proximos, pasados }
}

function Talleres() {
  const navigate = useNavigate()
  const [talleres, setTalleres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    fetchTalleres()
      .then((data) => alive && setTalleres(data))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="pn-page-with-site-nav min-h-screen" style={{ background: 'var(--pn-color-bg-base)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <header className="mb-10 md:mb-14">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: '#B73D37' }}>
            Experiencias · Popnest
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold" style={{ color: '#1F2937' }}>
            Talleres.
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg font-body" style={{ color: '#6B7280' }}>
            Experiencias especiales de bienestar en Coyoacán. Cada taller es único: tema, comida y ambiente
            pensados para un encuentro distinto. Reserva tu lugar en línea.
          </p>
          <p className="mt-3 max-w-2xl text-sm font-body" style={{ color: '#6B7280' }}>
            Para ver fotos e información más actualizada, síguenos en{' '}
            <a
              href="https://www.instagram.com/estudiopopnest"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2"
              style={{ color: '#B73D37' }}
            >
              Instagram
            </a>
            .
          </p>
        </header>

        {loading && <p className="font-body" style={{ color: '#6B7280' }}>Cargando talleres…</p>}

        {!loading && error && (
          <div className="rounded-lg border-2 p-6" style={{ borderColor: '#E5B3B0', backgroundColor: '#FFF' }}>
            <p className="font-body" style={{ color: '#B73D37' }}>No pudimos cargar los talleres. {error}</p>
          </div>
        )}

        {!loading && !error && talleres.length === 0 && (
          <div className="rounded-2xl border-2 p-10 text-center" style={{ borderColor: '#E5B3B0', backgroundColor: '#FFF' }}>
            <p className="text-lg font-heading font-semibold mb-2" style={{ color: '#1F2937' }}>
              Muy pronto nuevos talleres ✨
            </p>
            <p className="font-body" style={{ color: '#6B7280' }}>
              Estamos preparando la siguiente experiencia. Vuelve pronto o escríbenos para enterarte primero.
            </p>
          </div>
        )}

        {!loading && !error && talleres.length > 0 && (() => {
          const { proximos, pasados } = ordenarTalleres(talleres)
          return (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {proximos.map((t) => (
                  <TallerCard key={t.id} taller={t} onClick={() => navigate(`/talleres/${t.id}`)} />
                ))}
              </div>

              {pasados.length > 0 && (
                <div className="mt-14 md:mt-20">
                  <h2 className="text-lg font-heading font-bold mb-1" style={{ color: '#1F2937' }}>
                    Talleres pasados
                  </h2>
                  <p className="mb-6 text-sm font-body" style={{ color: '#6B7280' }}>
                    Ya se llevaron a cabo, pero te damos una idea de lo que hacemos.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {pasados.map((t) => (
                      <TallerCard key={t.id} taller={t} isPast onClick={() => navigate(`/talleres/${t.id}`)} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )
        })()}
      </div>
    </div>
  )
}

/** Tarjeta de un taller. `isPast` la atenúa y desactiva la reserva (el taller ya pasó). */
function TallerCard({ taller: t, isPast = false, onClick }) {
  const soldOut = (t.spots_available ?? 0) <= 0
  const disabled = isPast || soldOut

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.06] shadow-[0_2px_24px_-12px_rgba(0,0,0,0.18)] transition-shadow hover:shadow-[0_8px_32px_-12px_rgba(183,61,55,0.25)]"
      style={isPast ? { opacity: 0.7 } : undefined}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ backgroundColor: '#F2E9E4' }}>
        {t.image_url ? (
          <img
            src={t.image_url}
            alt={t.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={isPast ? { filter: 'grayscale(60%)' } : undefined}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-heading text-2xl" style={{ color: '#C76661' }}>
            {t.title}
          </div>
        )}
        <span
          className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-body font-semibold text-white"
          style={{ backgroundColor: '#B73D37' }}
        >
          {formatPrice(t.price)}
        </span>
        {isPast ? (
          <span className="absolute right-3 top-3 rounded-full bg-gray-900/80 px-3 py-1 text-xs font-body font-semibold text-white">
            Ya pasó
          </span>
        ) : (
          soldOut && (
            <span className="absolute right-3 top-3 rounded-full bg-gray-900/80 px-3 py-1 text-xs font-body font-semibold text-white">
              Agotado
            </span>
          )
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-heading text-xl font-bold" style={{ color: '#1F2937' }}>
          {t.title}
        </h2>
        {t.tema && (
          <p className="mt-1 text-sm font-body font-medium" style={{ color: '#B73D37' }}>
            {t.tema}
          </p>
        )}

        <dl className="mt-4 space-y-1.5 text-sm font-body" style={{ color: '#4B5563' }}>
          {formatFecha(t.fecha) && (
            <div className="flex gap-2">
              <dt className="font-semibold" style={{ color: '#6B7280' }}>Cuándo:</dt>
              <dd className="capitalize">{formatFecha(t.fecha)}{t.hora ? ` · ${t.hora}` : ''}</dd>
            </div>
          )}
          {t.comida && (
            <div className="flex gap-2">
              <dt className="font-semibold" style={{ color: '#6B7280' }}>Comida:</dt>
              <dd>{t.comida}</dd>
            </div>
          )}
          {t.lugar && (
            <div className="flex gap-2">
              <dt className="font-semibold" style={{ color: '#6B7280' }}>Dónde:</dt>
              <dd>{t.lugar}</dd>
            </div>
          )}
        </dl>

        {t.descripcion && (
          <p className="mt-3 line-clamp-3 text-sm font-body leading-relaxed" style={{ color: '#6B7280' }}>
            {t.descripcion}
          </p>
        )}

        <div className="mt-5 flex-1" />
        <button
          type="button"
          disabled={disabled}
          onClick={onClick}
          className="w-full rounded-lg px-5 py-3 text-sm font-body font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: disabled ? '#9CA3AF' : '#B73D37' }}
        >
          {isPast ? 'Taller finalizado' : soldOut ? 'Agotado' : 'Reservar lugar →'}
        </button>
      </div>
    </article>
  )
}

export default Talleres
