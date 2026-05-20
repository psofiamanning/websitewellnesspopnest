import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'
import {
  isAuthenticated,
  getCurrentUser,
  logout,
  POST_LOGIN_CLASSES_SESSION_KEY,
} from '../services/authService'
import { getUserPackages, getUserPackagesAll } from '../services/bookingService'
import '../styles/navShell.css'

const MENU_ITEMS = [
  { id: 'inicio', label: 'Inicio', path: '/', hash: 'inicio' },
  { id: 'clases', label: 'Clases', path: '/classes', hash: 'clases' },
  { id: 'horario', label: 'Horario', path: '/horario', hash: 'horario' },
  { id: 'planes', label: 'Planes', path: '/packages', hash: 'planes' },
]

function Navbar() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showMyPackages, setShowMyPackages] = useState(false)

  const isHome = location.pathname === '/'

  useEffect(() => {
    setAuthenticated(isAuthenticated())
    setCurrentUser(getCurrentUser())
    setIsMenuOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!authenticated || !currentUser?.email) {
      setShowMyPackages(false)
      return
    }

    let cancelled = false

    const readSessionPackageHint = () => {
      try {
        const raw = sessionStorage.getItem(POST_LOGIN_CLASSES_SESSION_KEY)
        if (raw == null || raw === '') return false
        const n = parseInt(raw, 10)
        return Number.isFinite(n) && n >= 1
      } catch {
        return false
      }
    }

    const resolve = async () => {
      if (readSessionPackageHint()) {
        if (!cancelled) setShowMyPackages(true)
      }
      try {
        const [allData, activeData] = await Promise.all([
          getUserPackagesAll(currentUser.email),
          getUserPackages(currentUser.email),
        ])
        if (cancelled) return
        const show =
          Boolean(allData?.hasPurchasedPackages) ||
          Boolean(allData?.hasActivePackages) ||
          Boolean(activeData?.hasActivePackages) ||
          (activeData?.packages?.length ?? 0) > 0 ||
          readSessionPackageHint()
        setShowMyPackages(show)
      } catch {
        if (!cancelled) setShowMyPackages(readSessionPackageHint())
      }
    }

    resolve()
    const onLoginClasses = () => {
      if (!cancelled) setShowMyPackages(true)
    }
    window.addEventListener('epw-post-login-classes', onLoginClasses)
    return () => {
      cancelled = true
      window.removeEventListener('epw-post-login-classes', onLoginClasses)
    }
  }, [authenticated, currentUser?.email])

  const handleLogout = () => {
    logout()
    setAuthenticated(false)
    setCurrentUser(null)
    setIsMenuOpen(false)
  }

  const itemHref = (item) => {
    if (isHome) {
      return item.hash === 'inicio' ? '/#inicio' : `/#${item.hash}`
    }
    return item.path
  }

  const isItemActive = (item) => {
    if (isHome) {
      const hash = (location.hash || '#inicio').replace('#', '')
      return hash === item.hash
    }
    if (item.path === '/') {
      return location.pathname === '/'
    }
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
  }

  const userInitials =
    currentUser?.firstName && currentUser?.lastName
      ? `${(currentUser.firstName[0] || '').toUpperCase()}${(currentUser.lastName[0] || '').toUpperCase()}`
      : currentUser?.firstName
        ? `${(currentUser.firstName[0] || '').toUpperCase()}${(currentUser.firstName[1] || '').toUpperCase()}`
        : '?'

  const renderAccountLinks = (mobile = false) => {
    const linkClass = mobile ? 'site-nav__link site-nav__link--muted' : 'site-nav__link site-nav__link--muted'

    if (authenticated) {
      return (
        <>
          <Link
            to="/mis-reservas"
            className={`${linkClass}${location.pathname.startsWith('/mis-reservas') ? ' site-nav__link--active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Mis reservas
          </Link>
          {showMyPackages ? (
            <Link
              to="/mis-paquetes"
              className={`${linkClass}${location.pathname.startsWith('/mis-paquetes') ? ' site-nav__link--active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Mis paquetes
            </Link>
          ) : null}
          {!mobile ? (
            <span className="site-nav__user" title={currentUser?.email || ''}>
              <span className="site-nav__user-initials" aria-hidden>
                {userInitials}
              </span>
              <span className="site-nav__user-name">{currentUser?.firstName || 'Usuario'}</span>
            </span>
          ) : null}
          <button type="button" className={linkClass} onClick={handleLogout}>
            Salir
          </button>
        </>
      )
    }

    return (
      <>
        <Link
          to={`/login${location.search}`}
          className={`${linkClass}${location.pathname === '/login' ? ' site-nav__link--active' : ''}`}
          onClick={() => setIsMenuOpen(false)}
        >
          Iniciar sesión
        </Link>
        <Link
          to={`/signup${location.search}`}
          className={linkClass}
          onClick={() => setIsMenuOpen(false)}
        >
          Crear cuenta
        </Link>
      </>
    )
  }

  return (
    <nav className={`site-nav${isMenuOpen ? ' site-nav--open' : ''}`} aria-label="Principal">
      <div className="site-nav__inner">
        <Link to="/" className="site-nav__logo" onClick={() => setIsMenuOpen(false)}>
          <Logo height="44px" variant="primary" style={{ maxWidth: '200px' }} />
        </Link>

        <div className="site-nav__desktop">
          <div className="site-nav__links">
            {MENU_ITEMS.map((item) => {
              const href = itemHref(item)
              const active = isItemActive(item)
              if (isHome) {
                return (
                  <a
                    key={item.id}
                    href={href}
                    className={`site-nav__link${active ? ' site-nav__link--active' : ''}`}
                  >
                    {item.label}
                  </a>
                )
              }
              return (
                <Link
                  key={item.id}
                  to={href}
                  className={`site-nav__link${active ? ' site-nav__link--active' : ''}`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          <Link to="/classes" className="site-nav__cta">
            Reservar clase
          </Link>

          <div className="site-nav__account">{renderAccountLinks(false)}</div>
        </div>

        <button
          type="button"
          className="site-nav__toggle"
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className="site-nav__mobile">
        <div className="site-nav__mobile-links">
          {MENU_ITEMS.map((item) => {
            const href = itemHref(item)
            const active = isItemActive(item)
            if (isHome) {
              return (
                <a
                  key={item.id}
                  href={href}
                  className={`site-nav__link${active ? ' site-nav__link--active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              )
            }
            return (
              <Link
                key={item.id}
                to={href}
                className={`site-nav__link${active ? ' site-nav__link--active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
        <Link to="/classes" className="site-nav__cta" onClick={() => setIsMenuOpen(false)}>
          Reservar clase
        </Link>
        <div className="site-nav__mobile-account">{renderAccountLinks(true)}</div>
      </div>
    </nav>
  )
}

export default Navbar
