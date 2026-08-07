/**
 * Planes "en propuesta" (revisión interna).
 *
 * Los planes marcados con `isProposal: true` en `src/data/packageOffers.js` NO se
 * muestran al público hasta que el equipo los apruebe. Mientras tanto, el equipo
 * los revisa con un enlace de preview: `/packages?preview=equipo`.
 *
 * Para hacerlos públicos tras la aprobación: cambia PROPOSAL_PLANS_PUBLIC a `true`
 * y despliega. Es reversible al instante volviéndolo a `false`.
 */

// ─── EL INTERRUPTOR ───────────────────────────────────────────────────────────
// false = planes nuevos ocultos al público (solo visibles con enlace de preview)
// true  = planes nuevos visibles para TODOS
export const PROPOSAL_PLANS_PUBLIC = true
// ──────────────────────────────────────────────────────────────────────────────

const PREVIEW_TOKEN = 'equipo'
const PREVIEW_QUERY_KEY = 'preview'
const PREVIEW_STORAGE_KEY = 'pn_preview_plans_v1'

function hasPreviewInUrl() {
  try {
    return new URLSearchParams(window.location.search).get(PREVIEW_QUERY_KEY) === PREVIEW_TOKEN
  } catch {
    return false
  }
}

function hasPreviewStored() {
  try {
    return window.localStorage.getItem(PREVIEW_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Si la URL trae `?preview=equipo`, persiste el modo preview para que siga activo
 * al navegar entre páginas. Llamar una vez al cargar la app.
 */
export function syncProposalPreviewFromUrl() {
  if (typeof window === 'undefined') return
  if (hasPreviewInUrl()) {
    try {
      window.localStorage.setItem(PREVIEW_STORAGE_KEY, '1')
    } catch {
      /* almacenamiento no disponible */
    }
  }
}

/** true si el visitante está en modo preview interno (por URL actual o guardado). */
export function isProposalPreviewActive() {
  if (typeof window === 'undefined') return false
  return hasPreviewInUrl() || hasPreviewStored()
}

/** true si los planes en propuesta deben mostrarse (público aprobado o preview interno). */
export function shouldShowProposalPlans() {
  return PROPOSAL_PLANS_PUBLIC || isProposalPreviewActive()
}
