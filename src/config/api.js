/** API base URL: Vite env in deploy, api.popnest.app in production builds, localhost in dev. */
const PRODUCTION_API = 'https://api.popnest.app'
const LOCAL_API = 'http://localhost:3002'

function resolveBackendUrl() {
  const fromEnv = import.meta.env.VITE_BACKEND_URL
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).trim().replace(/\/$/, '')
  }
  return import.meta.env.PROD ? PRODUCTION_API : LOCAL_API
}

export const BACKEND_URL = resolveBackendUrl()
