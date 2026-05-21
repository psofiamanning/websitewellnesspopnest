import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './styles/tokens.css'
import App from './App.jsx'
import './index.css'

const container = document.getElementById('root')
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Tras pre-render en build, #root ya tiene HTML: hidratar en lugar de reemplazar.
if (container.hasChildNodes()) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
