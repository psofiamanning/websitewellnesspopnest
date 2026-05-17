import { addDays, addWeeks, format, isSameDay, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { DAY_ORDER } from '../data/scheduleSlots'

export const SCHEDULE_FILTERS = [
  { id: 'all', label: 'Todas', practice: null },
  { id: 'yoga', label: 'Yoga', practice: 'yoga' },
  { id: 'pilates', label: 'Pilates', practice: 'pilates' },
  { id: 'meditation', label: 'Meditación', practice: 'meditation' },
  { id: 'sound', label: 'Sound healing', practice: 'sound' },
  { id: 'taichi', label: 'Tai chi', practice: 'taichi' },
]

const DAY_SHORT = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']

export function practiceForClassId(classId) {
  if (classId === 'pilates') return 'pilates'
  if (classId === 'meditacion') return 'meditation'
  if (classId === 'sound-healing') return 'sound'
  if (classId === 'tai-chi') return 'taichi'
  return 'yoga'
}

export function slotMatchesFilter(slot, filterId) {
  if (filterId === 'all') return true
  return practiceForClassId(slot.classId) === filterId
}

export function getWeekMonday(referenceDate) {
  return startOfWeek(referenceDate, { weekStartsOn: 1 })
}

export function formatWeekRangeLabel(weekMonday) {
  const sunday = addDays(weekMonday, 6)
  const d1 = format(weekMonday, 'd')
  const d2 = format(sunday, 'd')
  const month = format(weekMonday, 'LLLL', { locale: es })
  if (weekMonday.getMonth() !== sunday.getMonth()) {
    const monthEnd = format(sunday, 'LLLL', { locale: es })
    return `Semana del ${d1} de ${month} al ${d2} de ${monthEnd}`
  }
  return `Semana del ${d1} al ${d2} de ${month}`
}

export function buildWeekDays(weekMonday) {
  const today = new Date()
  return DAY_ORDER.map((dayName, idx) => {
    const date = addDays(weekMonday, idx)
    return {
      dayName,
      date,
      shortLabel: DAY_SHORT[idx],
      dayNum: format(date, 'd'),
      monthLabel: format(date, 'MMMM', { locale: es }).toUpperCase(),
      isToday: isSameDay(date, today),
    }
  })
}

export function filterSlotsByDay(slotsByDay, filterId) {
  const filtered = {}
  DAY_ORDER.forEach((d) => {
    filtered[d] = (slotsByDay[d] || []).filter((slot) => slotMatchesFilter(slot, filterId))
  })
  return filtered
}

export function shiftWeek(referenceDate, deltaWeeks) {
  return addWeeks(referenceDate, deltaWeeks)
}
