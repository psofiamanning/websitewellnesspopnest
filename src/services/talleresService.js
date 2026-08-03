// Servicio de Talleres: web pública (listar, reservar) + panel admin (CRUD).
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

export async function fetchTalleres() {
  const res = await fetch(`${BACKEND_URL}/api/talleres`)
  const data = await asJson(res)
  return data.talleres || []
}

export async function fetchTaller(id) {
  const res = await fetch(`${BACKEND_URL}/api/talleres/${id}`)
  const data = await asJson(res)
  return data.taller || null
}

/** Registra la reserva de un taller después de un pago exitoso con Stripe. */
export async function bookTaller(id, payload) {
  const res = await fetch(`${BACKEND_URL}/api/talleres/${id}/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return asJson(res)
}

// ---------- Admin ----------

export async function adminListTalleres() {
  const res = await fetch(`${BACKEND_URL}/api/admin/talleres`, { headers: adminAuthHeaders() })
  const data = await asJson(res)
  return data.talleres || []
}

export async function adminCreateTaller(taller) {
  const res = await fetch(`${BACKEND_URL}/api/admin/talleres`, {
    method: 'POST',
    headers: adminAuthHeaders(),
    body: JSON.stringify(taller),
  })
  const data = await asJson(res)
  return data.taller
}

export async function adminUpdateTaller(id, patch) {
  const res = await fetch(`${BACKEND_URL}/api/admin/talleres/${id}`, {
    method: 'PUT',
    headers: adminAuthHeaders(),
    body: JSON.stringify(patch),
  })
  const data = await asJson(res)
  return data.taller
}

export async function adminDeleteTaller(id) {
  const res = await fetch(`${BACKEND_URL}/api/admin/talleres/${id}`, {
    method: 'DELETE',
    headers: adminAuthHeaders(),
  })
  return asJson(res)
}

export async function adminUploadTallerImage(dataUrl, filename) {
  const res = await fetch(`${BACKEND_URL}/api/admin/talleres/image`, {
    method: 'POST',
    headers: adminAuthHeaders(),
    body: JSON.stringify({ dataUrl, filename }),
  })
  const data = await asJson(res)
  return data.url
}

export async function adminListTallerBookings(tallerId) {
  const qs = tallerId ? `?tallerId=${tallerId}` : ''
  const res = await fetch(`${BACKEND_URL}/api/admin/taller-bookings${qs}`, { headers: adminAuthHeaders() })
  const data = await asJson(res)
  return data.bookings || []
}

/** Genera un link de pago de Stripe a partir del título y precio del taller. */
export async function adminGeneratePaymentLink(title, price) {
  const res = await fetch(`${BACKEND_URL}/api/admin/talleres/payment-link`, {
    method: 'POST',
    headers: adminAuthHeaders(),
    body: JSON.stringify({ title, price }),
  })
  const data = await asJson(res)
  return data.url
}

/** Editor con IA: `current` es null al crear, o el taller en edición para aplicar cambios. */
export async function adminGenerateTallerAI(instruction, current) {
  const res = await fetch(`${BACKEND_URL}/api/admin/talleres/ai`, {
    method: 'POST',
    headers: adminAuthHeaders(),
    body: JSON.stringify({ instruction, current: current || null }),
  })
  const data = await asJson(res)
  return data.taller
}
