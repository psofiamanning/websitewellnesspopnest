import {
  SALON_SLOTS,
  SALON_PRICE_TIERS,
  SALON_EXTRAS,
  SALON_MAX_CAPACITY,
  SALON_MIN_HOURS,
} from '../config/salonPricing'

const RED = '#B73D37'
const DARK = '#1F2937'
const GRAY = '#6B7280'
const AMBER = '#9A5B13'

function formatMoney(n) {
  return `$${Number(n || 0).toLocaleString('es-MX')} MXN`
}

const WHATSAPP_HREF =
  'https://wa.me/525554379644?text=' +
  encodeURIComponent('Hola, me interesa rentar el salón de Popnest. ¿Me compartes disponibilidad?')

function RentaSalon() {
  return (
    <div className="pn-page-with-site-nav min-h-screen" style={{ background: 'var(--pn-color-bg-base)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <header className="mb-10">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: RED }}>
            Espacios · Popnest
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold" style={{ color: DARK }}>
            Renta de salón.
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg font-body" style={{ color: GRAY }}>
            Renta nuestro salón para tu evento, clase privada, sesión de trabajo o celebración.
            Escríbenos por WhatsApp para revisar disponibilidad y apartar tu fecha.
          </p>
        </header>

        <PricingTable />

        <div className="mt-10 rounded-2xl bg-white ring-1 ring-black/[0.06] p-6 md:p-8 text-center">
          <h2 className="font-heading text-xl font-bold mb-2" style={{ color: DARK }}>
            Reserva por WhatsApp
          </h2>
          <p className="text-sm font-body mb-6 max-w-xl mx-auto" style={{ color: GRAY }}>
            Cuéntanos la fecha, el horario, cuántas horas y cuántas personas. Te confirmamos disponibilidad y el pago
            directamente.
          </p>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg px-6 py-3.5 text-sm font-body font-semibold text-white transition-colors"
            style={{ backgroundColor: '#25D366' }}
          >
            Escríbenos por WhatsApp →
          </a>
        </div>
      </div>
    </div>
  )
}

function PricingTable() {
  const slotKeys = Object.keys(SALON_SLOTS)
  return (
    <div className="rounded-2xl bg-white ring-1 ring-black/[0.06] p-5 md:p-6 overflow-x-auto">
      <h2 className="font-heading text-lg font-bold mb-1" style={{ color: DARK }}>
        Precios por hora (MXN)
      </h2>
      <p className="text-sm font-body mb-4" style={{ color: GRAY }}>
        Capacidad máxima {SALON_MAX_CAPACITY} personas · renta mínima {SALON_MIN_HOURS} hora. ¿Tu grupo es más
        grande? <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{ color: RED }}>Contáctanos</a> para cotizarlo.
      </p>
      <table className="w-full text-sm font-body min-w-[520px]">
        <thead>
          <tr style={{ color: GRAY }}>
            <th className="text-left py-2 pr-3 font-semibold">Personas</th>
            {slotKeys.map((k) => (
              <th key={k} className="text-left py-2 pr-3 font-semibold">
                {SALON_SLOTS[k].label}
              </th>
            ))}
            <th className="text-left py-2 pr-3 font-semibold" style={{ color: AMBER }}>
              Sobre horario de clase
            </th>
          </tr>
        </thead>
        <tbody>
          {SALON_PRICE_TIERS.map((tier) => (
            <tr key={`${tier.minPeople}-${tier.maxPeople}`} className="border-t" style={{ borderColor: '#F3F4F6' }}>
              <td className="py-2 pr-3 font-semibold" style={{ color: DARK }}>
                {tier.minPeople}–{tier.maxPeople}
              </td>
              {slotKeys.map((k) => (
                <td key={k} className="py-2 pr-3" style={{ color: DARK }}>
                  {formatMoney(tier.prices[k])}/hr
                </td>
              ))}
              <td className="py-2 pr-3" style={{ color: AMBER }}>
                {formatMoney(tier.sobreHorarioClase)}/hr
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 space-y-1.5 text-xs font-body" style={{ color: GRAY }}>
        <p>Extras opcionales: {SALON_EXTRAS.proyector.label} {formatMoney(SALON_EXTRAS.proyector.amount)} · {SALON_EXTRAS.montaje.label} {formatMoney(SALON_EXTRAS.montaje.amount)}.</p>
        <p>Las horas rentadas son de puerta a puerta: incluyen tu montaje y recogida, no solo la actividad.</p>
        <p>El precio se cotiza según el número de personas contratado. Si llegan más personas de las declaradas, se cobra la diferencia al cierre.</p>
        <p>Horarios: Mañana L–V 09:30–16:00 · Tarde L–V 16:00–19:00 · Fin de semana día Sáb/Dom 11:30–19:00 · Noche L–D 19:00–21:30.</p>
        <p className="font-semibold" style={{ color: AMBER }}>
          Si necesitas un horario donde ya hay una clase, aplica el precio de la columna "Sobre horario de clase".
        </p>
      </div>
    </div>
  )
}

export default RentaSalon
