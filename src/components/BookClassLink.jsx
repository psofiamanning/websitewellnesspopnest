import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { classSchedules } from '../data/classes'
import { useFituneLive, FITUNE_URLS, FITUNE_LINK_PROPS, fituneScheduleUrl } from '../config/fitune'

const DAY_INDEX = { Domingo: 0, Lunes: 1, Martes: 2, Miércoles: 3, Jueves: 4, Viernes: 5, Sábado: 6 }

/** Próxima fecha con un horario aún por empezar de esta clase (hoy solo si queda alguno). */
function nextClassDate(classId, from = new Date()) {
  const sched = classSchedules[classId]
  if (!sched?.days?.length) return null
  const nowHHMM = `${String(from.getHours()).padStart(2, '0')}:${String(from.getMinutes()).padStart(2, '0')}`
  for (let i = 0; i < 8; i += 1) {
    const d = new Date(from)
    d.setDate(from.getDate() + i)
    const dayName = sched.days.find((name) => DAY_INDEX[name] === d.getDay())
    if (!dayName) continue
    const times = sched.timesByDay?.[dayName] ?? sched.times ?? []
    if (i > 0 || times.some((t) => t > nowHHMM)) return d
  }
  return null
}

/**
 * Botón "Reservar" de una clase: antes del corte va a la reserva de popnest.app;
 * después abre Fitune en el próximo día en que hay esa clase.
 */
function BookClassLink({ classId, to, className, children }) {
  const fituneLive = useFituneLive()
  if (!fituneLive) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    )
  }
  const handleClick = (e) => {
    const next = nextClassDate(classId)
    if (!next) return
    e.preventDefault()
    window.location.assign(fituneScheduleUrl(format(next, 'yyyy-MM-dd')))
  }
  return (
    <a href={FITUNE_URLS.schedule} className={className} onClick={handleClick} {...FITUNE_LINK_PROPS}>
      {children}
    </a>
  )
}

export default BookClassLink
