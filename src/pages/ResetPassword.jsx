import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { resetPassword } from '../services/authService'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) setError('Falta el enlace de restablecimiento. Solicita uno nuevo desde "Olvidé mi contraseña".')
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    setIsLoading(true)
    try {
      const result = await resetPassword(token, password)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => navigate('/login'), 2500)
      } else {
        setError(result.error || 'Error al restablecer contraseña')
      }
    } catch (err) {
      setError(err.message || 'Error. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="wellness-background min-h-screen flex items-center justify-center py-20">
        <div className="wellness-shapes">
          <div className="wellness-shape shape-1"></div>
          <div className="wellness-shape shape-2"></div>
          <div className="wellness-shape shape-3"></div>
        </div>
        <div className="wellness-content relative z-10 w-full max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg p-8 shadow-xl border-2" style={{ borderColor: '#E5B3B0' }}>
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-body text-red-800">{error}</p>
            </div>
            <Link to="/forgot-password" className="text-center block font-body hover:underline" style={{ color: '#B73D37' }}>
              Solicitar nuevo enlace
            </Link>
            <Link to="/login" className="mt-4 text-center block text-sm font-body hover:underline" style={{ color: '#6B7280' }}>
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="wellness-background min-h-screen flex items-center justify-center py-20">
      <div className="wellness-shapes">
        <div className="wellness-shape shape-1"></div>
        <div className="wellness-shape shape-2"></div>
        <div className="wellness-shape shape-3"></div>
      </div>

      <div className="wellness-content relative z-10 w-full max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg p-8 shadow-xl border-2" style={{ borderColor: '#E5B3B0' }}>
          <h1 className="text-3xl font-heading font-bold mb-2 text-center" style={{ color: '#1F2937' }}>
            Nueva contraseña
          </h1>
          <p className="text-body font-body text-center mb-8" style={{ color: '#6B7280' }}>
            Elige una contraseña de al menos 6 caracteres
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-body text-red-800">{error}</p>
            </div>
          )}

          {success ? (
            <div className="mb-6 p-6 rounded-lg border-2" style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
              <p className="text-sm font-body text-gray-800">Contraseña actualizada. Redirigiendo al inicio de sesión...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-body font-medium mb-2" style={{ color: '#1F2937' }}>
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-body transition-all duration-300"
                  style={{ borderColor: '#DED5D5', backgroundColor: '#FFFFFF' }}
                  onFocus={(e) => (e.target.style.borderColor = '#B73D37')}
                  onBlur={(e) => (e.target.style.borderColor = '#DED5D5')}
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-body transition-all duration-300"
                  style={{ borderColor: '#DED5D5', backgroundColor: '#FFFFFF' }}
                  onFocus={(e) => (e.target.style.borderColor = '#B73D37')}
                  onBlur={(e) => (e.target.style.borderColor = '#DED5D5')}
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
                {isLoading ? 'Guardando...' : 'Restablecer contraseña'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-body hover:underline" style={{ color: '#B73D37' }}>
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
