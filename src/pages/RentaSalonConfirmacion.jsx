import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchSalonCheckoutStatus } from '../services/salonRentalService'

const RED = '#B73D37'
const DARK = '#1F2937'
const GRAY = '#6B7280'

function formatMoney(n) {
  return `$${Number(n || 0).toLocaleString('es-MX')} MXN`
}

function RentaSalonConfirmacion() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState('loading') // loading | paid | pending | error
  const [booking, setBooking] = useState(null)
  const attemptsRef = useRef(0)

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      return
    }
    let alive = true
    let timer = null

    async function poll() {
      try {
        const data = await fetchSalonCheckoutStatus(sessionId)
        if (!alive) return
        setBooking(data.booking)
        if (data.status === 'paid') {
          setStatus('paid')
          return
        }
        attemptsRef.current += 1
        if (attemptsRef.current < 8) {
          timer = setTimeout(poll, 2000)
        } else {
          setStatus('pending')
        }
      } catch (err) {
        if (alive) setStatus('error')
      }
    }
    poll()

    return () => {
      alive = false
      if (timer) clearTimeout(timer)
    }
  }, [sessionId])

  return (
    <div className="pn-page-with-site-nav min-h-screen" style={{ background: 'var(--pn-color-bg-base)' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="rounded-2xl bg-white ring-1 ring-black/[0.06] p-8 text-center">
          {status === 'loading' && (
            <>
              <p className="font-heading text-lg font-bold mb-2" style={{ color: DARK }}>Confirmando tu pago…</p>
              <p className="font-body text-sm" style={{ color: GRAY }}>Un momento, estamos verificando tu reserva con Stripe.</p>
            </>
          )}

          {status === 'paid' && booking && (
            <>
              <p className="font-heading text-2xl font-bold mb-2" style={{ color: DARK }}>¡Reserva confirmada!</p>
              <p className="font-body text-sm mb-6" style={{ color: GRAY }}>
                Te enviamos los detalles a {booking.customer_email}.
              </p>
              <dl className="text-left text-sm font-body space-y-2 rounded-lg p-4" style={{ backgroundColor: '#F9FAFB', color: DARK }}>
                <div className="flex justify-between"><dt className="font-semibold">Fecha</dt><dd>{booking.booking_date}</dd></div>
                <div className="flex justify-between"><dt className="font-semibold">Horario</dt><dd>{booking.start_time}–{booking.end_time}</dd></div>
                <div className="flex justify-between"><dt className="font-semibold">Personas</dt><dd>{booking.num_people}</dd></div>
                <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: '#E5E7EB' }}><dt>Total pagado</dt><dd>{formatMoney(booking.total_amount)}</dd></div>
              </dl>
            </>
          )}

          {status === 'pending' && (
            <>
              <p className="font-heading text-lg font-bold mb-2" style={{ color: DARK }}>Tu pago fue exitoso</p>
              <p className="font-body text-sm" style={{ color: GRAY }}>
                Estamos terminando de confirmar tu reserva — recibirás un correo en cuanto quede lista. Si no llega en unos minutos, escríbenos.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <p className="font-heading text-lg font-bold mb-2" style={{ color: RED }}>No pudimos verificar tu pago</p>
              <p className="font-body text-sm" style={{ color: GRAY }}>
                Si tu pago fue exitoso, no te preocupes: te llegará la confirmación por correo. Si tienes dudas, contáctanos directamente.
              </p>
            </>
          )}

          <Link
            to="/renta-salon"
            className="inline-block mt-6 rounded-lg px-5 py-2.5 text-sm font-body font-semibold text-white"
            style={{ backgroundColor: RED }}
          >
            Volver a Renta de salón
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RentaSalonConfirmacion
