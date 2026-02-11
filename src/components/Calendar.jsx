import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'

function Calendar({ availableDates, selectedDate, onDateSelect }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const daysInMonth = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  })

  const isDateAvailable = (date) => {
    return availableDates.some(availableDate => isSameDay(availableDate, date))
  }

  const isDateSelected = (date) => {
    return selectedDate && isSameDay(selectedDate, date)
  }

  const handleDateClick = (date) => {
    if (isDateAvailable(date)) {
      onDateSelect(date)
    }
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  return (
    <div className="bg-white rounded-lg p-4 md:p-6 w-full min-w-0 border-2"
         style={{ 
           borderColor: '#E5B3B0',
           boxShadow: '0 4px 16px rgba(183, 61, 55, 0.1)'
         }}>
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-1.5 md:p-2 rounded-lg transition-all duration-300 hover:scale-110"
          style={{ 
            color: '#B73D37',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#E5B3B0'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-h5 md:text-h3 font-heading text-body">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-1.5 md:p-2 rounded-lg transition-all duration-300 hover:scale-110"
          style={{ 
            color: '#B73D37',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#E5B3B0'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs md:text-sm font-medium py-1 md:py-2 font-heading"
               style={{ color: '#6B7280' }}>
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {daysInMonth.map((day, idx) => {
          const available = isDateAvailable(day)
          const selected = isDateSelected(day)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isToday = isSameDay(day, new Date())

          return (
            <button
              key={idx}
              onClick={() => handleDateClick(day)}
              disabled={!available}
              className={`
                aspect-square p-1 md:p-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 font-body relative
                ${!isCurrentMonth ? 'opacity-30' : ''}
                ${isToday && !selected && available ? 'ring-2 ring-offset-1' : ''}
                ${selected 
                  ? 'bg-primary text-white shadow-lg scale-105 font-semibold border-2' 
                  : available
                    ? 'text-primary border-2 hover:scale-105 cursor-pointer font-semibold'
                    : 'bg-neutral text-grey-placeholder cursor-not-allowed opacity-50 border-2 border-transparent line-through'
                }
              `}
              style={selected 
                ? { 
                    backgroundColor: '#B73D37',
                    borderColor: '#B73D37',
                    boxShadow: '0 4px 12px rgba(183, 61, 55, 0.3)'
                  }
                : available
                  ? {
                      backgroundColor: '#E5B3B0',
                      borderColor: '#D48D88',
                      boxShadow: '0 2px 4px rgba(183, 61, 55, 0.1)'
                    }
                  : {}
              }
              onMouseEnter={(e) => {
                if (available && !selected) {
                  e.target.style.backgroundColor = '#D48D88'
                  e.target.style.borderColor = '#C76661'
                  e.target.style.boxShadow = '0 4px 8px rgba(183, 61, 55, 0.15)'
                }
              }}
              onMouseLeave={(e) => {
                if (available && !selected) {
                  e.target.style.backgroundColor = '#E5B3B0'
                  e.target.style.borderColor = '#D48D88'
                  e.target.style.boxShadow = '0 2px 4px rgba(183, 61, 55, 0.1)'
                }
              }}
            >
              {format(day, 'd')}
              {available && !selected && (
                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></span>
              )}
            </button>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-4 md:mt-6 flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs md:text-sm font-body">
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-4 h-4 md:w-5 md:h-5 rounded flex items-center justify-center relative border-2"
               style={{ 
                 backgroundColor: '#E5B3B0',
                 borderColor: '#D48D88'
               }}>
            <span className="absolute bottom-0.5 w-1 h-1 rounded-full" style={{ backgroundColor: '#B73D37' }}></span>
          </div>
          <span className="text-body font-medium">Disponible</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-4 h-4 md:w-5 md:h-5 rounded border-2"
               style={{ 
                 backgroundColor: '#B73D37',
                 borderColor: '#B73D37'
               }}></div>
          <span className="text-body font-medium">Seleccionado</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-4 h-4 md:w-5 md:h-5 rounded border-2 border-transparent opacity-50 relative"
               style={{ backgroundColor: '#DED5D5' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-0.5" style={{ backgroundColor: '#B5AEAE' }}></div>
            </div>
          </div>
          <span className="text-body font-medium opacity-70">No disponible</span>
        </div>
      </div>
    </div>
  )
}

export default Calendar
