/**
 * Tras vite build + SSR bundle: genera index.html por ruta con contenido en #root
 * y meta tags correctos para crawlers (Google, ChatGPT, etc.).
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  PRERENDER_ROUTES,
  SITEMAP_ROUTES,
  getSeoForPath,
  getCanonicalUrl,
  getBreadcrumbItems,
  getSitemapMeta,
  shouldNoindex,
  SITE_URL
} from '../src/utils/seo.js'
import { buildCourseSchemaForLanding } from '../src/data/classLandingRoutes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const templatePath = path.join(distDir, 'index.html')
const ssrEntry = path.join(distDir, 'server', 'entry-server.js')

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function replaceTag(html, pattern, replacement) {
  if (pattern.test(html)) return html.replace(pattern, replacement)
  return html
}

function applyRouteHead(html, pathname) {
  const { title, description } = getSeoForPath(pathname)
  const canonical = getCanonicalUrl(pathname)
  const safeTitle = escapeHtml(title)
  const safeDesc = escapeHtml(description)
  const safeCanonical = escapeHtml(canonical)

  let out = html
  out = replaceTag(out, /<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`)
  out = replaceTag(
    out,
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${safeDesc}" />`
  )
  out = replaceTag(
    out,
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${safeCanonical}" />`
  )
  out = replaceTag(out, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${safeCanonical}" />`)
  out = replaceTag(out, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${safeTitle}" />`)
  out = replaceTag(
    out,
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${safeDesc}" />`
  )
  out = replaceTag(
    out,
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${safeTitle}" />`
  )
  out = replaceTag(
    out,
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${safeDesc}" />`
  )

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
  const breadcrumbScript = `<script id="breadcrumb-schema" type="application/ld+json">${JSON.stringify(breadcrumbJson)}</script>`
  out = out.replace(/<script id="course-schema"[\s\S]*?<\/script>\s*/gi, '')
  out = out.replace('</head>', `    ${breadcrumbScript}\n  </head>`)

  if (pathname.startsWith('/clases/')) {
    const course = buildCourseSchemaForLanding(pathname, SITE_URL)
    if (course) {
      const courseScript = `<script id="course-schema" type="application/ld+json">${JSON.stringify(course)}</script>`
      out = out.replace('</head>', `    ${courseScript}\n  </head>`)
    }
  }

  if (shouldNoindex(pathname)) {
    out = replaceTag(
      out,
      /<meta name="robots" content="[^"]*"\s*\/?>/,
      '<meta name="robots" content="noindex, nofollow" />'
    )
    if (!out.includes('name="robots"')) {
      out = out.replace('</head>', '    <meta name="robots" content="noindex, nofollow" />\n  </head>')
    }
  } else {
    out = out.replace(/\s*<meta name="robots" content="[^"]*"\s*\/?>\n?/i, '\n')
  }

  return out
}

function injectAppHtml(template, appHtml) {
  const marker = '<div id="root"></div>'
  if (!template.includes(marker)) {
    throw new Error('Plantilla dist/index.html sin <div id="root"></div>')
  }
  return template.replace(marker, `<div id="root">${appHtml}</div>`)
}

function outputPathForRoute(route) {
  if (route === '/') return path.join(distDir, 'index.html')
  const segment = route.replace(/^\//, '')
  return path.join(distDir, segment, 'index.html')
}

/** Fecha del build en formato W3C (YYYY-MM-DD) para lastmod del sitemap. */
function buildLastmodDate() {
  return new Date().toISOString().slice(0, 10)
}

function buildSitemapXml(lastmod) {
  const urls = SITEMAP_ROUTES.map((route) => {
    const loc = getCanonicalUrl(route)
    const { changefreq, priority } = getSitemapMeta(route)
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`
  })
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
}

async function writeSitemap(lastmod) {
  const xml = buildSitemapXml(lastmod)
  const distPath = path.join(distDir, 'sitemap.xml')
  const publicPath = path.join(rootDir, 'public', 'sitemap.xml')
  await fs.writeFile(distPath, xml, 'utf8')
  await fs.writeFile(publicPath, xml, 'utf8')
  console.log(`prerender: sitemap.xml (${SITEMAP_ROUTES.length} URLs, lastmod ${lastmod})`)
}

async function main() {
  try {
    await fs.access(templatePath)
    await fs.access(ssrEntry)
  } catch {
    console.error('prerender: falta dist/index.html o dist/server/entry-server.js — ejecuta vite build primero.')
    process.exit(1)
  }

  const template = await fs.readFile(templatePath, 'utf8')
  const { render } = await import(pathToFileURL(ssrEntry).href)
  const lastmod = buildLastmodDate()

  for (const route of PRERENDER_ROUTES) {
    const { html: appHtml } = await render(route)
    let pageHtml = injectAppHtml(template, appHtml)
    pageHtml = applyRouteHead(pageHtml, route)
    const outPath = outputPathForRoute(route)
    await fs.mkdir(path.dirname(outPath), { recursive: true })
    await fs.writeFile(outPath, pageHtml, 'utf8')
    console.log(`prerender: ${route} → ${path.relative(rootDir, outPath)}`)
  }

  await writeSitemap(lastmod)
  console.log(`prerender: ${PRERENDER_ROUTES.length} rutas listas.`)
}

main().catch((err) => {
  console.error('prerender:', err)
  process.exit(1)
})
