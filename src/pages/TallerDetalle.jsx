import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchTaller } from '../services/talleresService'

const WHATSAPP_NUMBER = '525554379644'

function formatPrice(price) {
  const n = Number(price) || 0
  if (n <= 0) return 'Precio por confirmar'
  return `$${n.toLocaleString('es-MX')} MXN`
}

function formatFecha(fecha) {
  if (!fecha) return null
  const [y, m, d] = String(fecha).split('-').map(Number)
  if (!y || !m || !d) return fecha
  return new Date(y, m - 1, d).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function TallerDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [taller, setTaller] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    fetchTaller(id)
      .then((data) => alive && setTaller(data))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [id])

  const soldOut = taller ? (taller.spots_available ?? 0) <= 0 : false

  const whatsappHref = taller
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        `Hola, quiero reservar mi lugar en el taller "${taller.title}"${
          formatFecha(taller.fecha) ? ` del ${formatFecha(taller.fecha)}` : ''
        }.`
      )}`
    : '#'

  if (loading) {
    return (
      <div className="pn-page-with-site-nav min-h-screen" style={{ background: 'var(--pn-color-bg-base)' }}>
        <div className="max-w-4xl mx-auto px-4 pt-28 pb-16 font-body" style={{ color: '#6B7280' }}>
          Cargando taller…
        </div>
      </div>
    )
  }

  if (error || !taller) {
    return (
      <div className="pn-page-with-site-nav min-h-screen" style={{ background: 'var(--pn-color-bg-base)' }}>
        <div className="max-w-4xl mx-auto px-4 pt-28 pb-16 text-center">
          <h1 className="text-2xl font-heading font-bold mb-4" style={{ color: '#1F2937' }}>
            No encontramos este taller
          </h1>
          <button onClick={() => navigate('/talleres')} className="font-body underline" style={{ color: '#B73D37' }}>
            Ver todos los talleres
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pn-page-with-site-nav min-h-screen" style={{ background: 'var(--pn-color-bg-base)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <button onClick={() => navigate('/talleres')} className="mb-5 text-sm font-body underline" style={{ color: '#B73D37' }}>
          ← Talleres
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Info */}
          <div>
            <div className="overflow-hidden rounded-2xl" style={{ backgroundColor: '#F2E9E4' }}>
              {taller.image_url ? (
                <img src={taller.image_url} alt={taller.title} className="w-full object-cover" style={{ maxHeight: 460 }} />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center font-heading text-3xl" style={{ color: '#C76661' }}>
                  {taller.title}
                </div>
              )}
            </div>

            <h1 className="mt-6 text-3xl md:text-4xl font-heading font-bold" style={{ color: '#1F2937' }}>
              {taller.title}
            </h1>
            {taller.tema && (
              <p className="mt-1 font-body font-medium" style={{ color: '#B73D37' }}>{taller.tema}</p>
            )}

            <dl className="mt-5 space-y-2 font-body" style={{ color: '#4B5563' }}>
              <div className="flex gap-2"><dt className="w-24 font-semibold" style={{ color: '#6B7280' }}>Precio</dt><dd>{formatPrice(taller.price)}</dd></div>
              {formatFecha(taller.fecha) && (
                <div className="flex gap-2"><dt className="w-24 font-semibold" style={{ color: '#6B7280' }}>Cuándo</dt><dd className="capitalize">{formatFecha(taller.fecha)}{taller.hora ? ` · ${taller.hora}` : ''}</dd></div>
              )}
              {taller.comida && (
                <div className="flex gap-2"><dt className="w-24 font-semibold" style={{ color: '#6B7280' }}>Comida</dt><dd>{taller.comida}</dd></div>
              )}
              <div className="flex gap-2"><dt className="w-24 font-semibold" style={{ color: '#6B7280' }}>Dónde</dt><dd>{taller.lugar || 'Estudio Popnest Wellness, Coyoacán'}</dd></div>
              <div className="flex gap-2"><dt className="w-24 font-semibold" style={{ color: '#6B7280' }}>Lugares</dt><dd>{soldOut ? 'Agotado' : `${taller.spots_available} disponibles`}</dd></div>
            </dl>

            {taller.descripcion && (
              <p className="mt-5 font-body leading-relaxed whitespace-pre-line" style={{ color: '#4B5563' }}>
                {taller.descripcion}
              </p>
            )}
          </div>

          {/* Reserva */}
          <div>
            <div className="rounded-2xl border-2 bg-white p-6 md:p-8" style={{ borderColor: '#E5B3B0' }}>
              <h2 className="text-xl font-heading font-bold mb-1" style={{ color: '#1F2937' }}>
                {soldOut ? 'Taller agotado' : 'Reserva tu lugar'}
              </h2>
              <p className="text-sm font-body mb-5" style={{ color: '#6B7280' }}>
                {soldOut
                  ? 'Este taller ya no tiene lugares disponibles.'
                  : taller.payment_link
                  ? `${formatPrice(taller.price)} · pago seguro con Stripe.`
                  : `${formatPrice(taller.price)} · escríbenos por WhatsApp para reservar y pagar.`}
              </p>

              {/* Link de pago de Stripe (checkout externo) */}
              {!soldOut && taller.payment_link && (
                <a
                  href={taller.payment_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-lg px-5 py-3.5 text-center text-sm font-body font-semibold text-white transition-colors"
                  style={{ backgroundColor: '#B73D37' }}
                >
                  Pagar {formatPrice(taller.price)} y reservar
                </a>
              )}

              {/* Sin link de pago: se resuelve por WhatsApp, no cobramos en el sitio. */}
              {!soldOut && !taller.payment_link && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-lg px-5 py-3.5 text-center text-sm font-body font-semibold text-white transition-colors"
                  style={{ backgroundColor: '#25D366' }}
                >
                  Escríbenos por WhatsApp para reservar →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TallerDetalle
