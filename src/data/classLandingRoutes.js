/** Rutas y slugs de landings (sin importar assets — usable desde scripts Node). */

export const LANDING_SLUG_TO_CLASS_ID = {
  'hatha-yoga-coyoacan': 'hatha-yoga',
  'pilates-coyoacan': 'pilates',
  'sound-healing-coyoacan': 'sound-healing',
  'meditacion-coyoacan': 'meditacion',
  'yoga-vinyasa-coyoacan': 'yoga-vinyasa',
  'power-yoga-coyoacan': 'power-yoga-1',
  'tai-chi-coyoacan': 'tai-chi'
}

export const CLASS_LANDING_PATHS = Object.keys(LANDING_SLUG_TO_CLASS_ID).map(
  (slug) => `/clases/${slug}`
)

export const LANDING_SEO_TITLE = {
  'hatha-yoga': 'Hatha Yoga en Coyoacán | Clases y Reserva | Estudio Popnest Wellness',
  pilates: 'Pilates en Coyoacán | Clases y Reserva | Estudio Popnest Wellness',
  'sound-healing': 'Sound Healing en Coyoacán | Sanación Sonora | Estudio Popnest',
  meditacion: 'Meditación en Coyoacán | Clases Guiadas | Estudio Popnest Wellness',
  'yoga-vinyasa': 'Yoga Vinyasa en Coyoacán | Clases y Reserva | Estudio Popnest Wellness',
  'power-yoga-1': 'Power Yoga en Coyoacán | Clases Dinámicas | Estudio Popnest Wellness',
  'tai-chi': 'Tai Chi en Coyoacán | Clases y Reserva | Estudio Popnest Wellness'
}

export const LANDING_CLASS_NAME = {
  'hatha-yoga': 'Hatha Yoga',
  pilates: 'Pilates',
  'sound-healing': 'Sound Healing',
  meditacion: 'Meditación',
  'yoga-vinyasa': 'Yoga Vinyasa',
  'power-yoga-1': 'Power Yoga',
  'tai-chi': 'Tai Chi'
}

export const LANDING_SEO_DESCRIPTION = {
  'hatha-yoga':
    'Práctica tradicional de Hatha Yoga en Coyoacán para equilibrar cuerpo y mente con posturas, respiración y atención consciente.',
  pilates:
    'Clase de Pilates en Coyoacán enfocada en core, alineación y control del movimiento. Ideal para fortalecer el centro del cuerpo y mejorar postura.',
  'sound-healing':
    'Experiencia de sanación sonora en Coyoacán con cuencos tibetanos, gongs y vibraciones terapéuticas para relajación profunda y equilibrio energético.',
  meditacion:
    'Meditación guiada en Coyoacán que integra técnicas contemplativas y prácticas conscientes para desarrollar atención plena y reducir estrés.',
  'yoga-vinyasa':
    'Vinyasa consciente en Coyoacán: secuencias que enlazan movimiento y respiración con fuerza, movilidad y pausas para una práctica equilibrada.',
  'power-yoga-1':
    'Clase dinámica en Coyoacán que combina fuerza, resistencia y alineación en secuencias exigentes con guía experta.',
  'tai-chi':
    'Tai Chi en Coyoacán: movimientos fluidos y respiración consciente para mejorar equilibrio y bienestar integral.'
}

export const LANDING_H1_PREFIX = {
  'hatha-yoga': 'Hatha Yoga en Coyoacán',
  pilates: 'Pilates en Coyoacán',
  'sound-healing': 'Sound Healing en Coyoacán',
  meditacion: 'Meditación en Coyoacán',
  'yoga-vinyasa': 'Yoga Vinyasa en Coyoacán',
  'power-yoga-1': 'Power Yoga en Coyoacán',
  'tai-chi': 'Tai Chi en Coyoacán'
}

export function getClassIdFromLandingSlug(slug) {
  return LANDING_SLUG_TO_CLASS_ID[slug] ?? null
}

export function getLandingSlugForClassId(classId) {
  return Object.entries(LANDING_SLUG_TO_CLASS_ID).find(([, id]) => id === classId)?.[0] ?? null
}

export function getClassLandingSeo(pathname) {
  const slug = pathname.replace(/^\/clases\//, '').replace(/\/$/, '')
  const classId = getClassIdFromLandingSlug(slug)
  if (!classId) return null
  return {
    title: LANDING_SEO_TITLE[classId] ?? `${LANDING_CLASS_NAME[classId]} en Coyoacán | Estudio Popnest Wellness`,
    description: LANDING_SEO_DESCRIPTION[classId] ?? ''
  }
}

export function getClassLandingLabel(slug) {
  const classId = getClassIdFromLandingSlug(slug)
  return (classId && LANDING_CLASS_NAME[classId]) || slug
}
