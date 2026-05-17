import { useState, useEffect } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import { es } from 'date-fns/locale'
import '../styles/calendarEditorial.css'

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function capitalizeMonthLabel(label) {
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function Calendar({ availableDates, selectedDate, onDateSelect, showLegend = true }) {
  const [currentMonth, setCurrentMonth] = useState(() =>
    selectedDate ? startOfMonth(selectedDate) : new Date()
  )

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(startOfMonth(selectedDate))
    }
  }, [selectedDate])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const daysInMonth = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  const today = new Date()

  const isDateAvailable = (date) =>
    availableDates.some((availableDate) => isSameDay(availableDate, date))

  const isDateSelected = (date) => selectedDate && isSameDay(selectedDate, date)

  const handleDateClick = (date) => {
    if (isDateAvailable(date)) {
      onDateSelect(date)
    }
  }

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const monthLabel = capitalizeMonthLabel(
    format(currentMonth, 'MMMM yyyy', { locale: es })
  )

  return (
    <div className="pn-calendar" role="application" aria-label="Calendario de reserva">
      <header className="pn-calendar__header">
        <h3 className="pn-calendar__month">{monthLabel}</h3>
        <div className="pn-calendar__nav">
          <button
            type="button"
            className="pn-calendar__nav-btn"
            onClick={goToPreviousMonth}
            aria-label="Mes anterior"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M9 2L4 7l5 5"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="pn-calendar__nav-btn"
            onClick={goToNextMonth}
            aria-label="Mes siguiente"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M5 2l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </header>

      <div className="pn-calendar__weekdays" aria-hidden>
        {WEEK_DAYS.map((day) => (
          <span key={day} className="pn-calendar__weekday">
            {day}
          </span>
        ))}
      </div>

      <div className="pn-calendar__grid" role="grid">
        {daysInMonth.map((day) => {
          const available = isDateAvailable(day)
          const selected = isDateSelected(day)
          const inMonth = isSameMonth(day, currentMonth)
          const isToday = isSameDay(day, today)

          const classNames = [
            'pn-calendar__day',
            !inMonth && 'pn-calendar__day--outside',
            inMonth && !available && 'pn-calendar__day--unavailable',
            available && 'pn-calendar__day--available',
            isToday && 'pn-calendar__day--today',
            selected && 'pn-calendar__day--selected',
          ]
            .filter(Boolean)
            .join(' ')

          const ariaLabel = [
            format(day, "d 'de' MMMM yyyy", { locale: es }),
            available ? 'con clases' : 'sin clases',
            isToday ? 'hoy' : null,
            selected ? 'seleccionado' : null,
          ]
            .filter(Boolean)
            .join(', ')

          return (
            <button
              key={day.toISOString()}
              type="button"
              className={classNames}
              onClick={() => handleDateClick(day)}
              disabled={!available}
              aria-label={ariaLabel}
              aria-pressed={selected || undefined}
            >
              <span className="pn-calendar__num">{format(day, 'd')}</span>
              {available ? (
                <span className="pn-calendar__mark pn-calendar__mark--dot" aria-hidden />
              ) : null}
              {isToday && !selected ? (
                <span className="pn-calendar__mark pn-calendar__mark--today-line" aria-hidden />
              ) : null}
            </button>
          )
        })}
      </div>

      {showLegend ? (
        <div className="pn-calendar__legend" aria-hidden>
          <span className="pn-calendar__legend-item">
            <span className="pn-calendar__legend-sample pn-calendar__legend-sample--available">
              12
            </span>
            Con clases
          </span>
          <span className="pn-calendar__legend-item">
            <span className="pn-calendar__legend-sample pn-calendar__legend-sample--today">
              10
            </span>
            Hoy
          </span>
          <span className="pn-calendar__legend-item">
            <span className="pn-calendar__legend-sample pn-calendar__legend-sample--selected">
              11
            </span>
            Seleccionado
          </span>
          <span className="pn-calendar__legend-item">
            <span className="pn-calendar__legend-sample pn-calendar__legend-sample--unavailable">
              06
            </span>
            Sin clases
          </span>
        </div>
      ) : null}
    </div>
  )
}

export default Calendar
