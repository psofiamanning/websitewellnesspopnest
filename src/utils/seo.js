import {
  CLASS_LANDING_PATHS,
  getClassLandingLabel,
  getClassLandingSeo
} from '../data/classLandingRoutes.js'

/**
 * Títulos y meta descriptions por ruta para SEO local (Coyoacán).
 * Base URL para canonical y OG.
 */
export const SITE_URL = 'https://popnest.app'

/** Texto alt para iconos de clase en páginas públicas. */
export function getClassImageAlt(className) {
  return `Clase de ${className} en Coyoacán — Estudio Popnest Wellness`
}

const PUBLIC_STATIC_ROUTES = [
  '/',
  '/classes',
  '/horario',
  '/packages',
  '/ubicacion',
  '/privacidad',
  '/terminos'
]

/** Rutas públicas que se pre-renderizan en build (HTML estático para crawlers). */
export const PRERENDER_ROUTES = [...PUBLIC_STATIC_ROUTES, ...CLASS_LANDING_PATHS]

/** Mismas rutas que el sitemap (sin login, reservas ni áreas privadas). */
export const SITEMAP_ROUTES = PRERENDER_ROUTES

const SITEMAP_META_BY_ROUTE = {
  '/': { changefreq: 'weekly', priority: 1.0 },
  '/classes': { changefreq: 'weekly', priority: 0.9 },
  '/horario': { changefreq: 'weekly', priority: 0.8 },
  '/packages': { changefreq: 'monthly', priority: 0.8 },
  '/ubicacion': { changefreq: 'monthly', priority: 0.8 },
  '/privacidad': { changefreq: 'yearly', priority: 0.4 },
  '/terminos': { changefreq: 'yearly', priority: 0.4 }
}

/** Meta sitemap (changefreq, priority) por ruta pública. */
export function getSitemapMeta(pathname) {
  if (pathname.startsWith('/clases/')) {
    return { changefreq: 'monthly', priority: 0.7 }
  }
  return SITEMAP_META_BY_ROUTE[pathname] ?? { changefreq: 'monthly', priority: 0.5 }
}

const NOINDEX_PREFIXES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/mis-reservas',
  '/mis-paquetes',
  '/admin',
  '/coaches/login',
  '/coaches/panel',
  '/booking',
  '/design-system',
  '/home-redesign',
  '/schedule-redesign',
  '/packages-redesign',
  '/mis-reservas-redesign',
  '/classes-redesign',
  '/previews'
]

