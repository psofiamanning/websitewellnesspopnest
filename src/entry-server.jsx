import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { AppContent } from './App.jsx'

/**
 * Renderiza la app en HTML para una ruta (pre-render en build).
 * @param {string} url - pathname, ej. '/' o '/ubicacion'
 */
export function render(url) {
  const html = renderToString(
    <StaticRouter location={url}>
      <AppContent />
    </StaticRouter>
  )
  return { html }
}
