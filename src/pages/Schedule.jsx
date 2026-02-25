import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { classTypes, classSchedules } from '../data/classes'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'

const DAY_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function buildScheduleSlots() {
  const slots = []
  classTypes.forEach((cls) => {
    const s = classSchedules[cls.id]
    if (!s || !s.days) return
    const days = s.days
    days.forEach((day) => {
      const times = s.timesByDay && s.timesByDay[day] ? s.timesByDay[day] : (s.times || [])
      times.forEach((time) => {
        slots.push({
          classId: cls.id,
          className: cls.name,
          teacher: cls.teacher,
          day,
          time
        })
      })
    })
  })
  slots.sort((a, b) => {
    const dayA = DAY_ORDER.indexOf(a.day)
    const dayB = DAY_ORDER.indexOf(b.day)
    if (dayA !== dayB) return dayA - dayB
    return (a.time || '').localeCompare(b.time || '')
  })
  return slots
}

function Schedule() {
  const navigate = useNavigate()
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  const allSlots = useMemo(() => buildScheduleSlots(), [])

  const slotsByDay = useMemo(() => {
    const byDay = {}
    DAY_ORDER.forEach((d) => (byDay[d] = []))
    allSlots.forEach((slot) => {
      if (!byDay[slot.day]) byDay[slot.day] = []
      byDay[slot.day].push(slot)
    })
    return byDay
  }, [allSlots])

  const selectedDayName = selectedDate
    ? format(selectedDate, 'EEEE', { locale: es })
    : null
  const selectedDayNameCapitalized = selectedDayName
    ? selectedDayName.charAt(0).toUpperCase() + selectedDayName.slice(1)
    : null
  const slotsForSelectedDay = selectedDayNameCapitalized ? (slotsByDay[selectedDayNameCapitalized] || []) : []

  const monthStart = startOfMonth(calendarMonth)
  const monthEnd = endOfMonth(calendarMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const daysInMonth = eachDayOfInterval({ start: calStart, end: calEnd })

  const weekDaysShort = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  const handleSlotClick = (classId) => {
    navigate(`/booking/class/${classId}`)
  }

  return (
    <div className="min-h-screen pt-28 pb-16" style={{ backgroundColor: '#f5f0ef' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-heading font-bold text-center mb-2" style={{ color: '#1F2937' }}>
          Horario
        </h1>
        <p className="text-body font-body text-center mb-10" style={{ color: '#6B7280' }}>
          Revisa los horarios por día o elige una fecha en el calendario para ver las clases y reservar
        </p>

        {/* Vista rápida por día de la semana */}
        <section className="mb-14">
          <h2 className="text-xl font-heading font-semibold mb-6" style={{ color: '#B73D37' }}>
            Vista por día de la semana
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {DAY_ORDER.map((day) => {
              const slots = slotsByDay[day] || []
              if (slots.length === 0) return null
              return (
                <div
                  key={day}
                  className="bg-white rounded-xl border-2 p-4 shadow-sm"
                  style={{ borderColor: '#E5B3B0' }}
                >
                  <h3 className="font-heading font-semibold mb-3" style={{ color: '#1F2937' }}>
                    {day}
                  </h3>
                  <ul className="space-y-2">
                    {slots.map((slot, idx) => (
                      <li key={`${slot.classId}-${slot.time}-${idx}`}>
                        <button
                          type="button"
                          onClick={() => handleSlotClick(slot.classId)}
                          className="w-full text-left px-3 py-2 rounded-lg font-body text-sm transition-all hover:scale-[1.02]"
                          style={{
                            backgroundColor: '#fefcfb',
                            border: '1px solid #E5B3B0',
                            color: '#1F2937'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#E5B3B0'
                            e.target.style.color = '#fff'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#fefcfb'
                            e.target.style.color = '#1F2937'
                          }}
                        >
                          <span className="font-semibold" style={{ color: 'inherit' }}>
                            {slot.time}
                          </span>
                          <span className="block truncate mt-0.5" style={{ color: 'inherit', opacity: 0.95 }}>
                            {slot.className}
                          </span>
                          <span className="block text-xs mt-0.5 opacity-80">Con {slot.teacher}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>

        {/* Calendario + Clases del día seleccionado */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-xl font-heading font-semibold mb-4" style={{ color: '#B73D37' }}>
              Calendario
            </h2>
            <div
              className="bg-white rounded-xl border-2 p-4 shadow-sm"
              style={{ borderColor: '#E5B3B0' }}
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ color: '#B73D37' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="font-heading font-semibold capitalize" style={{ color: '#1F2937' }}>
                  {format(calendarMonth, 'MMMM yyyy', { locale: es })}
                </span>
                <button
                  type="button"
                  onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ color: '#B73D37' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-body mb-2" style={{ color: '#6B7280' }}>
                {weekDaysShort.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((date) => {
                  const isCurrentMonth = isSameMonth(date, calendarMonth)
                  const isSelected = selectedDate && isSameDay(date, selectedDate)
                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className="aspect-square flex items-center justify-center rounded-lg text-sm font-body transition-all"
                      style={{
                        backgroundColor: isSelected ? '#B73D37' : isCurrentMonth ? '#fefcfb' : '#f3f4f6',
                        color: isSelected ? '#fff' : isCurrentMonth ? '#1F2937' : '#9ca3af',
                        border: isSelected ? '2px solid #B73D37' : `1px solid ${isCurrentMonth ? '#E5B3B0' : 'transparent'}`
                      }}
                    >
                      {format(date, 'd')}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-heading font-semibold mb-4" style={{ color: '#B73D37' }}>
              {selectedDate
                ? `Clases del ${selectedDayNameCapitalized} ${format(selectedDate, "d 'de' MMMM", { locale: es })}`
                : 'Elige un día en el calendario'}
            </h2>
            {selectedDate && (
              <div className="space-y-3">
                {slotsForSelectedDay.length === 0 ? (
                  <p className="font-body text-body" style={{ color: '#6B7280' }}>
                    No hay clases programadas este día.
                  </p>
                ) : (
                  slotsForSelectedDay.map((slot, idx) => (
                    <button
                      key={`${slot.classId}-${slot.time}-${idx}`}
                      type="button"
                      onClick={() => handleSlotClick(slot.classId)}
                      className="w-full bg-white rounded-xl border-2 p-4 text-left shadow-sm transition-all hover:scale-[1.01] flex flex-wrap items-center gap-3"
                      style={{ borderColor: '#E5B3B0' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#B73D37'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(183, 61, 55, 0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#E5B3B0'
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                    >
                      <span
                        className="font-heading font-bold text-lg shrink-0"
                        style={{ color: '#B73D37', minWidth: '4rem' }}
                      >
                        {slot.time}
                      </span>
                      <div className="min-w-0">
                        <span className="font-heading font-semibold block" style={{ color: '#1F2937' }}>
                          {slot.className}
                        </span>
                        <span className="text-sm font-body" style={{ color: '#6B7280' }}>
                          {slot.teacher}
                        </span>
                      </div>
                      <span className="ml-auto text-sm font-body shrink-0" style={{ color: '#B73D37' }}>
                        Reservar →
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Schedule
