import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { getSlotsByDay } from '../data/scheduleSlots'
import PracticeDot from '../components/ui/PracticeDot'
import {
  SCHEDULE_FILTERS,
  buildWeekDays,
  filterSlotsByDay,
  formatWeekRangeLabel,
  getWeekMonday,
  practiceForClassId,
  shiftWeek,
} from '../utils/schedulePageUtils'
import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/components.css'
import '../styles/scheduleShell.css'

function Schedule() {
  const navigate = useNavigate()
  const [filterId, setFilterId] = useState('all')
  const [weekOffset, setWeekOffset] = useState(0)
  // Día seleccionado en la vista móvil (pestañas). 0=Lun … 6=Dom; por defecto hoy.
  const [selectedDayIdx, setSelectedDayIdx] = useState(() => (new Date().getDay() + 6) % 7)

  const weekMonday = useMemo(() => {
    const base = getWeekMonday(new Date())
    return shiftWeek(base, weekOffset)
  }, [weekOffset])

  const slotsByDay = useMemo(() => getSlotsByDay(), [])
  const filteredByDay = useMemo(() => filterSlotsByDay(slotsByDay, filterId), [slotsByDay, filterId])
  const weekDays = useMemo(() => buildWeekDays(weekMonday), [weekMonday])
  const weekRangeLabel = useMemo(() => formatWeekRangeLabel(weekMonday), [weekMonday])

  // Lleva el día y la hora tocados a la reserva para llegar al paso de
  // confirmar sin volver a elegir fecha ni horario.
  const handleSlotClick = (classId, date, time) => {
    const params = new URLSearchParams()
    if (date) params.set('date', format(date, 'yyyy-MM-dd'))
    if (time) params.set('time', time)
    const qs = params.toString()
    navigate(`/booking/class/${classId}${qs ? `?${qs}` : ''}`)
  }

  const renderSlot = (slot, date, idx) => {
    const practice = practiceForClassId(slot.classId)
    return (
      <button
        key={`${slot.classId}-${slot.time}-${idx}`}
        type="button"
        className="sc-class"
        onClick={() => handleSlotClick(slot.classId, date, slot.time)}
      >
        <div className="sc-class__top">
          <span className="sc-class__time">{slot.time}</span>
          <span className="sc-class__duration">{slot.durationMinutes} min</span>
        </div>
        <div className="sc-class__name">
          <PracticeDot practice={practice} size={7} />
          {slot.className}
        </div>
        <p className="sc-class__teacher">Con {slot.teacher}</p>
      </button>
    )
  }

  return (
    <div className="sc-page sc-page--with-site-nav">
      <div className="sc-shell">
        <header className="sc-hero">
          <div className="sc-hero__main">
            <p className="sc-hero__eyebrow">
              <span className="sc-hero__eyebrow-line" aria-hidden />
              02 · PROGRAMA
            </p>
            <h1 className="sc-hero__title">
              Esta <em className="pn-serif">semana.</em>
            </h1>
          </div>
          <div className="sc-hero__aside">
            <p className="sc-hero__copy">
              Todas las clases duran 60 minutos y se imparten en grupos pequeños, con atención cercana.
            </p>
            <p className="sc-hero__copy">
              Haz clic en una clase para ver detalles y reservar tu lugar en línea.
            </p>
          </div>
        </header>


        <section className="sc-toolbar" aria-label="Filtros y semana">
          <div className="sc-toolbar__filters">
            <span className="sc-toolbar__label">
              <span className="sc-toolbar__label-line" aria-hidden />
              Filtrar
            </span>
            <div className="sc-filter-pills">
              {SCHEDULE_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`sc-filter-pill${filterId === f.id ? ' sc-filter-pill--active' : ''}`}
                  onClick={() => setFilterId(f.id)}
                  aria-pressed={filterId === f.id}
                >
                  {f.practice ? <PracticeDot practice={f.practice} size={7} /> : null}
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="sc-toolbar__week">
            <button
              type="button"
              className="sc-week-btn"
              onClick={() => setWeekOffset((w) => w - 1)}
              aria-label="Semana anterior"
            >
              ←
            </button>
            <span className="sc-toolbar__week-range">{weekRangeLabel}</span>
            <button
              type="button"
              className="sc-week-btn"
              onClick={() => setWeekOffset((w) => w + 1)}
              aria-label="Semana siguiente"
            >
              →
            </button>
          </div>
        </section>

        <section className="sc-board-scroll" aria-label="Horario semanal">
          <div className="sc-board-wrap">
            <div className="sc-board">
            {weekDays.map(({ dayName, date, shortLabel, dayNum, monthLabel, isToday }) => {
              const slots = filteredByDay[dayName] || []
              return (
                <article
                  key={dayName}
                  className={`sc-day-col${isToday ? ' sc-day-col--today' : ''}`}
                >
                  <header className="sc-day-col__head">
                    {isToday ? (
                      <p className="sc-day-col__today">• Hoy · {shortLabel}</p>
                    ) : null}
                    <p className="sc-day-col__dow">{shortLabel}</p>
                    <p className="sc-day-col__num">{dayNum}</p>
                    <p className="sc-day-col__month">{monthLabel}</p>
                    <span className="sc-day-col__rule" aria-hidden />
                  </header>
                  <div className="sc-day-col__body">
                    {slots.length === 0 ? (
                      <p className="sc-day-col__empty">Sin clases</p>
                    ) : (
                      slots.map((slot, idx) => renderSlot(slot, date, idx))
                    )}
                  </div>
                </article>
              )
            })}
            </div>
          </div>
        </section>

        {/* Vista móvil: pestañas de día (arriba) + clases del día seleccionado. */}
        <section className="sc-mobile-days" aria-label="Horario por día">
          <div className="sc-daytabs" role="tablist">
            {weekDays.map((d, i) => (
              <button
                key={d.dayName}
                type="button"
                role="tab"
                aria-selected={i === selectedDayIdx}
                className={`sc-daytab${i === selectedDayIdx ? ' sc-daytab--active' : ''}${
                  d.isToday ? ' sc-daytab--today' : ''
                }`}
                onClick={() => setSelectedDayIdx(i)}
              >
                <span className="sc-daytab__dow">{d.isToday ? 'Hoy' : d.shortLabel}</span>
                <span className="sc-daytab__num">{d.dayNum}</span>
              </button>
            ))}
          </div>
          {(() => {
            const d = weekDays[selectedDayIdx] || weekDays[0]
            const slots = filteredByDay[d.dayName] || []
            return (
              <div className="sc-mobile-day">
                <p className="sc-mobile-day__title">
                  {d.shortLabel} {d.dayNum} · {d.monthLabel}
                </p>
                {slots.length === 0 ? (
                  <p className="sc-day-col__empty">Sin clases este día.</p>
                ) : (
                  slots.map((slot, idx) => renderSlot(slot, d.date, idx))
                )}
              </div>
            )
          })()}
        </section>

        <section className="sc-policies" aria-labelledby="sc-policies-heading">
          <p id="sc-policies-heading" className="sc-policies__title">
            Reservas
          </p>
          <div className="sc-policies__grid">
            <div className="sc-policy">
              <p className="sc-policy__label">
                <span className="sc-policy__line" aria-hidden />
                Anticipación
              </p>
              <p className="sc-policy__text">
                Reserva con al menos 24 horas de anticipación para asegurar tu lugar.
              </p>
            </div>
            <div className="sc-policy">
              <p className="sc-policy__label">
                <span className="sc-policy__line" aria-hidden />
                Cupo limitado
              </p>
              <p className="sc-policy__text">
                Máximo 8 personas por sesión para mantener grupos contenidos y atención cercana.
              </p>
            </div>
            <div className="sc-policy">
              <p className="sc-policy__label">
                <span className="sc-policy__line" aria-hidden />
                Cancelación
              </p>
              <p className="sc-policy__text">
                Cancela o cambia tu reserva con al menos 4 horas de anticipación desde Mis reservas.
              </p>
            </div>
            <Link to="/packages" className="sc-policies__cta">
              Ver planes →
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Schedule
