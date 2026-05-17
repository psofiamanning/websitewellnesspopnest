import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import { BACKEND_URL } from '../config/api.js'

const inputStyle = {
  borderColor: '#DED5D5',
  backgroundColor: '#FFFFFF'
}

function AdminLogin() {
  const navigate = useNavigate()

  // Admin
  const [adminForm, setAdminForm] = useState({ email: '', password: '' })
  const [adminError, setAdminError] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)

  // Coaches
  const [teacherForm, setTeacherForm] = useState({ email: '', password: '' })
  const [teacherError, setTeacherError] = useState('')
  const [teacherLoading, setTeacherLoading] = useState(false)

  const handleAdminChange = (e) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value })
    setAdminError('')
  }

  const handleTeacherChange = (e) => {
    setTeacherForm({ ...teacherForm, [e.target.name]: e.target.value })
    setTeacherError('')
  }

  const handleAdminSubmit = async (e) => {
    e.preventDefault()
    setAdminError('')
    setAdminLoading(true)
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminForm)
      })
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        setAdminError('El servidor devolvió una respuesta inválida. Verifica que el backend esté corriendo.')
        setAdminLoading(false)
        return
      }
      const data = await response.json()
      if (!response.ok) {
        setAdminError(data.error || 'Error al iniciar sesión')
        setAdminLoading(false)
        return
      }
      if (data.token) {
        localStorage.setItem('admin_token', data.token)
        try {
          const payload = JSON.parse(atob(data.token))
          if (payload.role) localStorage.setItem('admin_role', payload.role)
        } catch (_) {}
      }
      if (data.admin?.role) localStorage.setItem('admin_role', data.admin.role)
      else localStorage.setItem('admin_role', 'super_admin')
      navigate('/admin', { replace: true })
    } catch (err) {
      setAdminError(err.message || 'Error al iniciar sesión. Intenta de nuevo.')
    } finally {
      setAdminLoading(false)
    }
  }

  const handleTeacherSubmit = async (e) => {
    e.preventDefault()
    setTeacherError('')
    setTeacherLoading(true)
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/teacher/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherForm)
      })
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        setTeacherError('El servidor devolvió una respuesta inválida. Verifica que el backend esté corriendo.')
        setTeacherLoading(false)
        return
      }
      const data = await response.json()
      if (!response.ok) {
        setTeacherError(data.error || 'Error al iniciar sesión')
        setTeacherLoading(false)
        return
      }
      if (data.token) {
        localStorage.setItem('teacher_token', data.token)
        if (data.teacher?.name) localStorage.setItem('teacher_name', data.teacher.name)
        if (data.teacher?.teacherId != null) localStorage.setItem('teacher_id', String(data.teacher.teacherId))
      }
      navigate('/coaches/panel', { replace: true })
    } catch (err) {
      setTeacherError(err.message || 'Error al iniciar sesión. Intenta de nuevo.')
    } finally {
      setTeacherLoading(false)
    }
  }

  const btnBase = 'w-full py-4 rounded-lg font-heading font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
  const btnPrimary = {
    backgroundColor: '#B73D37',
    color: '#FFFFFF',
    border: 'none',
    boxShadow: '0 4px 12px rgba(183, 61, 55, 0.3)'
  }

  return (
    <div className="wellness-background min-h-screen flex items-center justify-center py-20 px-4">
      <div className="wellness-shapes">
        <div className="wellness-shape shape-1"></div>
        <div className="wellness-shape shape-2"></div>
        <div className="wellness-shape shape-3"></div>
      </div>

      <div className="wellness-content relative z-10 w-full max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6 text-center" style={{ color: '#1F2937' }}>
          Inicio de sesión
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Administradores */}
          <div
            className="bg-white rounded-lg p-6 md:p-8 shadow-xl border-2 flex flex-col"
            style={{ borderColor: '#E5B3B0' }}
          >
            <h2 className="text-xl font-heading font-bold mb-1" style={{ color: '#1F2937' }}>
              Administradores
            </h2>
            <p className="text-body font-body text-sm mb-6" style={{ color: '#6B7280' }}>
              Acceso al panel de administración
            </p>

            {adminError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm font-body text-red-800">{adminError}</p>
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="space-y-4 flex-1 flex flex-col">
              <div>
                <label htmlFor="admin-email" className="block text-sm font-body font-medium mb-1" style={{ color: '#1F2937' }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="admin-email"
                  name="email"
                  value={adminForm.email}
                  onChange={handleAdminChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-body transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#B73D37')}
                  onBlur={(e) => (e.target.style.borderColor = '#DED5D5')}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="admin-password" className="block text-sm font-body font-medium" style={{ color: '#1F2937' }}>
                    Contraseña
                  </label>
                  <Link to="/admin/forgot-password" className="text-xs font-body hover:underline" style={{ color: '#B73D37' }}>
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <input
                  type="password"
                  id="admin-password"
                  name="password"
                  value={adminForm.password}
                  onChange={handleAdminChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-body transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#B73D37')}
                  onBlur={(e) => (e.target.style.borderColor = '#DED5D5')}
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={adminLoading}
                className={`${btnBase} mt-auto`}
                style={btnPrimary}
                onMouseEnter={(e) => {
                  if (!adminLoading) {
                    e.target.style.backgroundColor = '#C76661'
                    e.target.style.boxShadow = '0 6px 16px rgba(183, 61, 55, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!adminLoading) {
                    e.target.style.backgroundColor = '#B73D37'
                    e.target.style.boxShadow = '0 4px 12px rgba(183, 61, 55, 0.3)'
                  }
                }}
              >
                {adminLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>
          </div>

          {/* Coaches */}
          <div
            className="bg-white rounded-lg p-6 md:p-8 shadow-xl border-2 flex flex-col"
            style={{ borderColor: '#E5B3B0' }}
          >
            <h2 className="text-xl font-heading font-bold mb-1" style={{ color: '#1F2937' }}>
              Coaches
            </h2>
            <p className="text-body font-body text-sm mb-6" style={{ color: '#6B7280' }}>
              Ver reservas de tus próximas clases
            </p>

            {teacherError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm font-body text-red-800">{teacherError}</p>
              </div>
            )}

            <form onSubmit={handleTeacherSubmit} className="space-y-4 flex-1 flex flex-col">
              <div>
                <label htmlFor="teacher-email" className="block text-sm font-body font-medium mb-1" style={{ color: '#1F2937' }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="teacher-email"
                  name="email"
                  value={teacherForm.email}
                  onChange={handleTeacherChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-body transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#B73D37')}
                  onBlur={(e) => (e.target.style.borderColor = '#DED5D5')}
                />
              </div>
              <div>
                <label htmlFor="teacher-password" className="block text-sm font-body font-medium mb-1" style={{ color: '#1F2937' }}>
                  Contraseña
                </label>
                <input
                  type="password"
                  id="teacher-password"
                  name="password"
                  value={teacherForm.password}
                  onChange={handleTeacherChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-body transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#B73D37')}
                  onBlur={(e) => (e.target.style.borderColor = '#DED5D5')}
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={teacherLoading}
                className={`${btnBase} mt-auto`}
                style={btnPrimary}
                onMouseEnter={(e) => {
                  if (!teacherLoading) {
                    e.target.style.backgroundColor = '#C76661'
                    e.target.style.boxShadow = '0 6px 16px rgba(183, 61, 55, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!teacherLoading) {
                    e.target.style.backgroundColor = '#B73D37'
                    e.target.style.boxShadow = '0 4px 12px rgba(183, 61, 55, 0.3)'
                  }
                }}
              >
                {teacherLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center mt-6">
          <Link to="/" className="text-sm font-body hover:underline" style={{ color: '#B73D37' }}>
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  )
}

export default AdminLogin
