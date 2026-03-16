import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getSeoForPath, SITE_URL } from '../utils/seo'

/**
 * Actualiza title, meta description y canonical según la ruta actual (SEO por página).
 */
function PageSEO() {
  const { pathname } = useLocation()
  const { title, description } = getSeoForPath(pathname)

  useEffect(() => {
    document.title = title

    let meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', description)

    let canonical = document.querySelector('link[rel="canonical"]')
    const href = `${SITE_URL}${pathname === '/' ? '' : pathname}`.replace(/\/$/, '') || SITE_URL + '/'
    if (canonical) {
      canonical.setAttribute('href', href)
    } else {
      const link = document.createElement('link')
      link.rel = 'canonical'
      link.href = href
      document.head.appendChild(link)
    }
  }, [pathname, title, description])

  return null
}

export default PageSEO
