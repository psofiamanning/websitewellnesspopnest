/** Especialidad legible (p. ej. "POWER YOGA · YOGA DEPORTIVO" → "Power yoga · Yoga deportivo"). */
export function formatCoachSpecialtyLabel(s) {
  if (!s || typeof s !== 'string') return ''
  return s
    .split(/\s*·\s*/)
    .map((seg) => {
      const t = seg.trim()
      if (!t.length) return ''
      return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
    })
    .filter(Boolean)
    .join(' · ')
}
