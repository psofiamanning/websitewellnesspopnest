import { useState } from 'react'
import { Link } from 'react-router-dom'
import { adminForgotPassword } from '../services/authService'

function AdminForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Ingresa tu correo de administrador')
      return
    }
    setIsLoading(true)
    try {
      const result = await adminForgotPassword(email.trim())
      if (result.success) {
        setSent(true)
      } else {
        setError(result.error || 'Error al enviar')
      }
    } catch (err) {
      setError(err.message || 'Error. Intenta de nuevo.')
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
        <div className="bg-white rounded-lg p-8 shadow-xl border-2" style={{ borderColor: '#E5B3B0' }}>
          <h1 className="text-3xl font-heading font-bold mb-2 text-center" style={{ color: '#1F2937' }}>
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-body font-body text-center mb-8" style={{ color: '#6B7280' }}>
            Ingresa tu correo de administrador y te enviaremos un enlace para restablecerla
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-body text-red-800">{error}</p>
            </div>
          )}

          {sent ? (
            <div className="mb-6 p-6 rounded-lg border-2" style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
              <p className="text-sm font-body text-gray-800 mb-4">
                Si existe una cuenta de administrador con ese correo, recibirás un enlace en unos minutos. Revisa también tu carpeta de spam.
              </p>
              <Link
                to="/admin/login"
                className="block w-full py-3 rounded-lg font-heading font-semibold text-center transition-all"
                style={{ color: '#B73D37', border: '2px solid #B73D37' }}
              >
                Volver al acceso de administrador
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-body font-medium mb-2" style={{ color: '#1F2937' }}>
                  Correo de administrador
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-body transition-all duration-300"
                  style={{ borderColor: '#DED5D5', backgroundColor: '#FFFFFF' }}
                  onFocus={(e) => (e.target.style.borderColor = '#B73D37')}
                  onBlur={(e) => (e.target.style.borderColor = '#DED5D5')}
                  placeholder="info@estudiopopnest.com"
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
                {isLoading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/admin/login" className="text-sm font-body hover:underline" style={{ color: '#B73D37' }}>
              ← Volver al acceso de administrador
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminForgotPassword
