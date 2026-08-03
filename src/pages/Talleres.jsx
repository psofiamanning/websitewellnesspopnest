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
    <div className="wellness-background min-h-screen">
      <div className="wellness-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
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

        {!loading && !error && talleres.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {talleres.map((t) => {
              const soldOut = (t.spots_available ?? 0) <= 0
              return (
                <article
                  key={t.id}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.06] shadow-[0_2px_24px_-12px_rgba(0,0,0,0.18)] transition-shadow hover:shadow-[0_8px_32px_-12px_rgba(183,61,55,0.25)]"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ backgroundColor: '#F2E9E4' }}>
                    {t.image_url ? (
                      <img
                        src={t.image_url}
                        alt={t.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                    {soldOut && (
                      <span className="absolute right-3 top-3 rounded-full bg-gray-900/80 px-3 py-1 text-xs font-body font-semibold text-white">
                        Agotado
                      </span>
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
                      disabled={soldOut}
                      onClick={() => navigate(`/talleres/${t.id}`)}
                      className="w-full rounded-lg px-5 py-3 text-sm font-body font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ backgroundColor: soldOut ? '#9CA3AF' : '#B73D37' }}
                    >
                      {soldOut ? 'Agotado' : 'Reservar lugar →'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Talleres