/** Rutas de cuenta, reserva, admin y previews: no indexar en buscadores. */
export function shouldNoindex(pathname) {
  if (!pathname) return false
  if (SITEMAP_ROUTES.includes(pathname)) return false
  if (pathname === '/teachers' || pathname === '/coaches') return true
  return NOINDEX_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

export function getCanonicalUrl(pathname) {
  if (!pathname || pathname === '/') return `${SITE_URL}/`
  return `${SITE_URL}${pathname}`.replace(/\/$/, '') || `${SITE_URL}/`
}

const DEFAULT_TITLE = 'Yoga y Bienestar en Coyoacán | Estudio Popnest Wellness'
const DEFAULT_DESCRIPTION = 'Clases de yoga, meditación y sound healing en Coyoacán. Reserva en línea en Estudio Popnest Wellness. Estudio boutique en el corazón de la ciudad.'

export const ROUTE_SEO = {
  '/': {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION
  },
  '/classes': {
    title: 'Clases de Yoga y Bienestar en Coyoacán | Estudio Popnest Wellness',
    description: 'Descubre clases de yoga, tai chi, meditación y sound healing en Coyoacán. Reserva en línea. Estudio boutique en Coyoacán, CDMX.'
  },
  '/coaches': {
    title: 'Coaches de Yoga en Coyoacán | Estudio Popnest Wellness',
    description: 'Conoce a los coaches de yoga y bienestar en Estudio Popnest Wellness, Coyoacán. Reserva tu clase en línea.'
  },
  '/coaches/login': {
    title: 'Acceso coaches | Estudio Popnest Wellness',
    description: 'Inicio de sesión para el equipo de coaches en Estudio Popnest Wellness, Coyoacán.'
  },
  '/coaches/panel': {
    title: 'Panel coach | Estudio Popnest Wellness',
    description: 'Consulta tus próximas reservas como coach en Estudio Popnest Wellness.'
  },
  '/teachers': {
    title: 'Coaches de Yoga en Coyoacán | Estudio Popnest Wellness',
    description: 'Conoce a los coaches de yoga y bienestar en Estudio Popnest Wellness, Coyoacán. Reserva tu clase en línea.'
  },
  '/horario': {
    title: 'Horario de Clases en Coyoacán | Estudio Popnest Wellness',
    description: 'Consulta el horario de yoga, meditación y sound healing en Coyoacán. Reserva tu clase en Estudio Popnest Wellness.'
  },
  '/packages': {
    title: 'Paquetes de Clases | Yoga en Coyoacán | Estudio Popnest Wellness',
    description: 'Paquetes de clases de yoga y bienestar en Coyoacán. Ahorra reservando varias clases en Estudio Popnest Wellness.'
  },
  '/ubicacion': {
    title: 'Ubicación - Estudio de yoga en Coyoacán | Estudio Popnest Wellness',
    description: 'Estudio Popnest Wellness en Del Carmen, Coyoacán, CDMX. Dirección, cómo llegar y clases de yoga, meditación y sound healing en Coyoacán.'
  },
  '/privacidad': {
    title: 'Política de Privacidad | Estudio Popnest Wellness',
    description: 'Política de privacidad y protección de datos personales de Estudio Popnest Wellness. Ley aplicable: México (LFPDPPP).'
  },
  '/terminos': {
    title: 'Términos y Condiciones | Estudio Popnest Wellness',
    description: 'Términos y condiciones de uso del sitio y servicios de Estudio Popnest Wellness, Coyoacán.'
  },
  '/login': {
    title: 'Iniciar sesión | Estudio Popnest Wellness',
    description: 'Inicia sesión en tu cuenta de Estudio Popnest Wellness para gestionar tus reservas en Coyoacán.'
  },
  '/signup': {
    title: 'Registro | Estudio Popnest Wellness',
    description: 'Crea tu cuenta en Estudio Popnest Wellness y reserva clases de yoga y bienestar en Coyoacán.'
  },
  '/mis-reservas': {
    title: 'Mis Reservas | Estudio Popnest Wellness',
    description: 'Consulta y gestiona tus reservas de clases en Estudio Popnest Wellness, Coyoacán.'
  },
  '/mis-paquetes': {
    title: 'Mis Paquetes | Estudio Popnest Wellness',
    description: 'Consulta tus paquetes de clases activos, clases disponibles e historial de compras en Estudio Popnest Wellness.'
  }
}

/** Nombre legible por slug de clase (para breadcrumb Reservar X). */
const CLASS_SLUG_TO_NAME = {
  'hatha-yoga': 'Hatha Yoga',
  'tai-chi': 'Tai Chi',
  'sound-healing': 'Sound Healing',
  'meditacion': 'Meditación',
  'power-yoga-1': 'Power Yoga',
  'belly-dance': 'Belly Dance',
  'stretching': 'Stretching',
  'meditacion-sound-healing': 'Meditación y Sound Healing',
  pilates: 'Pilates'
}

/**
 * Devuelve los ítems de breadcrumb para la ruta (para Schema BreadcrumbList).
 * @returns {Array<{ name: string, url: string }>}
 */
export function getBreadcrumbItems(pathname) {
  const home = { name: 'Inicio', url: '/' }
  if (!pathname || pathname === '/') return [home]

  const segments = pathname.split('/').filter(Boolean)
  const items = [home]

  if (segments[0] === 'classes') {
    items.push({ name: 'Clases', url: '/classes' })
    return items
  }

  if (segments[0] === 'clases' && segments[1]) {
    items.push({ name: 'Clases', url: '/classes' })
    items.push({ name: getClassLandingLabel(segments[1]), url: pathname })
    return items
  }

  if (segments[0] === 'coaches') {
    if (segments[1] === 'login') {
      items.push({ name: 'Acceso coaches', url: pathname })
      return items
    }
    if (segments[1] === 'panel') {
      items.push({ name: 'Panel coach', url: pathname })
      return items
    }
    items.push({ name: 'Clases', url: '/classes' })
    return items
  }

  if (segments[0] === 'teachers') {
    items.push({ name: 'Clases', url: '/classes' })
    if (segments.length > 1) items.push({ name: 'Reservar', url: pathname })
    return items
  }

  if (segments[0] === 'booking') {
    if (segments[1] === 'coach' || segments[1] === 'teacher') {
      items.push({ name: 'Clases', url: '/classes' })
    } else {
      items.push({ name: 'Clases', url: '/classes' })
    }
    if (segments[1] === 'class' && segments[2]) {
      const className = CLASS_SLUG_TO_NAME[segments[2]] || segments[2]
      items.push({ name: `Reservar ${className}`, url: pathname })
    } else {
      items.push({ name: 'Reservar', url: pathname })
    }
    return items
  }

  const labels = {
    horario: 'Horario',
    packages: 'Planes',
    ubicacion: 'Ubicación',
    privacidad: 'Política de privacidad',
    terminos: 'Términos y condiciones',
    login: 'Iniciar sesión',
    signup: 'Crear cuenta',
    'mis-reservas': 'Mis reservas',
    'mis-paquetes': 'Mis paquetes'
  }
  const label = labels[segments[0]] || segments[0]
  items.push({ name: label, url: pathname })
  return items
}

/** Obtiene SEO para una ruta; si es /booking/* usa el de clases. */
export function getSeoForPath(pathname) {
  const exact = ROUTE_SEO[pathname]
  if (exact) return exact
  if (pathname.startsWith('/clases/')) {
    const landingSeo = getClassLandingSeo(pathname)
    if (landingSeo) return landingSeo
  }
  if (pathname === '/teachers' || pathname === '/coaches') return ROUTE_SEO['/classes']
  if (pathname.startsWith('/booking/class/')) {
    return {
      title: 'Reservar clase | Yoga en Coyoacán | Estudio Popnest Wellness',
      description: 'Reserva tu clase de yoga, meditación o sound healing en Coyoacán. Estudio Popnest Wellness.'
    }
  }
  if (pathname.startsWith('/booking/')) {
    return {
      title: 'Reservar | Estudio Popnest Wellness',
      description: 'Completa tu reserva en Estudio Popnest Wellness, Coyoacán.'
    }
  }
  return { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION }
}
