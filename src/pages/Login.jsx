import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login, setPassword, POST_LOGIN_CLASSES_SESSION_KEY } from '../services/authService'
import { getUserPackages } from '../services/bookingService'
import AuthEditorialLayout from '../components/auth/AuthEditorialLayout'
import AuthPasswordField from '../components/auth/AuthPasswordField'
import '../styles/authShell.css'

function LoginAside() {
  return (
    <>
      <p className="auth-aside__eyebrow">— Mi página práctica</p>
      <h2 className="auth-aside__title">
        Vuelve a tu <em>ritmo.</em>
      </h2>
      <div className="auth-card">
        <span className="auth-card__tag">Reservada</span>
        <p className="auth-card__date">Jue 21 · 09:30</p>
        <p className="auth-card__meta">pilates reformer · con blanca bear</p>
      </div>
      <ol className="auth-list">
        <li>
          <span className="auth-list__num">i</span>
          <span className="auth-list__label">Paquete de diez</span>
          <span className="auth-list__value">7 restantes</span>
        </li>
        <li>
          <span className="auth-list__num">ii</span>
          <span className="auth-list__label">Reservas activas</span>
          <span className="auth-list__value">2 próximas</span>
        </li>
        <li>
          <span className="auth-list__num">iii</span>
          <span className="auth-list__label">Coaches favoritos</span>
          <span className="auth-list__value">3 guardadas</span>
        </li>
      </ol>
      <blockquote className="auth-quote">
        Volver al cuerpo es siempre un acto de <em>presencia.</em>
        <cite>— Estudio Popnest</cite>
      </blockquote>
    </>
  )
}

function Login() {
  const navigate = useNavigate()
  const search = typeof window !== 'undefined' ? window.location.search : ''
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [needsPassword, setNeedsPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userNeedingPassword, setUserNeedingPassword] = useState(null)
  const [welcomeMessage, setWelcomeMessage] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await login(formData.email, formData.password)

      if (result.needsPassword) {
        setNeedsPassword(true)
        setUserNeedingPassword(result.user)
        setError('')
      } else if (result.success) {
        let remaining =
          typeof result.totalClassesRemaining === 'number' ? result.totalClassesRemaining : 0
        if (remaining < 1 && result.user?.email) {
          try {
            const pkg = await getUserPackages(result.user.email)
            remaining =
              typeof pkg.totalClassesRemaining === 'number' ? pkg.totalClassesRemaining : 0
          } catch (_) {}
        }
        if (remaining >= 1) {
          try {
            sessionStorage.setItem(POST_LOGIN_CLASSES_SESSION_KEY, String(remaining))
            window.dispatchEvent(
              new CustomEvent('epw-post-login-classes', { detail: { count: remaining } }),
            )
          } catch (_) {}
        }
        const firstName = result.user?.firstName || result.user?.email?.split('@')[0] || 'Usuario'
        setWelcomeMessage(firstName)
        setTimeout(() => {
          const from = new URLSearchParams(window.location.search).get('from') || '/'
          navigate(from)
        }, 2000)
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
    <AuthEditorialLayout
      eyebrow="01 Acceso"
      title={
        <>
          Bienvenida <em>de vuelta.</em>
        </>
      }
      lead="Ingresa con tu correo y contraseña. En un momento estarás en tu espacio de reservas."
      aside={<LoginAside />}
      switchPrompt="¿No tienes cuenta? Crea una en un minuto."
      switchLinkText="Crear cuenta"
      switchTo="/signup"
    >
      {welcomeMessage ? (
        <div className="auth-alert auth-alert--ok" role="status">
          <p style={{ margin: 0 }}>
            ¡Bienvenida de regreso, <strong>{welcomeMessage}</strong>! Redirigiendo…
          </p>
        </div>
      ) : (
        <>
          {error ? (
            <div className="auth-alert" role="alert">
              {error}
            </div>
          ) : null}

          {needsPassword ? (
            <>
              <div className="auth-alert auth-alert--info">
                Tu cuenta se creó al comprar un paquete. Establece una contraseña para continuar.
              </div>
              <form onSubmit={handleSetPassword}>
                <AuthPasswordField
                  id="newPassword"
                  name="newPassword"
                  label="Nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  hint="Mínimo 6 caracteres"
                />
                <AuthPasswordField
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                />
                <button type="submit" className="auth-submit" disabled={isLoading}>
                  {isLoading ? 'Guardando…' : 'Establecer contraseña →'}
                </button>
                <button
                  type="button"
                  className="auth-field__link"
                  style={{ marginTop: 16, background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => {
                    setNeedsPassword(false)
                    setNewPassword('')
                    setConfirmPassword('')
                    setUserNeedingPassword(null)
                    setError('')
                  }}
                >
                  Volver al inicio de sesión
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  placeholder="tu@email.com"
                />
              </div>

              <AuthPasswordField
                id="password"
                name="password"
                label="Contraseña"
                value={formData.password}
                onChange={handleChange}
                headExtra={
                  <Link to={`/forgot-password${search}`} className="auth-field__link">
                    ¿Olvidaste tu contraseña?
                  </Link>
                }
              />

              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading ? 'Iniciando sesión…' : 'Iniciar sesión →'}
              </button>

              <p className="auth-divider">O continúa con</p>
              <div className="auth-social">
                <button type="button" className="auth-social__btn" disabled title="Próximamente">
                  Google
                </button>
                <button type="button" className="auth-social__btn" disabled title="Próximamente">
                  Apple
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </AuthEditorialLayout>
  )
}

export default Login
