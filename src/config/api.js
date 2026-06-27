/** API base URL: Vite env in deploy, api.popnest.app in production builds, same host in dev. */
const PRODUCTION_API = 'https://api.popnest.app'
const DEV_API_PORT = 3002

/**
 * En desarrollo apunta al MISMO host que sirvió la página: `localhost` en la
 * computadora, o la IP de la red (p. ej. 10.0.0.102) cuando se abre desde el
 * teléfono. Así el backend siempre es alcanzable sin hardcodear la IP — clave
 * para probar el login y las reservas en el celular.
 */
function devLocalApi() {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:${DEV_API_PORT}`
  }
  return `http://localhost:${DEV_API_PORT}`
}

function resolveBackendUrl() {
  const fromEnv = import.meta.env.VITE_BACKEND_URL
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).trim().replace(/\/$/, '')
  }
  return import.meta.env.PROD ? PRODUCTION_API : devLocalApi()
}

export const BACKEND_URL = resolveBackendUrl()
