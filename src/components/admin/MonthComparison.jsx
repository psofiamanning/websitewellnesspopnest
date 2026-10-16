import { useMemo, useState } from 'react'
import { format, getDaysInMonth, parseISO, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

// Comparativo de meses para el equipo (operadores y super_admin). Solo conteos, NUNCA montos.
// Todo se agrupa por día en hora de CDMX.

export const cdmxDay = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' }) : ''

const SERIES_COLORS = ['#B73D37', '#2F6F8F', '#C08A2E']

const monthKeyOf = (day) => day.slice(0, 7) // 'yyyy-MM'
const monthLabel = (key) => {
  const s = format(parseISO(`${key}-01`), 'MMMM yyyy', { locale: es })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Cada evento: { day: 'yyyy-MM-dd', metric, client }
function buildEvents(bookings, packages) {
  const events = []
  for (const p of packages) {
    if (p.adminGranted) continue
    if (!(p.payment?.status === 'succeeded' || p.status === 'confirmed')) continue
    const day = cdmxDay(p.createdAt || p.purchaseDate)
    if (!day) continue
    const client = (p.customer?.email || '').toLowerCase()
    events.push({ day, metric: 'packages', client })
    if (p.referredBy) events.push({ day, metric: 'referrals', client })
  }
  for (const b of bookings) {
    if (b.status === 'cancelled') continue
    const client = (b.customer?.email || '').toLowerCase()
    const bookedDay = cdmxDay(b.createdAt)
    if (bookedDay) {
      if (b.paymentMethod === 'card') events.push({ day: bookedDay, metric: 'singleClasses', client })
      if (b.paymentMethod === 'discount_code') events.push({ day: bookedDay, metric: 'promoClasses', client })
      if (b.paymentMethod === 'package') events.push({ day: bookedDay, metric: 'packageBookings', client })
      if (b.referredBy) events.push({ day: bookedDay, metric: 'referrals', client })
    }
    // Asistencias: por fecha de la clase (no de la reserva)
    if (b.date) events.push({ day: b.date, metric: 'attendance', client })
  }
  // Clientes nuevos: primer movimiento (compra o reserva) de cada correo
  const firstSeen = {}
  for (const e of events) {
    if (!e.client || e.metric === 'attendance') continue
    if (!firstSeen[e.client] || e.day < firstSeen[e.client]) firstSeen[e.client] = e.day
  }
  for (const day of Object.values(firstSeen)) events.push({ day, metric: 'newClients', client: '' })
  // Ventas = paquetes + clases sueltas pagadas
  for (const e of events.filter((x) => x.metric === 'packages' || x.metric === 'singleClasses')) {
    events.push({ day: e.day, metric: 'sales', client: e.client })
  }
  return events
}

const METRICS = [
  { key: 'sales', label: 'Ventas (paquetes + clases sueltas)', hint: 'Lo que se vendió: paquetes pagados y clases sueltas pagadas con tarjeta.' },
  { key: 'packages', label: 'Paquetes vendidos', hint: 'Por fecha de compra; no incluye paquetes otorgados por admin.' },
  { key: 'singleClasses', label: 'Clases sueltas vendidas', hint: 'Reservas pagadas con tarjeta, por fecha en que se reservaron.' },
  { key: 'promoClasses', label: 'Clases con código de descuento', hint: 'Reservas hechas con código (clase de prueba / promoción).' },
  { key: 'packageBookings', label: 'Reservas con paquete', hint: 'Clases reservadas usando un paquete, por fecha en que se reservaron.' },
  { key: 'attendance', label: 'Asistencias (reservas por fecha de clase)', hint: 'Reservas confirmadas cuya clase cae en el mes.' },
  { key: 'newClients', label: 'Clientes nuevos', hint: 'Personas cuya primera compra o reserva fue en ese mes.' },
  { key: 'referrals', label: 'Con referido', hint: 'Compras o reservas donde escribieron quién les refirió.' },
]

function ProgressChart({ series, metricLabel }) {
  const W = 640
  const H = 240
  const pad = { l: 34, r: 12, t: 12, b: 26 }
  const maxDay = 31
  const maxVal = Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.v)))
  const x = (d) => pad.l + ((d - 1) / (maxDay - 1)) * (W - pad.l - pad.r)
  const y = (v) => H - pad.b - (v / maxVal) * (H - pad.t - pad.b)
  const yTicks = [0, Math.round(maxVal / 2), maxVal]

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Progreso acumulado: ${metricLabel}`}>
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#E5E7EB" strokeWidth="1" />
            <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#6B7280">{t}</text>
          </g>
        ))}
        {[1, 5, 10, 15, 20, 25, 31].map((d) => (
          <text key={d} x={x(d)} y={H - 8} textAnchor="middle" fontSize="11" fill="#6B7280">{d}</text>
        ))}
        {series.map((s) => (
          <g key={s.key}>
            <polyline
              fill="none"
              stroke={s.color}
              strokeWidth={s.primary ? 3 : 2}
              strokeDasharray={s.primary ? undefined : '5 4'}
              strokeLinejoin="round"
              points={s.points.map((p) => `${x(p.d)},${y(p.v)}`).join(' ')}
            />
            {s.points.length > 0 && (
              <circle cx={x(s.points[s.points.length - 1].d)} cy={y(s.points[s.points.length - 1].v)} r="4" fill={s.color} />
            )}
          </g>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-sm font-body">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-2">
            <span className="inline-block h-1 w-6 rounded" style={{ background: s.color }} />
            {s.label}: <strong>{s.points.length ? s.points[s.points.length - 1].v : 0}</strong>
          </span>
        ))}
      </div>
      <p className="mt-1 text-xs font-body text-neutral-500">Eje horizontal: día del mes. Eje vertical: total acumulado.</p>
    </div>
  )
}

function MonthComparison({ bookings, packages }) {
  const todayDay = cdmxDay(new Date().toISOString())
  const currentMonth = monthKeyOf(todayDay)
  const events = useMemo(() => buildEvents(bookings, packages), [bookings, packages])

  const availableMonths = useMemo(() => {
    const set = new Set(events.map((e) => monthKeyOf(e.day)).filter((m) => m <= currentMonth))
    set.add(currentMonth)
    return [...set].sort().reverse()
  }, [events, currentMonth])

  const prev = (n) => format(subMonths(parseISO(`${currentMonth}-01`), n), 'yyyy-MM')
  const [months, setMonths] = useState(() => [currentMonth, prev(1), prev(2)])
  const [chartMetric, setChartMetric] = useState('sales')

  const selected = months.filter(Boolean)
  // Corte "a la fecha": si el mes principal es el actual, compara cada mes hasta el mismo día.
  const cutoffDay = months[0] === currentMonth ? Number(todayDay.slice(8, 10)) : null

  const count = (metric, month, upToDay = null) =>
    events.filter(
      (e) => e.metric === metric && monthKeyOf(e.day) === month && (upToDay == null || Number(e.day.slice(8, 10)) <= upToDay)
    ).length

  const series = selected.map((m, i) => {
    const lastDay = m === currentMonth ? Number(todayDay.slice(8, 10)) : getDaysInMonth(parseISO(`${m}-01`))
    const perDay = Array(32).fill(0)
    for (const e of events) {
      if (e.metric === chartMetric && monthKeyOf(e.day) === m) perDay[Number(e.day.slice(8, 10))]++
    }
    let acc = 0
    const points = []
    for (let d = 1; d <= lastDay; d++) {
      acc += perDay[d]
      points.push({ d, v: acc })
    }
    return { key: `${m}-${i}`, label: monthLabel(m), color: SERIES_COLORS[months.indexOf(m)], primary: i === 0, points }
  })

  const setMonthAt = (i, value) => setMonths((ms) => ms.map((m, j) => (j === i ? value : m)))
  const diffBadge = (a, b) => {
    if (b === 0) return a > 0 ? <span className="text-green-700">nuevo</span> : null
    const pct = Math.round(((a - b) / b) * 100)
    const cls = pct > 0 ? 'text-green-700' : pct < 0 ? 'text-red-700' : 'text-neutral-500'
    return <span className={cls}>{pct > 0 ? '+' : ''}{pct}%</span>
  }

  const selectCls = 'w-full px-3 py-2 rounded-lg border-2 border-neutral focus:border-primary focus:outline-none font-body text-body bg-white'
  const metricLabel = METRICS.find((m) => m.key === chartMetric)?.label || ''

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-h3 font-heading text-body mb-1">Comparar meses</h2>
        <p className="text-sm font-body text-neutral-600">
          Cantidades por mes para seguir el avance de ventas. Las fechas son en hora de CDMX. No se muestran montos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <label className="block text-body font-body font-medium mb-2">
              <span className="inline-block h-2 w-2 rounded-full mr-2 align-middle" style={{ background: SERIES_COLORS[i] }} />
              {i === 0 ? 'Mes principal' : `Comparar con${i === 2 ? ' (opcional)' : ''}`}
            </label>
            <select value={months[i] || ''} onChange={(e) => setMonthAt(i, e.target.value)} className={selectCls}>
              {i > 0 && <option value="">— Ninguno —</option>}
              {availableMonths.map((m) => (
                <option key={m} value={m}>{monthLabel(m)}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="rounded-lg border-2 border-neutral p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <h3 className="font-heading text-body text-lg">Avance durante el mes</h3>
          <select value={chartMetric} onChange={(e) => setChartMetric(e.target.value)} className={`${selectCls} md:w-80`} aria-label="Qué medir en la gráfica">
            {METRICS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </div>
        <ProgressChart series={series} metricLabel={metricLabel} />
      </div>

      <div className="rounded-lg border-2 border-neutral overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="bg-quaternary/40 text-left">
              <th className="px-3 py-2 font-medium">Métrica</th>
              {selected.map((m, i) => (
                <th key={`${m}-${i}`} className="px-3 py-2 font-medium whitespace-nowrap">
                  <span className="inline-block h-2 w-2 rounded-full mr-2 align-middle" style={{ background: SERIES_COLORS[months.indexOf(m)] }} />
                  {monthLabel(m)}
                  {m === currentMonth && <span className="text-neutral-500 font-normal"> (en curso)</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS.map((metric) => {
              const main = count(metric.key, selected[0])
              return (
                <tr key={metric.key} className="border-t border-neutral">
                  <td className="px-3 py-2">
                    <div className="font-medium">{metric.label}</div>
                    <div className="text-xs text-neutral-500">{metric.hint}</div>
                  </td>
                  {selected.map((m, i) => {
                    const total = count(metric.key, m)
                    const toDate = cutoffDay != null && i > 0 ? count(metric.key, m, cutoffDay) : null
                    return (
                      <td key={`${m}-${i}`} className="px-3 py-2 align-top whitespace-nowrap">
                        <div className="text-lg font-heading">{total}</div>
                        {toDate != null && (
                          <div className="text-xs text-neutral-600">
                            al día {cutoffDay}: <strong>{toDate}</strong> {diffBadge(main, toDate)}
                          </div>
                        )}
                        {cutoffDay == null && i > 0 && <div className="text-xs">{diffBadge(main, total)}</div>}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {cutoffDay != null && (
        <p className="text-xs font-body text-neutral-500">
          “Al día {cutoffDay}”: lo que llevaba ese mes en los primeros {cutoffDay} días, para comparar justo con el mes en curso. El porcentaje compara {monthLabel(selected[0])} contra ese corte.
        </p>
      )}
    </div>
  )
}

export default MonthComparison
