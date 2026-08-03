import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchTaller, bookTaller } from '../services/talleresService'
import { createPaymentIntent } from '../services/bookingService'
import StripeCardElement from '../components/StripeCardElement'
import { trackMetaLead } from '../utils/metaPixel'

function formatPrice(price) {
  const n = Number(price) || 0
  if (n <= 0) return 'Gratis'
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

  const [customer, setCustomer] = useState({ firstName: '', lastName: '', email: '', phone: '' })
  const [cardholderName, setCardholderName] = useState('')
  const [stripeCardData, setStripeCardData] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [formError, setFormError] = useState('')
  const [done, setDone] = useState(false)

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

  const isFree = taller ? Number(taller.price) <= 0 : false
  const soldOut = taller ? (taller.spots_available ?? 0) <= 0 : false

  const setField = (field, value) => {
    setFormError('')
    setCustomer((prev) => ({ ...prev, [field]: value }))
  }

  const contactReady =
    customer.firstName.trim() && customer.lastName.trim() && customer.email.trim() && customer.phone.trim()
  const paymentReady = isFree || (!!stripeCardData?.isComplete && !!cardholderName.trim())
  const canSubmit = contactReady && paymentReady && !soldOut && !processing

  const handleSubmit = async () => {
    setFormError('')
    if (!contactReady) {
      setFormError('Completa tus datos de contacto (nombre, apellido, correo y teléfono).')
      return
    }
    if (!isFree && (!stripeCardData?.isComplete || !cardholderName.trim())) {
      setFormError('Completa la información de la tarjeta.')
      return
    }

    setProcessing(true)
    try {
      let paymentIntentId = null

      if (!isFree) {
        const amount = Math.round(Number(taller.price) * 100)
        const intent = await createPaymentIntent(amount, 'mxn', customer)
        if (!intent?.clientSecret) throw new Error('No se pudo iniciar el pago. Intenta de nuevo.')

        const { stripe, elements } = stripeCardData || {}
        if (!stripe || !elements) throw new Error('El formulario de pago no está listo. Recarga la página.')
        const cardElement = elements.getElement('card')

        const result = await stripe.confirmCardPayment(intent.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardholderName || `${customer.firstName} ${customer.lastName}`,
              email: customer.email,
              phone: customer.phone,
            },
          },
        })
        if (result.error) throw new Error(result.error.message || 'El pago no se pudo procesar.')
        if (result.paymentIntent?.status !== 'succeeded') {
          throw new Error('El pago quedó pendiente. Verifica tu tarjeta e intenta de nuevo.')
        }
        paymentIntentId = result.paymentIntent.id
      }

      await bookTaller(id, { customer, paymentIntentId })

      trackMetaLead({
        content_name: 'reserva_taller',
        value: isFree ? 0 : Number(taller.price) || 0,
        currency: 'MXN',
      })
      setDone(true)
    } catch (e) {
      setFormError(e.message || 'Ocurrió un error al reservar. Intenta de nuevo.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="wellness-background min-h-screen">
        <div className="max-w-4xl mx-auto px-4 pt-28 pb-16 font-body" style={{ color: '#6B7280' }}>
          Cargando taller…
        </div>
      </div>
    )
  }

  if (error || !taller) {
    return (
      <div className="wellness-background min-h-screen">
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

  if (done) {
    return (
      <div className="wellness-background min-h-screen">
        <div className="max-w-2xl mx-auto px-4 pt-28 pb-16">
          <div className="rounded-2xl border-2 bg-white p-8 text-center" style={{ borderColor: '#D48D88' }}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: '#FEE2E2' }}>
              <span className="text-2xl">✓</span>
            </div>
            <h1 className="text-2xl font-heading font-bold mb-2" style={{ color: '#1F2937' }}>
              ¡Reserva confirmada!
            </h1>
            <p className="font-body mb-1" style={{ color: '#4B5563' }}>
              {taller.title}{formatFecha(taller.fecha) ? ` · ${formatFecha(taller.fecha)}` : ''}{taller.hora ? ` · ${taller.hora}` : ''}
            </p>
            <p className="font-body text-sm mb-6" style={{ color: '#6B7280' }}>
              Te enviamos un correo de confirmación a {customer.email}. ¡Te esperamos!
            </p>
            <button
              onClick={() => navigate('/talleres')}
              className="rounded-lg px-6 py-3 text-sm font-body font-semibold text-white"
              style={{ backgroundColor: '#B73D37' }}
            >
              Ver más talleres
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="wellness-background min-h-screen">
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
                  : isFree
                  ? 'Completa tus datos para apartar tu lugar.'
                  : `${formatPrice(taller.price)} · pago seguro con tarjeta.`}
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
                  {isFree ? 'Reservar mi lugar' : `Pagar ${formatPrice(taller.price)} y reservar`}
                </a>
              )}

              {/* Formulario con tarjeta en el sitio (cuando no hay link de Stripe) */}
              {!soldOut && !taller.payment_link && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <input className="rounded-lg border-2 px-4 py-3 font-body" style={{ borderColor: '#DED5D5' }} placeholder="Nombre" value={customer.firstName} onChange={(e) => setField('firstName', e.target.value)} />
                    <input className="rounded-lg border-2 px-4 py-3 font-body" style={{ borderColor: '#DED5D5' }} placeholder="Apellido" value={customer.lastName} onChange={(e) => setField('lastName', e.target.value)} />
                  </div>
                  <input type="email" className="mb-3 w-full rounded-lg border-2 px-4 py-3 font-body" style={{ borderColor: '#DED5D5' }} placeholder="Correo electrónico" value={customer.email} onChange={(e) => setField('email', e.target.value)} />
                  <input type="tel" className="mb-4 w-full rounded-lg border-2 px-4 py-3 font-body" style={{ borderColor: '#DED5D5' }} placeholder="Teléfono" value={customer.phone} onChange={(e) => setField('phone', e.target.value)} />

                  {!isFree && (
                    <div className="mb-4 border-t pt-4" style={{ borderColor: '#E5B3B0' }}>
                      <StripeCardElement
                        onCardReady={setStripeCardData}
                        cardholderName={cardholderName}
                        setCardholderName={setCardholderName}
                      />
                    </div>
                  )}

                  {formError && (
                    <p className="mb-3 text-sm font-body" style={{ color: '#B73D37' }}>{formError}</p>
                  )}

                  <button
                    type="button"
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                    className="w-full rounded-lg px-5 py-3.5 text-sm font-body font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: '#B73D37' }}
                  >
                    {processing ? 'Procesando…' : isFree ? 'Confirmar reserva' : `Pagar ${formatPrice(taller.price)} y reservar`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TallerDetalle
