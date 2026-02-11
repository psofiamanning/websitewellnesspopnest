import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Logo from './Logo'
import { isAuthenticated, getCurrentUser, logout } from '../services/authService'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    setAuthenticated(isAuthenticated())
    setCurrentUser(getCurrentUser())
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    setAuthenticated(false)
    setCurrentUser(null)
  }

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const menuItems = [
    { path: '/', label: 'Inicio' },
    { path: '/classes', label: 'Clases' },
    { path: '/teachers', label: 'Profesores' },
    { path: '/packages', label: 'Paquetes' },
  ]

  const handleNavigate = (path) => {
    navigate(path)
    setIsMenuOpen(false)
  }

  return (
    <nav className="navbar fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-lg shadow-sm border-b overflow-visible"
         style={{ borderColor: '#E5B3B0' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 min-h-[80px] py-2 overflow-visible">
          {/* Logo: padding para que no se corte en el menú */}
          <div 
            className="flex items-center cursor-pointer group overflow-visible"
            onClick={() => handleNavigate('/')}
            style={{ flexShrink: 0, padding: '4px 0' }}
          >
            <Logo 
              height="48px"
              width="auto"
              variant="primary"
              className="transition-all duration-300 group-hover:scale-105"
              style={{
                height: '48px',
                width: 'auto',
                maxWidth: '200px',
                objectFit: 'contain',
                display: 'block',
                verticalAlign: 'middle'
              }}
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`relative px-4 py-2 font-body transition-all duration-300 ${
                  isActive(item.path)
                    ? 'text-primary font-semibold'
                    : 'text-body hover:text-secondary'
                }`}
              >
                {item.label}
                {isActive(item.path) && (
                  <span 
                    className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300"
                    style={{ 
                      backgroundColor: '#B73D37',
                      boxShadow: '0 2px 4px rgba(183, 61, 55, 0.3)'
                    }}
                  ></span>
                )}
              </button>
            ))}
            <button
              onClick={() => handleNavigate('/classes')}
              className="px-6 py-2.5 rounded-lg font-body font-semibold transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
              style={{ 
                backgroundColor: '#B73D37', 
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(183, 61, 55, 0.25)',
                border: '1px solid rgba(183, 61, 55, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#C76661'
                e.target.style.boxShadow = '0 6px 16px rgba(183, 61, 55, 0.35)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#B73D37'
                e.target.style.boxShadow = '0 4px 12px rgba(183, 61, 55, 0.25)'
              }}
            >
              Reservar Clase
            </button>
            {authenticated ? (
              <>
                <button
                  onClick={() => handleNavigate('/mis-reservas')}
                  className={`px-4 py-2 font-body transition-all duration-300 ${
                    isActive('/mis-reservas')
                      ? 'text-primary font-semibold'
                      : 'text-body hover:text-secondary'
                  }`}
                >
                  Mis reservas
                </button>
                <div className="px-4 py-2 text-sm font-body" style={{ color: '#6B7280' }}>
                  {currentUser?.firstName}
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 font-body transition-all duration-300 text-body hover:text-secondary"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigate('/login')}
                  className={`px-4 py-2 font-body transition-all duration-300 ${
                    isActive('/login')
                      ? 'text-primary font-semibold'
                      : 'text-body hover:text-secondary'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => handleNavigate('/signup')}
                  className="px-4 py-2 font-body transition-all duration-300 text-body hover:text-secondary"
                >
                  Registrarse
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-neutral transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-body" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t mt-4" style={{ borderColor: '#E5B3B0' }}>
            <div className="flex flex-col gap-2 pt-4">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`px-4 py-3 rounded-lg text-left font-body transition-all duration-300 ${
                    isActive(item.path)
                      ? 'text-primary font-semibold'
                      : 'text-body hover:bg-quaternary'
                  }`}
                  style={isActive(item.path) ? { 
                    backgroundColor: '#E5B3B0',
                    borderLeft: '3px solid #B73D37'
                  } : {}}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => handleNavigate('/classes')}
                className="mt-2 px-6 py-3 rounded-lg font-body font-semibold text-center transition-all duration-300"
                style={{ 
                  backgroundColor: '#B73D37', 
                  color: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(183, 61, 55, 0.25)'
                }}
              >
                Reservar Clase
              </button>
              {authenticated ? (
                <>
                  <button
                    onClick={() => handleNavigate('/mis-reservas')}
                    className={`px-4 py-3 rounded-lg text-left font-body transition-all duration-300 ${
                      isActive('/mis-reservas')
                        ? 'text-primary font-semibold'
                        : 'text-body hover:bg-quaternary'
                    }`}
                    style={isActive('/mis-reservas') ? {
                      backgroundColor: '#E5B3B0',
                      borderLeft: '3px solid #B73D37'
                    } : {}}
                  >
                    Mis reservas
                  </button>
                  <div className="px-4 py-3 text-sm font-body" style={{ color: '#6B7280' }}>
                    {currentUser?.firstName}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 rounded-lg text-left font-body transition-all duration-300 text-body hover:bg-quaternary"
                  >
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleNavigate('/login')}
                    className={`px-4 py-3 rounded-lg text-left font-body transition-all duration-300 ${
                      isActive('/login')
                        ? 'text-primary font-semibold'
                        : 'text-body hover:bg-quaternary'
                    }`}
                    style={isActive('/login') ? { 
                      backgroundColor: '#E5B3B0',
                      borderLeft: '3px solid #B73D37'
                    } : {}}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => handleNavigate('/signup')}
                    className="px-4 py-3 rounded-lg text-left font-body transition-all duration-300 text-body hover:bg-quaternary"
                  >
                    Registrarse
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
