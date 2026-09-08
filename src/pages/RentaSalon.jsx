import { useEffect, useMemo, useState } from 'react'
import {
  SALON_SLOTS,
  SALON_PRICE_TIERS,
  SALON_EXTRAS,
  SALON_MAX_CAPACITY,
  SALON_MIN_HOURS,
  getSlotsForDay,
  dayOfWeekFromDateStr,
  addHoursToTime,
  computeSalonPrice,
} from '../config/salonPricing'
import { fetchSalonAvailability, createSalonCheckout, submitSalonSpecialRequest } from '../services/salonRentalService'

const RED = '#B73D37'
const DARK = '#1F2937'
const GRAY = '#6B7280'

function formatMoney(n) {
  return `$${Number(n || 0).toLocaleString('es-MX')} MXN`
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function timeToMinutes(t) {
  const [h, m] = String(t || '0:0').split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart
}

const inputClass =
  'w-full rounded-lg border px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2'
const inputStyle = { borderColor: '#E5E7EB', color: DARK }

function RentaSalon() {
  const [tab, setTab] = useState('reservar') // 'reservar' | 'especial'

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
            Elige tu horario y paga en línea al instante.
          </p>
        </header>

        <PricingTable />

        <div className="mt-10 flex gap-2 border-b" style={{ borderColor: '#E5E7EB' }}>
          <TabButton active={tab === 'reservar'} onClick={() => setTab('reservar')}>
            Reservar en línea
          </TabButton>
          <TabButton active={tab === 'especial'} onClick={() => setTab('especial')}>
            Sobre horario de clase
          </TabButton>
        </div>

        {tab === 'reservar' ? <ReservaForm /> : <SolicitudEspecialForm />}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-3 text-sm font-body font-semibold border-b-2 -mb-px transition-colors"
      style={{ borderColor: active ? RED : 'transparent', color: active ? RED : GRAY }}
    >
      {children}
    </button>
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
        grande? <a href="https://wa.me/525554379644" target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{ color: RED }}>Contáctanos</a> para cotizarlo.
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
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 space-y-1.5 text-xs font-body" style={{ color: GRAY }}>
        <p>Extras opcionales: {SALON_EXTRAS.proyector.label} {formatMoney(SALON_EXTRAS.proyector.amount)} · {SALON_EXTRAS.montaje.label} {formatMoney(SALON_EXTRAS.montaje.amount)}.</p>
        <p>Las horas rentadas son de puerta a puerta: incluyen tu montaje y recogida, no solo la actividad.</p>
        <p>El precio se cotiza según el número de personas contratado. Si llegan más personas de las declaradas, se cobra la diferencia al cierre.</p>
        <p>Horarios: Mañana L–V 09:30–16:00 · Tarde L–V 16:00–19:00 · Fin de semana día Sáb/Dom 11:30–19:00 · Noche L–D 19:00–21:30.</p>
      </div>
    </div>
  )
}

