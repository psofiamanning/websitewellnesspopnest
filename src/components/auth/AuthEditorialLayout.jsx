import { Link, useNavigate } from 'react-router-dom'
import Logo from '../ui/Logo'

function AuthEditorialLayout({
  eyebrow,
  title,
  lead,
  aside,
  children,
  switchPrompt,
  switchLinkText,
  switchTo,
}) {
  const navigate = useNavigate()
  const search = typeof window !== 'undefined' ? window.location.search : ''

  return (
    <div className="auth-page">
      <header className="auth-top">
        <button type="button" className="auth-top__logo" onClick={() => navigate('/')} aria-label="Inicio">
          <Logo size="sm" />
        </button>
        <Link to="/" className="auth-top__back">
          ← Volver al inicio
        </Link>
      </header>

      <div className="auth-layout">
        <div className="auth-form-col">
          <p className="auth-eyebrow">
            <span className="auth-eyebrow__line" aria-hidden />
            {eyebrow}
          </p>
          <h1 className="auth-title">{title}</h1>
          {lead ? <p className="auth-lead">{lead}</p> : null}
          {children}
          {switchPrompt && switchTo ? (
            <div className="auth-switch">
              <p>{switchPrompt}</p>
              <Link to={`${switchTo}${search}`}>
                {switchLinkText} →
              </Link>
            </div>
          ) : null}
        </div>
        <aside className="auth-aside" aria-label="Información">
          {aside}
        </aside>
      </div>
    </div>
  )
}

export default AuthEditorialLayout
