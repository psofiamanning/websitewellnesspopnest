import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getSeoForPath, getBreadcrumbItems, SITE_URL } from '../utils/seo'

const BREADCRUMB_SCRIPT_ID = 'breadcrumb-schema'

/**
 * Actualiza title, meta description, canonical y BreadcrumbList (Schema) según la ruta.
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

    // BreadcrumbList (Schema.org) para el snippet en Google
    const items = getBreadcrumbItems(pathname)
    const itemListElement = items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url === '/' ? '' : item.url}`
    }))
    const breadcrumbJson = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement
    }
    let script = document.getElementById(BREADCRUMB_SCRIPT_ID)
    if (script) script.remove()
    script = document.createElement('script')
    script.id = BREADCRUMB_SCRIPT_ID
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(breadcrumbJson)
    document.head.appendChild(script)
  }, [pathname, title, description])

  return null
}

export default PageSEO
