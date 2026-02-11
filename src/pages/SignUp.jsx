import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup, getCurrentUser } from '../services/authService'

function SignUp() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

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

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (!acceptTerms) {
      setError('Debes aceptar los Términos y Condiciones y la Política de Privacidad para registrarte')
      return
    }

    setIsLoading(true)

    try {
      const result = await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      })
      
      if (result.success) {
        // Verificar que el token se guardó correctamente
        const currentUser = getCurrentUser()
        console.log('✅ Usuario después del registro:', currentUser)
        console.log('✅ Teléfono en token después del registro:', currentUser?.phone)
        
        // Mostrar mensaje de éxito
        setShowSuccess(true)
        
        // Redirigir después de 2 segundos para que el usuario vea el mensaje
        setTimeout(() => {
          const from = new URLSearchParams(window.location.search).get('from') || '/'
          navigate(from)
        }, 2000)
      } else {
        setError(result.error || 'Error al registrarse')
      }
    } catch (err) {
      setError(err.message || 'Error al registrarse. Por favor intenta de nuevo.')
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
            Crear Cuenta
          </h1>
          <p className="text-body font-body text-center mb-8" style={{ color: '#6B7280' }}>
            Regístrate para reservar clases y paquetes
          </p>

          {showSuccess && (
            <div className="mb-6 p-6 rounded-lg border-2 animate-fade-in"
                 style={{ 
                   backgroundColor: '#f0fdf4',
                   borderColor: '#86efac',
                   boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)'
                 }}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                       style={{ backgroundColor: '#22c55e' }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-heading font-semibold mb-1" style={{ color: '#166534' }}>
                    ¡Cuenta creada exitosamente!
                  </h3>
                  <p className="text-sm font-body leading-relaxed" style={{ color: '#15803d' }}>
                    Bienvenido a Estudio Popnest Wellness. Tu cuenta ha sido creada y ya puedes reservar clases y comprar paquetes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-body text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-body font-medium mb-2" style={{ color: '#1F2937' }}>
                  Nombre
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-body transition-all duration-300"
                  style={{ 
                    borderColor: '#DED5D5',
                    backgroundColor: '#FFFFFF'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#B73D37'}
                  onBlur={(e) => e.target.style.borderColor = '#DED5D5'}
                  placeholder="Juan"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-body font-medium mb-2" style={{ color: '#1F2937' }}>
                  Apellido
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-body transition-all duration-300"
                  style={{ 
                    borderColor: '#DED5D5',
                    backgroundColor: '#FFFFFF'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#B73D37'}
                  onBlur={(e) => e.target.style.borderColor = '#DED5D5'}
                  placeholder="Pérez"
                />
              </div>
            </div>

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
              <label htmlFor="phone" className="block text-sm font-body font-medium mb-2" style={{ color: '#1F2937' }}>
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-body transition-all duration-300"
                style={{ 
                  borderColor: '#DED5D5',
                  backgroundColor: '#FFFFFF'
                }}
                onFocus={(e) => e.target.style.borderColor = '#B73D37'}
                onBlur={(e) => e.target.style.borderColor = '#DED5D5'}
                placeholder="+52 55 1234 5678"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-body font-medium mb-2" style={{ color: '#1F2937' }}>
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
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
                Confirmar contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
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

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked)
                  setError('')
                }}
                className="mt-1 h-4 w-4 rounded border-2 cursor-pointer accent-red-700"
                style={{ borderColor: '#DED5D5' }}
              />
              <label htmlFor="acceptTerms" className="text-sm font-body leading-snug cursor-pointer" style={{ color: '#4B5563' }}>
                Acepto los{' '}
                <Link to="/terminos" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:no-underline" style={{ color: '#B73D37' }}>
                  Términos y Condiciones
                </Link>
                {' '}y la{' '}
                <Link to="/privacidad" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:no-underline" style={{ color: '#B73D37' }}>
                  Política de Privacidad
                </Link>
                {' '}de Estudio Popnest Wellness.
              </label>
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
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm font-body" style={{ color: '#6B7280' }}>
              ¿Ya tienes una cuenta?{' '}
              <Link 
                to={`/login${window.location.search}`}
                className="font-semibold hover:underline"
                style={{ color: '#B73D37' }}
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
