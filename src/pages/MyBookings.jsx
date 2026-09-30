import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, isAuthenticated, isTokenExpired } from '../services/authService'
import { getBookingsByUser, rescheduleBooking, checkAvailability } from '../services/bookingService'
import { classTypes, classSchedules } from '../data/classes'
import { addDays, eachDayOfInterval, isSameDay, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { format } from 'date-fns'

const RESCHEDULE_MIN_HOURS = 48

// Inicio de la clase en hora de CDMX (UTC-6), igual que valida el servidor.
const classStartMs = (date, time) =>
  new Date(`${String(date).slice(0, 10)}T${String(time).trim().padStart(5, '0').slice(0, 5)}:00-06:00`).getTime()

const hhmm = (time) => String(time || '').trim().padStart(5, '0').slice(0, 5)

function MyBookings() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [rescheduleModal, setRescheduleModal] = useState(null) // { booking, availableDates, availableTimes }
  const [newDate, setNewDate] = useState(null)
  const [newTime, setNewTime] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slotStatus, setSlotStatus] = useState({}) // { 'HH:mm': 'loading' | 'ok' | 'full' | 'unavailable' }
  const [successMsg, setSuccessMsg] = useState('')

  const user = getCurrentUser()

  useEffect(() => {
    // Los tokens de sesión vencen en ~1 h: si ya venció, pedir login antes de que
    // la persona intente reagendar y le falle al confirmar.
    if (!isAuthenticated() || isTokenExpired() || !user?.email) {
      navigate('/login?from=/mis-reservas', { replace: true })
      return
    }
    const load = async () => {
      setLoading(true)
      try {
        const list = await getBookingsByUser(user.email)
        setBookings(list)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate, user?.email])

  const canReschedule = (booking) => {
    const hoursUntil = (classStartMs(booking.date, booking.time) - Date.now()) / (1000 * 60 * 60)
    return hoursUntil >= RESCHEDULE_MIN_HOURS
  }

  const getClassId = (className) => classTypes.find(c => c.name === className)?.id

  const openRescheduleModal = (booking) => {
    const classId = getClassId(booking.className)
    if (!classId) return
    const schedule = classSchedules[classId]
    if (!schedule) return

    const today = startOfDay(new Date())
    const endDate = addDays(today, 28)
    const allDays = eachDayOfInterval({ start: today, end: endDate })
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const availableDays = schedule.days || []
    const dates = allDays.filter(d => availableDays.includes(dayNames[d.getDay()]))

    let times = schedule.times || []
    if (schedule.timesByDay) {
      times = [...new Set(Object.values(schedule.timesByDay).flat())]
    }

    setRescheduleModal({
      booking,
      classId,
      schedule,
      availableDates: dates,
      availableTimes: times,
      dayNames
    })
    setNewDate(null)
    setNewTime(null)
    setError('')
    setSlotStatus({})
    setSuccessMsg('')
  }

  const getTimesForDate = (date) => {
    if (!rescheduleModal?.schedule || !date) return []
    const all = rescheduleModal.schedule.timesByDay
      ? rescheduleModal.schedule.timesByDay[rescheduleModal.dayNames[date.getDay()]] || []
      : rescheduleModal.availableTimes
    const dateStr = format(date, 'yyyy-MM-dd')
    const { booking } = rescheduleModal
    // Solo horarios futuros y distintos al que ya tiene reservado
    return all.filter(
      (t) =>
        classStartMs(dateStr, t) > Date.now() &&
        !(dateStr === booking.date && hhmm(t) === hhmm(booking.time))
    )
  }

  const timeSlots = getTimesForDate(newDate)

  // Al elegir fecha, consultar lugares reales de cada horario (tabla schedules)
  useEffect(() => {
    if (!rescheduleModal || !newDate) return
    const dateStr = format(newDate, 'yyyy-MM-dd')
    const times = getTimesForDate(newDate)
    let cancelled = false
    setSlotStatus(Object.fromEntries(times.map((t) => [t, 'loading'])))
    times.forEach(async (t) => {
      const res = await checkAvailability(rescheduleModal.booking.className, dateStr, t)
      if (cancelled) return
      let status = 'ok' // si no se pudo verificar, dejar elegir: el servidor valida el cupo
      if (!res.verificationFailed) {
        if (!res.maxBookings) status = 'unavailable'
        else if (!res.available) status = 'full'
      }
      setSlotStatus((prev) => ({ ...prev, [t]: status }))
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rescheduleModal, newDate])

  const handleConfirmReschedule = async () => {
    if (!rescheduleModal?.booking || !newDate || !newTime) return
    setSaving(true)
    setError('')
    try {
      const dateStr = format(newDate, 'yyyy-MM-dd')
      await rescheduleBooking(rescheduleModal.booking.id, { newDate: dateStr, newTime })
      const updated = await getBookingsByUser(user.email)
      setBookings(updated)
      setSuccessMsg(
        `Listo: tu clase de ${rescheduleModal.booking.className} quedó el ${format(newDate, "EEEE d 'de' MMMM", { locale: es })} a las ${hhmm(newTime)}.`
      )
      setRescheduleModal(null)
    } catch (e) {
      if (e.code === 'SESSION_EXPIRED') {
        navigate('/login?from=/mis-reservas', { replace: true })
        return
      }
      setError(e.message || 'Error al reagendar')
    } finally {
      setSaving(false)
    }
  }

  const upcomingBookings = bookings.filter((b) => classStartMs(b.date, b.time) >= Date.now())

  if (!user) return null

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <h1 className="text-3xl font-heading font-light mb-2" style={{ color: '#1F2937' }}>
          Mis reservas
        </h1>
        <p className="text-sm font-body mb-8" style={{ color: '#6B7280' }}>
          Aquí puedes ver tus clases reservadas y reagendar con al menos 48 horas de anticipación.
        </p>

        {successMsg && (
          <div
            role="status"
            className="mb-6 p-4 rounded-lg border font-body text-sm"
            style={{ backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', color: '#065F46' }}
          >
            {successMsg}
          </div>
        )}

        {loading ? (
          <p className="font-body" style={{ color: '#6B7280' }}>Cargando...</p>
        ) : upcomingBookings.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center" style={{ borderColor: '#E5E7EB' }}>
            <p className="font-body mb-4" style={{ color: '#4B5563' }}>
              No tienes reservas próximas.
            </p>
            <button
              type="button"
              onClick={() => navigate('/classes')}
              className="px-6 py-2.5 rounded-lg font-body font-semibold text-white"
              style={{ backgroundColor: '#B73D37' }}
            >
              Ver clases y reservar
            </button>
          </div>
        ) : (
          <ul className="space-y-4">
            {upcomingBookings.map((booking) => {
              const canReagendar = canReschedule(booking)
              return (
                <li
                  key={booking.id}
                  className="bg-white rounded-xl border p-5 shadow-sm"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-heading font-semibold text-lg" style={{ color: '#1F2937' }}>
                        {booking.className}
                      </p>
                      <p className="font-body text-sm mt-1" style={{ color: '#6B7280' }}>
                        {booking.formattedDate} · {hhmm(booking.time)}
                      </p>
                      {booking.teacherName && (
                        <p className="font-body text-sm mt-0.5" style={{ color: '#6B7280' }}>
                          Coach: {booking.teacherName}
                        </p>
                      )}
                    </div>
                    <div>
                      {canReagendar ? (
                        <button
                          type="button"
                          onClick={() => openRescheduleModal(booking)}
                          className="px-4 py-2 rounded-lg font-body font-medium text-white transition-opacity hover:opacity-90"
                          style={{ backgroundColor: '#B73D37' }}
                        >
                          Reagendar
                        </button>
                      ) : (
                        <span className="text-sm font-body" style={{ color: '#9CA3AF' }}>
                          Reagendar solo con 48 h de anticipación
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Modal reagendar */}
      {rescheduleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => !saving && setRescheduleModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-heading font-medium mb-2" style={{ color: '#1F2937' }}>
              Reagendar: {rescheduleModal.booking.className}
            </h2>
            <p className="text-sm font-body mb-4" style={{ color: '#6B7280' }}>
              Elige la nueva fecha y hora. Solo se muestran días y horarios disponibles para esta clase.
            </p>

            <p className="font-body text-sm font-medium mb-2" style={{ color: '#374151' }}>Nueva fecha</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {rescheduleModal.availableDates.map((date) => (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => {
                    setNewDate(date)
                    setNewTime(null)
                  }}
                  className="px-3 py-2 rounded-lg font-body text-sm border-2 transition-colors"
                  style={{
                    borderColor: newDate && isSameDay(date, newDate) ? '#B73D37' : '#E5E7EB',
                    backgroundColor: newDate && isSameDay(date, newDate) ? '#FDF2F2' : '#fff',
                    color: newDate && isSameDay(date, newDate) ? '#B73D37' : '#4B5563'
                  }}
                >
                  {format(date, 'EEE d MMM', { locale: es })}
                </button>
              ))}
            </div>

            <p className="font-body text-sm font-medium mb-2" style={{ color: '#374151' }}>Nueva hora</p>
            {!newDate ? (
              <p className="text-sm font-body mb-4" style={{ color: '#6B7280' }}>Selecciona primero una fecha para ver los horarios.</p>
            ) : timeSlots.length === 0 ? (
              <p className="text-sm font-body mb-4" style={{ color: '#6B7280' }}>No quedan horarios disponibles ese día. Elige otra fecha.</p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-4">
                {timeSlots.map((time) => {
                  const st = slotStatus[time]
                  const blocked = st === 'full' || st === 'unavailable' || st === 'loading'
                  const selected = newTime === time
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setNewTime(time)}
                      disabled={blocked}
                      className="px-3 py-2 rounded-lg font-body text-sm border-2 transition-colors disabled:cursor-not-allowed"
                      style={{
                        borderColor: selected ? '#B73D37' : '#E5E7EB',
                        backgroundColor: selected ? '#FDF2F2' : blocked ? '#F9FAFB' : '#fff',
                        color: selected ? '#B73D37' : blocked ? '#9CA3AF' : '#4B5563'
                      }}
                    >
                      {hhmm(time)}
                      {st === 'full' && ' · Lleno'}
                      {st === 'unavailable' && ' · No disponible'}
                    </button>
                  )
                })}
              </div>
            )}

            {error && (
              <p className="text-sm font-body text-red-600 mb-4">{error}</p>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setRescheduleModal(null)}
                disabled={saving}
                className="px-4 py-2 rounded-lg font-body border"
                style={{ borderColor: '#D1D5DB', color: '#4B5563' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                disabled={saving || !newDate || !newTime}
                className="px-4 py-2 rounded-lg font-body font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: '#B73D37' }}
              >
                {saving ? 'Guardando...' : 'Confirmar reagendar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyBookings
