// Servicio de Renta de salón: web pública (disponibilidad, checkout, solicitud
// especial) + panel admin (listar reservas y solicitudes).
import { BACKEND_URL } from '../config/api.js'

function adminAuthHeaders() {
  const token = localStorage.getItem('admin_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function asJson(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || 'Ocurrió un error. Intenta de nuevo.')
  }
  return data
}

// ---------- Público ----------

export async function fetchSalonAvailability(date) {
  const res = await fetch(`${BACKEND_URL}/api/salon/disponibilidad?date=${encodeURIComponent(date)}`)
  const data = await asJson(res)
  return data.bookedRanges || []
}

/** Crea la reserva pendiente + la Checkout Session; devuelve la URL de Stripe. */
export async function createSalonCheckout(payload) {
  const res = await fetch(`${BACKEND_URL}/api/salon/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await asJson(res)
  return data.url
}

export async function fetchSalonCheckoutStatus(sessionId) {
  const res = await fetch(`${BACKEND_URL}/api/salon/checkout/${sessionId}/status`)
  return asJson(res)
}

export async function submitSalonSpecialRequest(payload) {
  const res = await fetch(`${BACKEND_URL}/api/salon/solicitud-especial`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return asJson(res)
}

// ---------- Admin ----------

export async function adminListSalonBookings() {
  const res = await fetch(`${BACKEND_URL}/api/admin/salon-bookings`, { headers: adminAuthHeaders() })
  const data = await asJson(res)
  return data.bookings || []
}

export async function adminListSalonSpecialRequests() {
  const res = await fetch(`${BACKEND_URL}/api/admin/salon-special-requests`, { headers: adminAuthHeaders() })
  const data = await asJson(res)
  return data.requests || []
}

export async function adminUpdateSalonSpecialRequestStatus(id, status) {
  const res = await fetch(`${BACKEND_URL}/api/admin/salon-special-requests/${id}`, {
    method: 'PATCH',
    headers: adminAuthHeaders(),
    body: JSON.stringify({ status }),
  })
  const data = await asJson(res)
  return data.request
}
