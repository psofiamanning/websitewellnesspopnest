import { addDays, addMinutes, format, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { DAY_ORDER, getSlotsByDay } from '../data/scheduleSlots'

const WEEK_D_SHORT = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']

export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
}

export function dotClassForClassId(classId) {
  if (classId === 'pilates') return 'pilates'
  if (classId === 'meditacion') return 'meditation'
  if (classId === 'sound-healing') return 'sound'
  if (classId === 'tai-chi') return 'taichi'
  return 'yoga'
}

export function buildScheduleRedesignWeekRangeHtml(referenceDate) {
  const monday = startOfWeek(referenceDate, { weekStartsOn: 1 })
  const sunday = addDays(monday, 6)
  const d1 = format(monday, 'd')
  const d2 = format(sunday, 'd')
  const monthName = format(monday, 'LLLL', { locale: es })
  if (monday.getMonth() !== sunday.getMonth()) {
    const monthEnd = format(sunday, 'LLLL', { locale: es })
    return `${escapeHtml(d1)} de ${escapeHtml(monthName)} al ${escapeHtml(d2)} de ${escapeHtml(monthEnd)}`
  }
  return `${escapeHtml(d1)} al ${escapeHtml(d2)} <span class="pn-serif">de ${escapeHtml(monthName)}</span>`
}

function timeRangeLabel(timeStr, durationMinutes) {
  const [h, m] = timeStr.split(':').map(Number)
  const base = new Date(2020, 0, 1, h, m || 0, 0, 0)
  const end = addMinutes(base, durationMinutes || 60)
  return `${timeStr} - ${format(end, 'HH:mm')}`
}

/** Bloque "Hoy en el studio" del home rediseño (misma data que /horario). */
export function buildHomeTodayAsideHtml(referenceDate, slotsByDay) {
  const weekdayEs = format(referenceDate, 'EEEE', { locale: es })
  const todayKey = weekdayEs.charAt(0).toUpperCase() + weekdayEs.slice(1)
  const slots = (slotsByDay[todayKey] || []).slice(0, 3)
  if (slots.length === 0) {
    return `
            <div class="pn-eyebrow" style="margin-bottom: 10px;">Hoy en el studio</div>
            <p class="pn-text-sm" style="color: var(--pn-color-text-muted);">Hoy no hay clases en el horario regular. Consulta el horario completo.</p>`
  }
  return (
    `
            <div class="pn-eyebrow" style="margin-bottom: 10px;">Hoy en el studio</div>` +
    slots
      .map((slot) => {
        const dot = dotClassForClassId(slot.classId)
        const range = timeRangeLabel(slot.time, slot.durationMinutes)
        return `
            <div class="home-today__row">
              <div>
                <p class="home-today__time">${escapeHtml(range)}</p>
                <p class="pn-text-sm"><span class="pn-dot pn-dot--${dot}"></span> ${escapeHtml(slot.className)} con ${escapeHtml(slot.teacher)}</p>
              </div>
              <span class="pn-text-xs">Reserva en línea</span>
            </div>`
      })
      .join('')
  )
}

/** Cuatro columnas Lun–Jue de la semana calendario que contiene referenceDate. */
export function buildHomeWeekStripHtml(referenceDate, slotsByDay) {
  const monday = startOfWeek(referenceDate, { weekStartsOn: 1 })
  const short = ['Lun', 'Mar', 'Mie', 'Jue']
  return [0, 1, 2, 3]
    .map((offset) => {
      const d = addDays(monday, offset)
      const dayNum = format(d, 'd')
      const fullDayName = DAY_ORDER[offset]
      const slots = (slotsByDay[fullDayName] || []).slice(0, 2)
      const classesHtml =
        slots.length === 0
          ? `<div class="home-class-mini"><p class="pn-text-sm" style="color:var(--pn-color-text-muted);">Sin clases este día.</p></div>`
          : slots
              .map((slot) => {
                const dot = dotClassForClassId(slot.classId)
                return `<div class="home-class-mini"><div class="home-class-mini__name"><span class="pn-dot pn-dot--${dot}"></span>${escapeHtml(slot.className)}</div><div class="home-class-mini__meta">${escapeHtml(slot.time)} - ${escapeHtml(slot.teacher)}</div></div>`
              })
              .join('')
      return `
            <div class="home-day">
              <div class="home-day__date"><span class="home-day__number">${dayNum}</span><span class="home-day__name">${short[offset]}</span></div>
              ${classesHtml}
            </div>`
    })
    .join('')
}