function ReservaForm() {
  const [date, setDate] = useState(todayStr())
  const [slotKey, setSlotKey] = useState('')
  const [startTime, setStartTime] = useState('')
  const [hours, setHours] = useState(2)
  const [numPeople, setNumPeople] = useState(2)
  const [extras, setExtras] = useState({ proyector: false, montaje: false })
  const [customer, setCustomer] = useState({ firstName: '', lastName: '', email: '', phone: '' })
  const [bookedRanges, setBookedRanges] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const dayOfWeek = useMemo(() => dayOfWeekFromDateStr(date), [date])
  const availableSlots = useMemo(() => getSlotsForDay(dayOfWeek), [dayOfWeek])

  useEffect(() => {
    if (!availableSlots.find((s) => s.key === slotKey)) {
      setSlotKey(availableSlots[0]?.key || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, availableSlots.map((s) => s.key).join(',')])

  useEffect(() => {
    if (!date) return
    let alive = true
    fetchSalonAvailability(date)
      .then((ranges) => alive && setBookedRanges(ranges))
      .catch(() => alive && setBookedRanges([]))
    return () => {
      alive = false
    }
  }, [date])

  const slot = SALON_SLOTS[slotKey]

  const startTimeOptions = useMemo(() => {
    if (!slot) return []
    const opts = []
    const slotStart = timeToMinutes(slot.startTime)
    const slotEnd = timeToMinutes(slot.endTime)
    for (let m = slotStart; m + SALON_MIN_HOURS * 60 <= slotEnd; m += 30) {
      opts.push(minutesToTime(m))
    }
    return opts
  }, [slot])

  useEffect(() => {
    if (startTimeOptions.length && !startTimeOptions.includes(startTime)) {
      setStartTime(startTimeOptions[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTimeOptions.join(',')])

  const maxHours = useMemo(() => {
    if (!slot || !startTime) return SALON_MIN_HOURS
    return Math.max(SALON_MIN_HOURS, (timeToMinutes(slot.endTime) - timeToMinutes(startTime)) / 60)
  }, [slot, startTime])

  const endTime = useMemo(() => (startTime ? addHoursToTime(startTime, hours) : null), [startTime, hours])

  const overlapsExisting = useMemo(() => {
    if (!startTime || !endTime) return false
    const s = timeToMinutes(startTime)
    const e = timeToMinutes(endTime)
    return bookedRanges.some((r) => rangesOverlap(s, e, timeToMinutes(r.startTime), timeToMinutes(r.endTime)))
  }, [bookedRanges, startTime, endTime])

  const price = useMemo(() => {
    if (!slotKey || !hours || !numPeople) return null
    return computeSalonPrice({ slotKey, numPeople, hours, extras })
  }, [slotKey, hours, numPeople, extras])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!slot) {
      setError('Ese día no tiene franjas de renta automática disponibles. Usa la pestaña "Sobre horario de clase".')
      return
    }
    if (Number(hours) > maxHours) {
      setError(`Con esa hora de inicio, el máximo dentro de "${slot.label}" es ${maxHours} horas.`)
      return
    }
    if (overlapsExisting) {
      setError('Ese horario ya está ocupado, elige otro.')
      return
    }
    if (!customer.firstName.trim() || !customer.email.trim()) {
      setError('Nombre y correo son obligatorios.')
      return
    }
    setSubmitting(true)
    try {
      const url = await createSalonCheckout({ date, startTime, hours: Number(hours), numPeople: Number(numPeople), extras, customer })
      window.location.href = url
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-2xl bg-white ring-1 ring-black/[0.06] p-5 md:p-6 space-y-5">
      {!slot && (
        <p className="text-sm font-body rounded-lg p-3" style={{ backgroundColor: '#FFF7ED', color: '#9A5B13' }}>
          Ese día no tiene franjas de renta automática. Usa la pestaña "Sobre horario de clase" para solicitar un horario especial.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Fecha">
          <input type="date" min={todayStr()} value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} style={inputStyle} required />
        </Field>
        <Field label="Franja">
          <select value={slotKey} onChange={(e) => setSlotKey(e.target.value)} className={inputClass} style={inputStyle} disabled={!availableSlots.length}>
            {availableSlots.map((s) => (
              <option key={s.key} value={s.key}>{s.label} ({s.startTime}–{s.endTime})</option>
            ))}
          </select>
        </Field>
        <Field label="Hora de inicio">
          <select value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} style={inputStyle} disabled={!startTimeOptions.length}>
            {startTimeOptions.map((t) => {
              const s = timeToMinutes(t)
              const e2 = s + Number(hours || 1) * 60
              const taken = bookedRanges.some((r) => rangesOverlap(s, e2, timeToMinutes(r.startTime), timeToMinutes(r.endTime)))
              return (
                <option key={t} value={t} disabled={taken}>
                  {t}{taken ? ' (ocupado)' : ''}
                </option>
              )
            })}
          </select>
        </Field>
        <Field label={`Horas (máx. ${maxHours} desde esa hora)`}>
          <input type="number" min={SALON_MIN_HOURS} max={maxHours} step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} className={inputClass} style={inputStyle} required />
        </Field>
        <Field label={`Número de personas (máx. ${SALON_MAX_CAPACITY})`}>
          <input type="number" min={1} max={SALON_MAX_CAPACITY} value={numPeople} onChange={(e) => setNumPeople(e.target.value)} className={inputClass} style={inputStyle} required />
        </Field>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm font-body" style={{ color: DARK }}>
          <input type="checkbox" checked={extras.proyector} onChange={(e) => setExtras((x) => ({ ...x, proyector: e.target.checked }))} />
          {SALON_EXTRAS.proyector.label} ({formatMoney(SALON_EXTRAS.proyector.amount)})
        </label>
        <label className="flex items-center gap-2 text-sm font-body" style={{ color: DARK }}>
          <input type="checkbox" checked={extras.montaje} onChange={(e) => setExtras((x) => ({ ...x, montaje: e.target.checked }))} />
          {SALON_EXTRAS.montaje.label} ({formatMoney(SALON_EXTRAS.montaje.amount)})
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nombre">
          <input type="text" value={customer.firstName} onChange={(e) => setCustomer((c) => ({ ...c, firstName: e.target.value }))} className={inputClass} style={inputStyle} required />
        </Field>
        <Field label="Apellido">
          <input type="text" value={customer.lastName} onChange={(e) => setCustomer((c) => ({ ...c, lastName: e.target.value }))} className={inputClass} style={inputStyle} />
        </Field>
        <Field label="Correo">
          <input type="email" value={customer.email} onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))} className={inputClass} style={inputStyle} required />
        </Field>
        <Field label="Teléfono">
          <input type="tel" value={customer.phone} onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))} className={inputClass} style={inputStyle} />
        </Field>
      </div>

      {price && (
        <div className="rounded-lg p-4 text-sm font-body" style={{ backgroundColor: '#F9FAFB', color: DARK }}>
          <div className="flex justify-between"><span>{hours}h × {formatMoney(price.hourlyRate)}/hr</span><span>{formatMoney(price.baseAmount)}</span></div>
          {price.extrasAmount > 0 && <div className="flex justify-between"><span>Extras</span><span>{formatMoney(price.extrasAmount)}</span></div>}
          <div className="flex justify-between font-bold mt-2 pt-2 border-t" style={{ borderColor: '#E5E7EB' }}>
            <span>Total</span><span>{formatMoney(price.totalAmount)}</span>
          </div>
        </div>
      )}

      {error && <p className="text-sm font-body" style={{ color: RED }}>{error}</p>}

      <button
        type="submit"
        disabled={submitting || !slot || overlapsExisting}
        className="w-full rounded-lg px-5 py-3 text-sm font-body font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        style={{ backgroundColor: RED }}
      >
        {submitting ? 'Redirigiendo a pago…' : price ? `Pagar ${formatMoney(price.totalAmount)} y reservar` : 'Continuar al pago'}
      </button>
    </form>
  )
}

