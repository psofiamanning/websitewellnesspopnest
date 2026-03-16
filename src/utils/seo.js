/**
 * Títulos y meta descriptions por ruta para SEO local (Coyoacán).
 * Base URL para canonical y OG.
 */
export const SITE_URL = 'https://popnest.app'

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
  '/teachers': {
    title: 'Profesores de Yoga en Coyoacán | Estudio Popnest Wellness',
    description: 'Conoce a los profesores de yoga y bienestar en Estudio Popnest Wellness, Coyoacán. Reserva tu clase en línea.'
  },
  '/horario': {
    title: 'Horario de Clases en Coyoacán | Estudio Popnest Wellness',
    description: 'Consulta el horario de yoga, meditación y sound healing en Coyoacán. Reserva tu clase en Estudio Popnest Wellness.'
  },
  '/packages': {
    title: 'Paquetes de Clases | Yoga en Coyoacán | Estudio Popnest Wellness',
    description: 'Paquetes de clases de yoga y bienestar en Coyoacán. Ahorra reservando varias clases en Estudio Popnest Wellness.'
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
  }
}

/** Obtiene SEO para una ruta; si es /booking/* usa el de clases. */
export function getSeoForPath(pathname) {
  const exact = ROUTE_SEO[pathname]
  if (exact) return exact
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
