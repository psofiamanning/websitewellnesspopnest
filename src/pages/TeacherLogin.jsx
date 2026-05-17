import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import { BACKEND_URL } from '../config/api.js'

function TeacherLogin() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
      const response = await fetch(`${BACKEND_URL}/api/auth/teacher/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        setError('El servidor devolvió una respuesta inválida. Verifica que el backend esté corriendo.')
        setIsLoading(false)
        return
      }

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión')
        setIsLoading(false)
        return
      }

      if (data.token) {
        localStorage.setItem('teacher_token', data.token)
        if (data.teacher?.name) localStorage.setItem('teacher_name', data.teacher.name)
        if (data.teacher?.teacherId != null) localStorage.setItem('teacher_id', String(data.teacher.teacherId))
      }
      navigate('/coaches/panel', { replace: true })
    } catch (err) {
      console.error('Error en login de coach:', err)
      setError(err.message || 'Error al iniciar sesión. Intenta de nuevo.')
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
            Acceso para coaches
          </h1>
          <p className="text-body font-body text-center mb-8" style={{ color: '#6B7280' }}>
            Ingresa tus credenciales para ver las reservas de tus próximas clases
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-body text-red-800">{error}</p>
            </div>
          )}

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
                style={{ borderColor: '#DED5D5', backgroundColor: '#FFFFFF' }}
                onFocus={(e) => (e.target.style.borderColor = '#B73D37')}
                onBlur={(e) => (e.target.style.borderColor = '#DED5D5')}
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
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-body transition-all duration-300"
                style={{ borderColor: '#DED5D5', backgroundColor: '#FFFFFF' }}
                onFocus={(e) => (e.target.style.borderColor = '#B73D37')}
                onBlur={(e) => (e.target.style.borderColor = '#DED5D5')}
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
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm font-body hover:underline" style={{ color: '#B73D37' }}>
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherLogin
