import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login, setPassword } from '../services/authService'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [needsPassword, setNeedsPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userNeedingPassword, setUserNeedingPassword] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await login(formData.email, formData.password)
      
      if (result.needsPassword) {
        // Usuario necesita establecer contraseña
        setNeedsPassword(true)
        setUserNeedingPassword(result.user)
        setError('')
      } else if (result.success) {
        // Redirigir según la ruta previa o a home
        const from = new URLSearchParams(window.location.search).get('from') || '/'
        navigate(from)
      } else {
        setError(result.error || 'Error al iniciar sesión')
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (!newPassword || newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setIsLoading(true)

    try {
      const result = await setPassword(userNeedingPassword.email, newPassword)
      if (result.success) {
        // Redirigir según la ruta previa o a home
        const from = new URLSearchParams(window.location.search).get('from') || '/'
        navigate(from)
      } else {
        setError(result.error || 'Error al establecer contraseña')
      }
    } catch (err) {
      setError(err.message || 'Error al establecer contraseña. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="wellness-background min-h-screen flex items-center justify-center py-20">
      <div className="wellness-shapes">
        <div className="wellness-shape shape-1"></div>
        <div className="wellness-shape shape-2"></div>
        <div className="wellness-shape shape-3"></div>
      </div>
      
      <div className="wellness-content relative z-10 w-full max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg p-8 shadow-xl border-2"
             style={{ borderColor: '#E5B3B0' }}>
          <h1 className="text-3xl font-heading font-bold mb-2 text-center" style={{ color: '#1F2937' }}>
            Iniciar Sesión
          </h1>
          <p className="text-body font-body text-center mb-8" style={{ color: '#6B7280' }}>
            Ingresa a tu cuenta para continuar
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-body text-red-800">{error}</p>
            </div>
          )}

          {needsPassword ? (
            <div>
              <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm font-body text-blue-800 mb-2">
                  ¡Bienvenido! Tu cuenta fue creada automáticamente cuando compraste un paquete.
                </p>
                <p className="text-sm font-body text-blue-800">
                  Por favor establece una contraseña para continuar.
                </p>
              </div>

              <form onSubmit={handleSetPassword} className="space-y-6">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-body font-medium mb-2" style={{ color: '#1F2937' }}>
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-body transition-all duration-300"
                    style={{ 
                      borderColor: '#DED5D5',
                      backgroundColor: '#FFFFFF'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#B73D37'}
                    onBlur={(e) => e.target.style.borderColor = '#DED5D5'}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-body font-medium mb-2" style={{ color: '#1F2937' }}>
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-body transition-all duration-300"
                    style={{ 
                      borderColor: '#DED5D5',
                      backgroundColor: '#FFFFFF'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#B73D37'}
                    onBlur={(e) => e.target.style.borderColor = '#DED5D5'}
                    placeholder="Repite tu contraseña"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-lg font-heading font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: '#B73D37', 
                    color: '#FFFFFF',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(183, 61, 55, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.target.style.backgroundColor = '#C76661'
                      e.target.style.boxShadow = '0 6px 16px rgba(183, 61, 55, 0.4)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.target.style.backgroundColor = '#B73D37'
                      e.target.style.boxShadow = '0 4px 12px rgba(183, 61, 55, 0.3)'
                    }
                  }}
                >
                  {isLoading ? 'Estableciendo contraseña...' : 'Establecer Contraseña'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNeedsPassword(false)
                    setNewPassword('')
                    setConfirmPassword('')
                    setUserNeedingPassword(null)
                    setError('')
                  }}
                  className="w-full py-2 text-sm font-body text-center hover:underline"
                  style={{ color: '#B73D37' }}
                >
                  Volver al inicio de sesión
                </button>
              </form>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-body font-medium mb-2" style={{ color: '#1F2937' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-body transition-all duration-300"
                style={{ 
                  borderColor: '#DED5D5',
                  backgroundColor: '#FFFFFF'
                }}
                onFocus={(e) => e.target.style.borderColor = '#B73D37'}
                onBlur={(e) => e.target.style.borderColor = '#DED5D5'}
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-body font-medium" style={{ color: '#1F2937' }}>
                  Contraseña
                </label>
                <Link
                  to={`/forgot-password${window.location.search ? `?${window.location.search}` : ''}`}
                  className="text-sm font-body hover:underline"
                  style={{ color: '#B73D37' }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-body transition-all duration-300"
                style={{ 
                  borderColor: '#DED5D5',
                  backgroundColor: '#FFFFFF'
                }}
                onFocus={(e) => e.target.style.borderColor = '#B73D37'}
                onBlur={(e) => e.target.style.borderColor = '#DED5D5'}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-lg font-heading font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#B73D37', 
                color: '#FFFFFF',
                border: 'none',
                boxShadow: '0 4px 12px rgba(183, 61, 55, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = '#C76661'
                  e.target.style.boxShadow = '0 6px 16px rgba(183, 61, 55, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = '#B73D37'
                  e.target.style.boxShadow = '0 4px 12px rgba(183, 61, 55, 0.3)'
                }
              }}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
          )}
          <div className="mt-6 text-center">
            <p className="text-sm font-body" style={{ color: '#6B7280' }}>
              ¿No tienes una cuenta?{' '}
              <Link 
                to={`/signup${window.location.search}`}
                className="font-semibold hover:underline"
                style={{ color: '#B73D37' }}
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
