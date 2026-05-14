import { classTypes, classSchedules } from './classes'

/** Mismo orden que en /horario (Schedule.jsx). */
export const DAY_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

/**
 * Expande `classTypes` + `classSchedules` en slots ordenados por día y hora.
 * Es la misma lógica que usa la página pública del horario.
 */
export function buildScheduleSlots() {
  const slots = []
  classTypes.forEach((cls) => {
    const s = classSchedules[cls.id]
    if (!s || !s.days) return
    const days = s.days
    days.forEach((day) => {
      const times = s.timesByDay && s.timesByDay[day] ? s.timesByDay[day] : s.times || []
      times.forEach((time) => {
        slots.push({
          classId: cls.id,
          className: cls.name,
          teacher: cls.teacher,
          day,
          time,
          durationMinutes: cls.duration || 60,
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

/** Slots agrupados por nombre de día (clave igual a `DAY_ORDER`). */
export function getSlotsByDay() {
  const byDay = {}
  DAY_ORDER.forEach((d) => {
    byDay[d] = []
  })
  buildScheduleSlots().forEach((slot) => {
    byDay[slot.day].push(slot)
  })
  DAY_ORDER.forEach((d) => {
    byDay[d].sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  })
  return byDay
}
