// Servicio para captura de correos (popup de clase gratis)
import { BACKEND_URL } from '../config/api.js'

/**
 * Guarda un correo capturado por el popup de clase gratis.
 * Lanza Error con mensaje legible si falla.
 */
export const saveLeadEmail = async (email, { source = 'free_class_popup', offer = 'clase_gratis' } = {}) => {
  const response = await fetch(`${BACKEND_URL}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, source, offer }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.ok) {
    throw new Error(data.error || 'No pudimos guardar tu correo. Inténtalo de nuevo.')
  }
  return data
}
