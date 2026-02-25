import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTeacherUpcomingBookings, getTeacherName, isTeacherAuthenticated, teacherLogout } from '../services/teacherService'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

function TeacherDashboard() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isTeacherAuthenticated()) {
      navigate('/profesores/login', { replace: true })
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        const list = await getTeacherUpcomingBookings()
        if (!cancelled) setBookings(list)
      } catch (e) {
        if (!cancelled) setError(e.message || 'Error al cargar las reservas')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [navigate])

  const teacherName = getTeacherName() || 'Maestra'

  // Agrupar por fecha y luego por clase+hora
  const byDate = bookings.reduce((acc, b) => {
    const key = b.date || ''
    if (!acc[key]) acc[key] = []
    acc[key].push(b)
    return acc
  }, {})
  const sortedDates = Object.keys(byDate).sort()

  const formatDateLabel = (dateStr) => {
    try {
      return format(parseISO(dateStr), "EEEE, d 'de' MMMM", { locale: es })
    } catch {
      return dateStr
    }
  }

  if (!isTeacherAuthenticated()) return null

  return (
    <div className="wellness-background min-h-screen pt-28 pb-12 px-4">
      <div className="wellness-shapes">
        <div className="wellness-shape shape-1"></div>
        <div className="wellness-shape shape-2"></div>
        <div className="wellness-shape shape-3"></div>
      </div>

      <div className="wellness-content relative z-10 max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl border-2 p-6 md:p-8" style={{ borderColor: '#E5B3B0' }}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold" style={{ color: '#1F2937' }}>
                Mis próximas clases
              </h1>
              <p className="text-body font-body mt-1" style={{ color: '#6B7280' }}>
                Hola, {teacherName}
              </p>
            </div>
            <button
              type="button"
              onClick={teacherLogout}
              className="px-4 py-2 rounded-lg font-body text-sm border-2 transition-colors"
              style={{ borderColor: '#B73D37', color: '#B73D37' }}
            >
              Cerrar sesión
            </button>
          </div>

          {loading && (
            <p className="text-body font-body text-center py-8" style={{ color: '#6B7280' }}>
              Cargando reservas...
            </p>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-body text-red-800">{error}</p>
            </div>
          )}

          {!loading && !error && sortedDates.length === 0 && (
            <p className="text-body font-body text-center py-8" style={{ color: '#6B7280' }}>
              No hay reservas para tus próximas clases. Cuando los alumnos reserven, aparecerán aquí.
            </p>
          )}

          {!loading && !error && sortedDates.length > 0 && (
            <div className="space-y-8">
              {sortedDates.map((dateStr) => {
                const dayBookings = byDate[dateStr]
                const byClassTime = dayBookings.reduce((acc, b) => {
                  const key = `${b.className || 'Clase'}|${b.time || ''}`
                  if (!acc[key]) acc[key] = { className: b.className, time: b.time, list: [] }
                  acc[key].list.push(b)
                  return acc
                }, {})
                const slots = Object.values(byClassTime)
                return (
                  <section key={dateStr}>
                    <h2 className="text-lg font-heading font-semibold mb-4 capitalize" style={{ color: '#B73D37' }}>
                      {formatDateLabel(dateStr)}
                    </h2>
                    <div className="space-y-6">
                      {slots.map((slot, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border-2 p-4"
                          style={{ borderColor: '#E5B3B0', backgroundColor: '#fefcfb' }}
                        >
                          <div className="flex flex-wrap items-baseline gap-2 mb-3">
                            <span className="font-heading font-semibold" style={{ color: '#1F2937' }}>
                              {slot.className}
                            </span>
                            <span className="text-body font-body text-sm" style={{ color: '#6B7280' }}>
                              {slot.time}
                            </span>
                            <span className="text-body text-sm" style={{ color: '#6B7280' }}>
                              — {slot.list.length} {slot.list.length === 1 ? 'reserva' : 'reservas'}
                            </span>
                          </div>
                          <ul className="space-y-2">
                            {slot.list.map((b) => (
                              <li
                                key={b.id}
                                className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-body"
                                style={{ color: '#4B5563' }}
                              >
                                <span className="font-medium">{b.customer?.fullName || 'Sin nombre'}</span>
                                {b.customer?.email && (
                                  <a
                                    href={`mailto:${b.customer.email}`}
                                    className="hover:underline"
                                    style={{ color: '#B73D37' }}
                                  >
                                    {b.customer.email}
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          )}

          <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: '#E5B3B0' }}>
            <a href="/" className="text-sm font-body hover:underline" style={{ color: '#B73D37' }}>
              ← Volver al inicio
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard
