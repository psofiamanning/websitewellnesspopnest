// Espejo de server/config/salonPricing.js — solo para mostrar precio en vivo
// antes de pagar. El backend siempre recalcula y es la fuente autorizada del
// precio real; si cambia la tabla de precios, actualiza AMBOS archivos.

// days usa Date.getUTCDay(): 0=domingo, 1=lunes, ..., 6=sábado.
export const SALON_SLOTS = {
  valle: { label: 'Mañana', days: [1, 2, 3, 4, 5], startTime: '09:30', endTime: '16:00' },
  tarde: { label: 'Tarde', days: [1, 2, 3, 4, 5], startTime: '16:00', endTime: '19:00' },
  fin_semana_dia: { label: 'Fin de semana día', days: [0, 6], startTime: '11:30', endTime: '19:00' },
  noche: { label: 'Noche', days: [0, 1, 2, 3, 4, 5, 6], startTime: '19:00', endTime: '21:30' },
}

// "sobreHorarioClase" es solo informativo (no es una franja reservable en
// línea): el precio que se cobra cuando la solicitud especial se confirma
// manualmente, porque implica desplazar una clase real del horario.
//
// Regla de piso: el precio por hora nunca puede bajar de $75/persona,
// calculado con el máximo de personas del rango (peor caso). Donde el precio
// original del sheet quedaba por debajo de ese piso, se subió a
// 75 × maxPeople; donde ya lo superaba, se dejó igual.
export const SALON_PRICE_TIERS = [
  { minPeople: 1, maxPeople: 2, prices: { valle: 150, tarde: 200, fin_semana_dia: 250, noche: 450 }, sobreHorarioClase: 800 },
  { minPeople: 3, maxPeople: 4, prices: { valle: 300, tarde: 300, fin_semana_dia: 350, noche: 500 }, sobreHorarioClase: 900 },
  { minPeople: 5, maxPeople: 6, prices: { valle: 450, tarde: 450, fin_semana_dia: 450, noche: 600 }, sobreHorarioClase: 1000 },
  { minPeople: 7, maxPeople: 8, prices: { valle: 600, tarde: 600, fin_semana_dia: 600, noche: 700 }, sobreHorarioClase: 1100 },
  { minPeople: 9, maxPeople: 12, prices: { valle: 900, tarde: 900, fin_semana_dia: 900, noche: 900 }, sobreHorarioClase: 1200 },
  { minPeople: 13, maxPeople: 16, prices: { valle: 1200, tarde: 1200, fin_semana_dia: 1200, noche: 1200 }, sobreHorarioClase: 1300 },
  { minPeople: 17, maxPeople: 20, prices: { valle: 1500, tarde: 1500, fin_semana_dia: 1500, noche: 1500 }, sobreHorarioClase: 1500 },
]

export const SALON_EXTRAS = {
  proyector: { label: 'Proyector', amount: 300 },
  montaje: { label: 'Montaje y desmontaje de mesas y sillas', amount: 300 },
}

export const SALON_MAX_CAPACITY = 20
export const SALON_MIN_HOURS = 1

function timeToMinutes(time) {
  const [h, m] = String(time || '').split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null
  return h * 60 + m
}

function minutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60) % 24
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function addHoursToTime(startTime, hours) {
  const start = timeToMinutes(startTime)
  if (start === null) return null
  return minutesToTime(Math.round(start + Number(hours) * 60))
}

export function dayOfWeekFromDateStr(dateStr) {
  const [y, m, d] = String(dateStr || '').split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

export function getSlotForDayAndTime(dayOfWeek, startTime, endTime) {
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  if (start === null || end === null || end <= start) return null
  for (const [key, slot] of Object.entries(SALON_SLOTS)) {
    if (!slot.days.includes(dayOfWeek)) continue
    const slotStart = timeToMinutes(slot.startTime)
    const slotEnd = timeToMinutes(slot.endTime)
    if (start >= slotStart && end <= slotEnd) return key
  }
  return null
}

/** Franjas que aplican para un día de la semana dado (para poblar el <select>). */
export function getSlotsForDay(dayOfWeek) {
  return Object.entries(SALON_SLOTS)
    .filter(([, slot]) => slot.days.includes(dayOfWeek))
    .map(([key, slot]) => ({ key, ...slot }))
}

export function getHourlyRate(slotKey, numPeople) {
  const n = Number(numPeople)
  if (!Number.isFinite(n) || n < 1 || n > SALON_MAX_CAPACITY) return null
  const tier = SALON_PRICE_TIERS.find((t) => n >= t.minPeople && n <= t.maxPeople)
  if (!tier) return null
  return tier.prices[slotKey] ?? null
}

/** Calcula el precio estimado en el navegador (solo para mostrarlo antes de pagar). */
export function computeSalonPrice({ slotKey, numPeople, hours, extras = {} }) {
  const n = Number(numPeople)
  const h = Number(hours)
  if (!Number.isFinite(n) || n < 1 || n > SALON_MAX_CAPACITY) return null
  if (!Number.isFinite(h) || h < SALON_MIN_HOURS) return null
  const hourlyRate = getHourlyRate(slotKey, n)
  if (!hourlyRate) return null
  const baseAmount = Math.round(hourlyRate * h * 100) / 100
  let extrasAmount = 0
  if (extras?.proyector) extrasAmount += SALON_EXTRAS.proyector.amount
  if (extras?.montaje) extrasAmount += SALON_EXTRAS.montaje.amount
  const totalAmount = Math.round((baseAmount + extrasAmount) * 100) / 100
  return { hourlyRate, baseAmount, extrasAmount, totalAmount }
}
