import { SINGLE_CLASS_PRICE_MXN } from '../config/pricing.js'

/** Rutas y slugs de landings (sin importar assets — usable desde scripts Node). */

export const LANDING_SLUG_TO_CLASS_ID = {
  'hatha-yoga-coyoacan': 'hatha-yoga',
  'pilates-coyoacan': 'pilates',
  'sound-healing-coyoacan': 'sound-healing',
  'meditacion-coyoacan': 'meditacion',
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
  'power-yoga-1': 'Power Yoga en Coyoacán | Clases Dinámicas | Estudio Popnest Wellness',
  'tai-chi': 'Tai Chi en Coyoacán | Clases y Reserva | Estudio Popnest Wellness'
}

export const LANDING_CLASS_NAME = {
  'hatha-yoga': 'Hatha Yoga',
  pilates: 'Pilates',
  'sound-healing': 'Sound Healing',
  meditacion: 'Meditación',
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

/** Preguntas frecuentes por práctica (contenido SEO en cada landing). */
export const LANDING_FAQ_BY_CLASS_ID = {
  'hatha-yoga': [
    {
      q: '¿Necesito experiencia previa para Hatha Yoga en Coyoacán?',
      a: 'No es indispensable. Las clases están pensadas para distintos niveles; la coach guía posturas, respiración y ritmo con grupos reducidos.'
    },
    {
      q: '¿Cuánto dura la clase?',
      a: 'Cada sesión dura 60 minutos en Estudio Popnest Wellness, Del Carmen, Coyoacán.'
    }
  ],
  pilates: [
    {
      q: '¿Pilates en Coyoacán es apto si tengo poca condición física?',
      a: 'Sí. El trabajo es progresivo, con foco en alineación y control. Puedes adaptar la intensidad desde el primer día.'
    },
    {
      q: '¿Qué debo llevar?',
      a: 'Ropa cómoda. En el estudio hay mat y equipamiento básico; si tienes dudas, escríbenos antes de tu primera clase.'
    }
  ],
  'sound-healing': [
    {
      q: '¿Qué es una sesión de Sound Healing?',
      a: 'Es una experiencia pasiva con cuencos, gongs y otras frecuencias. Te recuestas mientras el sonido acompaña la relajación profunda.'
    },
    {
      q: '¿Puedo asistir si nunca he meditado?',
      a: 'Sí. No requiere posturas ni experiencia previa; solo llegar con ropa cómoda y apertura a descansar.'
    }
  ],
  meditacion: [
    {
      q: '¿Cómo son las clases de meditación en Coyoacán?',
      a: 'Sesiones guiadas de 60 minutos con técnicas de atención plena, respiración y prácticas contemplativas en un espacio tranquilo.'
    },
    {
      q: '¿Es en grupo o individual?',
      a: 'Las clases regulares son en grupo reducido. Puedes reservar en línea según el horario publicado.'
    }
  ],
  'power-yoga-1': [
    {
      q: '¿En qué se diferencia Power Yoga de otras clases de yoga?',
      a: 'Es una práctica más vigorosa, con secuencias fluidas que desarrollan fuerza y resistencia, siempre con atención a la respiración.'
    },
    {
      q: '¿Quién imparte la clase?',
      a: 'Rocío Enciso, con formación en yoga deportivo y amplia trayectoria docente.'
    }
  ],
  'tai-chi': [
    {
      q: '¿Tai Chi es solo para adultos mayores?',
      a: 'No. Es accesible a cualquier edad; los movimientos son suaves y se aprenden paso a paso.'
    },
    {
      q: '¿Se practica de pie o en el suelo?',
      a: 'Las clases regulares son de pie, en secuencias lentas y continuas. Ven con ropa cómoda y calzado ligero.'
    }
  ]
}

export function getLandingNavItems() {
  return Object.entries(LANDING_SLUG_TO_CLASS_ID).map(([slug, classId]) => ({
    slug,
    path: `/clases/${slug}`,
    name: LANDING_CLASS_NAME[classId]
  }))
}

/** Schema.org Course para landings (build + prerender). */
export function buildCourseSchemaForLanding(pathname, siteUrl = 'https://popnest.app') {
  const slug = pathname.replace(/^\/clases\//, '').replace(/\/$/, '')
  const classId = getClassIdFromLandingSlug(slug)
  if (!classId) return null
  const name = LANDING_CLASS_NAME[classId]
  const description = LANDING_SEO_DESCRIPTION[classId]
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `${name} en Coyoacán`,
    description,
    provider: {
      '@type': 'HealthAndBeautyBusiness',
      name: 'Estudio Popnest Wellness',
      url: siteUrl,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Londres 105, Del Carmen',
        addressLocality: 'Coyoacán',
        addressRegion: 'CDMX',
        postalCode: '04100',
        addressCountry: 'MX'
      }
    },
    offers: {
      '@type': 'Offer',
      price: String(SINGLE_CLASS_PRICE_MXN),
      priceCurrency: 'MXN',
      url: `${siteUrl}/booking/class/${classId}`,
      availability: 'https://schema.org/InStock'
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'onsite',
      duration: 'PT60M',
      location: {
        '@type': 'Place',
        name: 'Estudio Popnest Wellness',
        address: 'Londres 105, Del Carmen, Coyoacán, CDMX'
      }
    }
  }
}
