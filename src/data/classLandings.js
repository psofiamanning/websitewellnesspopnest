import { classTypes, classSchedules } from './classes.js'
import {
  LANDING_SLUG_TO_CLASS_ID,
  CLASS_LANDING_PATHS,
  LANDING_H1_PREFIX,
  LANDING_FAQ_BY_CLASS_ID,
  getClassIdFromLandingSlug,
  getLandingSlugForClassId
} from './classLandingRoutes.js'

export {
  LANDING_SLUG_TO_CLASS_ID,
  CLASS_LANDING_PATHS,
  getClassIdFromLandingSlug,
  getLandingSlugForClassId
}

export { getClassLandingSeo, getClassLandingLabel } from './classLandingRoutes.js'

export function getClassLandingPath(slug) {
  return slug ? `/clases/${slug}` : null
}

function formatScheduleSummary(classId) {
  const sched = classSchedules[classId]
  if (!sched?.days?.length) return null
  const parts = sched.days.map((day) => {
    const times = sched.timesByDay?.[day] ?? sched.times ?? []
    if (!times.length) return day
    return `${day} ${times.join(', ')}`
  })
  return parts.join(' · ')
}

export function getClassLandingData(slug) {
  const classId = getClassIdFromLandingSlug(slug)
  if (!classId) return null
  const c = classTypes.find((x) => x.id === classId)
  if (!c) return null

  const paragraphs = (c.fullDescription || c.description)
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean)

  return {
    slug,
    classId,
    name: c.name,
    h1: LANDING_H1_PREFIX[classId] ?? `${c.name} en Coyoacán`,
    teacher: c.teacher,
    duration: c.duration,
    image: c.image,
    intro: c.description,
    paragraphs,
    scheduleSummary: formatScheduleSummary(classId),
    bookingPath: `/booking/class/${classId}`,
    horarioPath: '/horario',
    faqs: LANDING_FAQ_BY_CLASS_ID[classId] ?? [],
    otherLandings: Object.entries(LANDING_SLUG_TO_CLASS_ID)
      .filter(([s]) => s !== slug)
      .map(([s, id]) => {
        const other = classTypes.find((x) => x.id === id)
        return { slug: s, name: other?.name ?? id, path: `/clases/${s}` }
      })
  }
}
