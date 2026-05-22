import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  getSeoForPath,
  getBreadcrumbItems,
  getCanonicalUrl,
  shouldNoindex,
  SITE_URL
} from '../utils/seo'

const BREADCRUMB_SCRIPT_ID = 'breadcrumb-schema'
const ROBOTS_META_NAME = 'robots'

function setRobotsMeta(noindex) {
  let meta = document.querySelector(`meta[name="${ROBOTS_META_NAME}"]`)
  if (noindex) {
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = ROBOTS_META_NAME
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', 'noindex, nofollow')
  } else if (meta) {
    meta.remove()
  }
}

/**
 * Actualiza title, meta description, canonical, robots y BreadcrumbList según la ruta.
 */
function PageSEO() {
  const { pathname } = useLocation()
  const { title, description } = getSeoForPath(pathname)
  const noindex = shouldNoindex(pathname)

  useEffect(() => {
    document.title = title

    let meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', description)

    setRobotsMeta(noindex)

    const href = getCanonicalUrl(pathname)
    let canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) {
      canonical.setAttribute('href', href)
    } else {
      const link = document.createElement('link')
      link.rel = 'canonical'
      link.href = href
      document.head.appendChild(link)
    }

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
  }, [pathname, title, description, noindex])

  return null
}

export default PageSEO
