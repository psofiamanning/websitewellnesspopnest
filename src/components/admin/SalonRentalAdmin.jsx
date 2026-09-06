import { useEffect, useState } from 'react'
import {
  adminListSalonBookings,
  adminListSalonSpecialRequests,
  adminUpdateSalonSpecialRequestStatus,
} from '../../services/salonRentalService'

const STATUS_LABEL = { pending: 'Pendiente', paid: 'Pagada', cancelled: 'Cancelada', expired: 'Vencida' }
const STATUS_COLOR = { pending: '#9A5B13', paid: '#166534', cancelled: '#6B7280', expired: '#9CA3AF' }
const REQUEST_STATUSES = ['nuevo', 'contactado', 'confirmado', 'rechazado']

function formatMoney(n) {
  return `$${Number(n || 0).toLocaleString('es-MX')} MXN`
}

export default function SalonRentalAdmin() {
  const [bookings, setBookings] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [b, r] = await Promise.all([adminListSalonBookings(), adminListSalonSpecialRequests()])
      setBookings(b)
      setRequests(r)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleStatusChange = async (id, status) => {
    setSavingId(id)
    try {
      const updated = await adminUpdateSalonSpecialRequestStatus(id, status)
      setRequests((rs) => rs.map((r) => (r.id === id ? updated : r)))
    } catch (e) {
      window.alert(e.message)
    } finally {
      setSavingId(null)
    }
  }

  if (loading) return <p className="p-6 text-sm text-gray-600">Cargando renta de salón…</p>
  if (error) return <p className="p-6 text-sm" style={{ color: '#B73D37' }}>Error: {error}</p>

  return (
    <div className="p-4 md:p-6 space-y-8">
      <section>
        <h3 className="text-lg font-heading font-bold mb-3" style={{ color: '#1F2937' }}>
          Reservas pagadas ({bookings.length})
        </h3>
        {bookings.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no hay reservas.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg ring-1 ring-black/[0.06]">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Horario</th>
                  <th className="px-3 py-2">Cliente</th>
                  <th className="px-3 py-2">Personas</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Estatus</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t border-gray-100">
                    <td className="px-3 py-2">{b.booking_date}</td>
                    <td className="px-3 py-2">{b.start_time}–{b.end_time}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{b.customer_name}</div>
                      <div className="text-xs text-gray-500">{b.customer_email}{b.customer_phone ? ` · ${b.customer_phone}` : ''}</div>
                    </td>
                    <td className="px-3 py-2">{b.num_people}</td>
                    <td className="px-3 py-2">{formatMoney(b.total_amount)}</td>
                    <td className="px-3 py-2">
                      <span className="font-semibold" style={{ color: STATUS_COLOR[b.status] || '#6B7280' }}>
                        {STATUS_LABEL[b.status] || b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-heading font-bold mb-1" style={{ color: '#1F2937' }}>
          Solicitudes especiales — sobre horario de clase ({requests.length})
        </h3>
        <p className="text-xs text-gray-500 mb-3">Implican mover una clase regular; confirma disponibilidad y cobra directamente con el cliente.</p>
        {requests.length === 0 ? (
          <p className="text-sm text-gray-500">Sin solicitudes.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg ring-1 ring-black/[0.06]">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="px-3 py-2">Cliente</th>
                  <th className="px-3 py-2">Fecha/hora deseada</th>
                  <th className="px-3 py-2">Duración</th>
                  <th className="px-3 py-2">Personas</th>
                  <th className="px-3 py-2">Notas</th>
                  <th className="px-3 py-2">Estatus</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100 align-top">
                    <td className="px-3 py-2">
                      <div className="font-medium">{r.customer_name}</div>
                      <div className="text-xs text-gray-500">{r.customer_email}{r.customer_phone ? ` · ${r.customer_phone}` : ''}</div>
                    </td>
                    <td className="px-3 py-2">{r.desired_date || '—'} {r.desired_time || ''}</td>
                    <td className="px-3 py-2">{r.duration_hours ? `${r.duration_hours}h` : '—'}</td>
                    <td className="px-3 py-2">{r.num_people || '—'}</td>
                    <td className="px-3 py-2 max-w-[220px] whitespace-pre-wrap">{r.notes || '—'}</td>
                    <td className="px-3 py-2">
                      <select
                        value={r.status}
                        disabled={savingId === r.id}
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                        className="rounded border border-gray-300 text-xs py-1 px-1.5"
                      >
                        {REQUEST_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