function SolicitudEspecialForm() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    desiredDate: '', desiredTime: '', durationHours: '', numPeople: '', notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.firstName.trim() || !form.email.trim()) {
      setError('Nombre y correo son obligatorios.')
      return
    }
    setSubmitting(true)
    try {
      await submitSalonSpecialRequest({
        customer: { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone },
        desiredDate: form.desiredDate || null,
        desiredTime: form.desiredTime || null,
        durationHours: form.durationHours || null,
        numPeople: form.numPeople || null,
        notes: form.notes || null,
      })
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="mt-6 rounded-2xl bg-white ring-1 ring-black/[0.06] p-6 text-center">
        <p className="font-heading text-lg font-bold mb-2" style={{ color: DARK }}>¡Recibimos tu solicitud!</p>
        <p className="font-body text-sm" style={{ color: GRAY }}>
          Como este horario implica mover una clase regular, nuestro equipo te contactará para confirmar disponibilidad y coordinar el pago.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-2xl bg-white ring-1 ring-black/[0.06] p-5 md:p-6 space-y-5">
      <p className="text-sm font-body" style={{ color: GRAY }}>
        Esta franja implica desplazar una clase regular del horario del estudio, así que no se reserva ni se cobra en línea de forma automática. Cuéntanos qué necesitas y te contactamos para confirmar y cobrar directamente.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nombre">
          <input type="text" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} className={inputClass} style={inputStyle} required />
        </Field>
        <Field label="Apellido">
          <input type="text" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} className={inputClass} style={inputStyle} />
        </Field>
        <Field label="Correo">
          <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputClass} style={inputStyle} required />
        </Field>
        <Field label="Teléfono">
          <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputClass} style={inputStyle} />
        </Field>
        <Field label="Fecha deseada">
          <input type="date" value={form.desiredDate} onChange={(e) => setForm((f) => ({ ...f, desiredDate: e.target.value }))} className={inputClass} style={inputStyle} />
        </Field>
        <Field label="Hora deseada">
          <input type="text" placeholder="ej. 18:00" value={form.desiredTime} onChange={(e) => setForm((f) => ({ ...f, desiredTime: e.target.value }))} className={inputClass} style={inputStyle} />
        </Field>
        <Field label="Duración (horas)">
          <input type="number" min={1} value={form.durationHours} onChange={(e) => setForm((f) => ({ ...f, durationHours: e.target.value }))} className={inputClass} style={inputStyle} />
        </Field>
        <Field label="Número de personas">
          <input type="number" min={1} value={form.numPeople} onChange={(e) => setForm((f) => ({ ...f, numPeople: e.target.value }))} className={inputClass} style={inputStyle} />
        </Field>
      </div>
      <Field label="Notas (opcional)">
        <textarea rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className={inputClass} style={inputStyle} />
      </Field>

      {error && <p className="text-sm font-body" style={{ color: RED }}>{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg px-5 py-3 text-sm font-body font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        style={{ backgroundColor: RED }}
      >
        {submitting ? 'Enviando…' : 'Enviar solicitud'}
      </button>
    </form>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-body font-semibold uppercase tracking-wide mb-1.5" style={{ color: GRAY }}>
        {label}
      </span>
      {children}
    </label>
  )
}

export default RentaSalon
