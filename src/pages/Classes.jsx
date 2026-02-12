import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { classTypes, classSchedules } from '../data/classes'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isToday } from 'date-fns'
import { es } from 'date-fns/locale'

const DAY_NAMES_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const DAY_TO_NUMBER = { Domingo: 0, Lunes: 1, Martes: 2, Miércoles: 3, Jueves: 4, Viernes: 5, Sábado: 6 }

function Classes() {
  const navigate = useNavigate()
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  // Días de la semana que tienen al menos una clase (0 = Domingo, ..., 6 = Sábado)
  const daysWithClasses = {}
  Object.entries(classSchedules).forEach(([classId, schedule]) => {
    const classMeta = classTypes.find(c => c.id === classId)
    const name = classMeta?.name || classId
    ;(schedule.days || []).forEach(day => {
      const n = DAY_TO_NUMBER[day]
      if (n !== undefined) {
        if (!daysWithClasses[n]) daysWithClasses[n] = []
        if (!daysWithClasses[n].includes(name)) daysWithClasses[n].push(name)
      }
    })
  })

  const hasClassOnDay = (date) => {
    const dayNum = date.getDay()
    return daysWithClasses[dayNum]?.length > 0
  }

  const handleClassClick = (classId) => {
    navigate(`/booking/class/${classId}`)
  }

  const scrollToClass = (classId) => {
    const el = document.getElementById(`class-${classId}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Celdas del calendario (mes actual)
  const monthStart = startOfMonth(calendarMonth)
  const monthEnd = endOfMonth(calendarMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const weeks = []
  let d = calStart
  while (d <= calEnd) {
    const week = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(d))
      d = addDays(d, 1)
    }
    weeks.push(week)
  }

  return (
    <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      {/* Título y descripción */}
      <header className="relative z-10 pt-28 pb-8" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <h1 className="text-4xl md:text-5xl font-heading font-light mb-3"
              style={{ color: '#1F2937', letterSpacing: '-0.02em' }}>
            Clases de Yoga y Bienestar en Coyoacán
          </h1>
          <p className="text-base md:text-lg font-body leading-relaxed max-w-3xl" style={{ color: '#6B7280' }}>
            Descubre nuestras clases de yoga, tai chi, meditación y sound healing en Coyoacán. Encuentra la práctica perfecta para tu bienestar en nuestro estudio boutique.
          </p>
        </div>
      </header>

      {/* En móvil: lista de nombres de clases arriba para ir a cada sección */}
      <div className="lg:hidden sticky top-20 z-20 px-4 py-3 border-b bg-white/95 backdrop-blur"
           style={{ borderColor: '#E5D7D6', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <p className="text-xs font-body font-semibold mb-2 uppercase tracking-wide" style={{ color: '#6B7280' }}>
          Nuestras clases — toca para ver más
        </p>
        <div className="flex flex-wrap gap-2">
          {classTypes.map((classType) => (
            <button
              key={classType.id}
              type="button"
              onClick={() => scrollToClass(classType.id)}
              className="px-4 py-2.5 rounded-lg font-body font-medium text-sm transition-all"
              style={{
                backgroundColor: 'rgba(183, 61, 55, 0.12)',
                color: '#B73D37',
                border: '1px solid rgba(183, 61, 55, 0.3)'
              }}
            >
              {classType.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas de clases — cada una es una sección con id para scroll en móvil */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {classTypes.map((classType) => (
            <section
              key={classType.id}
              id={`class-${classType.id}`}
              className="scroll-mt-32 lg:scroll-mt-0"
            >
              <div
                onClick={() => handleClassClick(classType.id)}
                className="bg-white rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg flex flex-col"
                style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="h-48 overflow-hidden relative bg-gray-100">
                  <img
                    src={classType.image}
                    alt={classType.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    style={{
                      objectPosition: classType.id === 'sound-healing' ? 'center top' : 'center center',
                      minHeight: '100%'
                    }}
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-heading font-medium mb-2" style={{ color: '#1F2937' }}>
                    {classType.name}
                  </h3>
                  <div className="space-y-1 mb-3">
                    <p className="text-sm font-body" style={{ color: '#6B7280' }}>
                      <span className="font-medium" style={{ color: '#1F2937' }}>Profesor:</span> {classType.teacher}
                    </p>
                    <p className="text-sm font-body" style={{ color: '#6B7280' }}>
                      <span className="font-medium" style={{ color: '#1F2937' }}>Duración:</span> {classType.duration} min
                    </p>
                    <p className="text-sm font-body" style={{ color: '#6B7280' }}>
                      <span className="font-medium" style={{ color: '#B73D37' }}>Precio:</span> $30.00 MXN
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleClassClick(classType.id) }}
                    className="w-full py-2.5 rounded-md transition-all duration-200 font-body font-medium text-sm mb-3"
                    style={{ backgroundColor: '#B73D37', color: '#FFFFFF', border: 'none' }}
                    onMouseEnter={(e) => { e.target.style.backgroundColor = '#C76661' }}
                    onMouseLeave={(e) => { e.target.style.backgroundColor = '#B73D37' }}
                  >
                    Reservar Clase
                  </button>
                  <p className="text-xs font-body leading-relaxed flex-1" style={{ color: '#6B7280', lineHeight: '1.5' }}>
                    {classType.description}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Horarios y calendario: dos columnas en desktop para usar todo el ancho */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Columna 1: ¿Qué días hay clase? */}
          <div className="bg-white p-5 rounded-xl border-2" style={{ borderColor: '#E5D7D6', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p className="text-sm font-body font-semibold mb-3" style={{ color: '#1F2937' }}>
              ¿Qué días hay clase?
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 1, short: 'Lun' }, { key: 2, short: 'Mar' }, { key: 3, short: 'Mié' },
                { key: 4, short: 'Jue' }, { key: 5, short: 'Vie' }, { key: 6, short: 'Sáb' }, { key: 0, short: 'Dom' }
              ].map(({ key, short }) => {
                const classes = daysWithClasses[key] || []
                const hasAny = classes.length > 0
                return (
                  <div
                    key={key}
                    className={`rounded-lg border-2 px-3 py-2 min-w-[100px] ${hasAny ? '' : 'opacity-70'}`}
                    style={{
                      backgroundColor: hasAny ? 'rgba(183, 61, 55, 0.08)' : '#F9FAFB',
                      borderColor: hasAny ? '#B73D37' : '#E5E7EB'
                    }}
                  >
                    <div className="font-heading font-semibold text-sm" style={{ color: hasAny ? '#B73D37' : '#6B7280' }}>{short}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {hasAny ? classes.map(cl => (
                        <span key={cl} className="text-xs font-body px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#B73D37' }}>{cl}</span>
                      )) : <span className="text-xs font-body" style={{ color: '#9CA3AF' }}>—</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Columna 2: Calendario */}
          <div className="bg-white p-5 rounded-xl border-2" style={{ borderColor: '#E5D7D6', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-heading font-medium" style={{ color: '#1F2937' }}>
                {format(calendarMonth, 'MMMM yyyy', { locale: es })}
              </span>
              <div className="flex gap-1">
                <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-body hover:bg-gray-100" style={{ color: '#6B7280', fontSize: '1.1rem' }}>‹</button>
                <button type="button" onClick={() => setCalendarMonth(new Date())}
                  className="text-xs font-body px-3 py-1.5 rounded-lg font-medium hover:bg-gray-100" style={{ color: '#B73D37' }}>Hoy</button>
                <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-body hover:bg-gray-100" style={{ color: '#6B7280', fontSize: '1.1rem' }}>›</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                <div key={day} className="py-1.5 text-xs font-body font-semibold uppercase tracking-wide" style={{ color: '#6B7280' }}>{day}</div>
              ))}
              {weeks.map((week, wi) =>
                week.map((date, di) => {
                  const hasClass = hasClassOnDay(date)
                  const sameMonth = isSameMonth(date, calendarMonth)
                  const today = isToday(date)
                  return (
                    <div key={`${wi}-${di}`} className={`flex flex-col items-center justify-center rounded-lg min-h-[40px] ${!sameMonth ? 'opacity-35' : ''}`}
                         title={hasClass ? daysWithClasses[date.getDay()].join(', ') : ''}>
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-body font-medium ${today ? 'ring-2 ring-offset-2' : ''}`}
                            style={{ backgroundColor: hasClass ? '#B73D37' : 'transparent', color: hasClass ? '#FFFFFF' : (today ? '#B73D37' : (sameMonth ? '#1F2937' : '#9CA3AF')), ringColor: today ? '#B73D37' : undefined }}>
                        {format(date, 'd')}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
            <p className="text-xs font-body mt-2 text-center" style={{ color: '#9CA3AF' }}>Días en rojo = hay clase</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Classes