function buildScheduleClassRow(slot) {
  const dot = dotClassForClassId(slot.classId)
  return `<div class="schedule-class"><span class="schedule-class__time">${escapeHtml(slot.time)}</span><div class="schedule-class__name"><span class="pn-dot pn-dot--${dot}"></span>${escapeHtml(slot.className)}</div><div class="schedule-class__coach">con ${escapeHtml(slot.teacher)}</div><div class="schedule-class__bottom"><span class="schedule-class__duration">${slot.durationMinutes} min</span><span class="schedule-class__spots">Reserva en la web</span></div></div>`
}

export function buildScheduleRedesignMobileDaysHtml(referenceDate) {
  const monday = startOfWeek(referenceDate, { weekStartsOn: 1 })
  return WEEK_D_SHORT.map((lab, i) => {
    const d = addDays(monday, i)
    const num = format(d, 'd')
    const active = i === 0 ? ' schedule-mobile-day--active' : ''
    return `<button type="button" class="schedule-mobile-day${active}"><span>${lab}</span><strong>${num}</strong></button>`
  }).join('')
}

export function buildScheduleRedesignBoardHtml(referenceDate, slotsByDay) {
  const monday = startOfWeek(referenceDate, { weekStartsOn: 1 })
  return DAY_ORDER.map((dayName, idx) => {
    const d = addDays(monday, idx)
    const dayNum = format(d, 'd')
    const slots = slotsByDay[dayName] || []
    const active = idx === 0 ? ' schedule-day--active' : ''
    const body =
      slots.length === 0
        ? `<p class="pn-text-sm" style="padding:20px 16px;color:var(--pn-color-text-muted);">Sin clases este día.</p>`
        : slots.map((s) => buildScheduleClassRow(s)).join('')
    return `<article class="schedule-day${active}"><header class="schedule-day__head"><div class="schedule-day__name">${escapeHtml(dayName)}</div><div class="schedule-day__num">${dayNum}</div></header>${body}</article>`
  }).join('')
}

export function buildScheduleRedesignMobileListHtml(referenceDate, slotsByDay) {
  const monday = startOfWeek(referenceDate, { weekStartsOn: 1 })
  const dayName = DAY_ORDER[0]
  const slots = slotsByDay[dayName] || []
  const dayNum = format(monday, 'd')
  const count = slots.length
  const rows =
    count === 0
      ? `<p class="pn-text-sm" style="padding:12px 0;">Sin clases este día.</p>`
      : slots
          .map((slot) => {
            const dot = dotClassForClassId(slot.classId)
            return `<div class="schedule-mobile-class"><div><span class="schedule-mobile-class__time">${escapeHtml(slot.time)}</span><span class="schedule-mobile-class__duration">${slot.durationMinutes} min</span></div><div><div class="schedule-mobile-class__name"><span class="pn-dot pn-dot--${dot}"></span>${escapeHtml(slot.className)}</div><div class="schedule-mobile-class__coach">con ${escapeHtml(slot.teacher)}</div><div class="schedule-mobile-class__spots">Reserva en la web</div></div><button type="button" class="schedule-mobile-class__arrow" aria-label="Detalle">→</button></div>`
          })
          .join('')
  return `
            <div class="schedule-mobile-list__head">
              <h2 class="pn-h3"><span class="pn-serif">${escapeHtml(dayName)}</span> ${dayNum}</h2>
              <span class="pn-text-xs">${count} clase${count === 1 ? '' : 's'}</span>
            </div>
            ${rows}`
}

/** Snippets listos para interpolar en los HTML de preview (iframe). */
export function buildRedesignScheduleSnippets(referenceDate = new Date()) {
  const slotsByDay = getSlotsByDay()
  return {
    homeTodayAside: buildHomeTodayAsideHtml(referenceDate, slotsByDay),
    homeWeekStrip: buildHomeWeekStripHtml(referenceDate, slotsByDay),
    scheduleWeekRange: buildScheduleRedesignWeekRangeHtml(referenceDate),
    scheduleMobileDays: buildScheduleRedesignMobileDaysHtml(referenceDate),
    scheduleBoard: buildScheduleRedesignBoardHtml(referenceDate, slotsByDay),
    scheduleMobileList: buildScheduleRedesignMobileListHtml(referenceDate, slotsByDay),
  }
}
