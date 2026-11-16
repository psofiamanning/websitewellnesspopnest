/**
 * JSON-LD `Event` para talleres (resultados enriquecidos de eventos en Google).
 * Los talleres vienen de la API en cliente; Google ejecuta JS al indexar, así que el
 * <script type="application/ld+json"> que se agrega tras el fetch sí se lee.
 */
import { SITE_URL } from './seo.js'

export const STUDIO_PLACE = {
  '@type': 'Place',
  name: 'Estudio Popnest Wellness',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Londres 105, Del Carmen',
    addressLocality: 'Coyoacán',
    postalCode: '04100',
    addressRegion: 'CDMX',
    addressCountry: 'MX',
  },
}

/** CDMX no tiene horario de verano desde 2022: siempre UTC−06:00. */
const MX_OFFSET = '-06:00'

/** "10:00", "7 pm", "7:30 p.m.", "19:30 h" → "HH:MM" (24 h) o null si no se entiende. */
export function parseHora(hora) {
  if (!hora) return null
  const m = String(hora).trim().toLowerCase().match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(a\.?\s*m\.?|p\.?\s*m\.?)?/)
  if (!m) return null
  let h = Number(m[1])
  const min = m[2] ? Number(m[2]) : 0
  const meridiem = m[3]?.replace(/[\s.]/g, '')
  if (meridiem === 'pm' && h < 12) h += 12
  if (meridiem === 'am' && h === 12) h = 0
  if (h > 23 || min > 59) return null
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

/** Fecha ISO del taller: con hora y zona si `hora` es legible; si no, solo la fecha. */
function startDateFor(taller) {
  if (!taller.fecha) return null
  const fecha = String(taller.fecha).slice(0, 10)
  const hhmm = parseHora(taller.hora)
  return hhmm ? `${fecha}T${hhmm}:00${MX_OFFSET}` : fecha
}

function isUpcoming(taller) {
  if (!taller.fecha) return false
  const today = new Date().toISOString().slice(0, 10)
  return String(taller.fecha).slice(0, 10) >= today
}

export function buildTallerEvent(taller) {
  const startDate = startDateFor(taller)
  if (!startDate || !taller.title) return null
  const url = `${SITE_URL}/talleres/${taller.id}`
  const soldOut = Number(taller.spots_available) <= 0
  const event = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: taller.title,
    startDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: STUDIO_PLACE,
    organizer: { '@type': 'Organization', name: 'Estudio Popnest Wellness', url: SITE_URL },
    url,
    offers: {
      '@type': 'Offer',
      price: Number(taller.price) || 0,
      priceCurrency: 'MXN',
      availability: soldOut ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      url,
    },
  }
  const description = taller.descripcion || taller.tema
  if (description) event.description = String(description).slice(0, 500)
  if (taller.image_url) event.image = [taller.image_url]
  return event
}

/** Eventos de los talleres próximos (los pasados no deben marcarse como eventos vigentes). */
export function buildUpcomingTallerEvents(talleres) {
  return (talleres || []).filter(isUpcoming).map(buildTallerEvent).filter(Boolean)
}
