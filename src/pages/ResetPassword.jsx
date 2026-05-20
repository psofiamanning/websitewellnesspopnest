import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { resetPassword } from '../services/authService'
import { supabase } from '../lib/supabaseClient.js'
import AuthEditorialLayout from '../components/auth/AuthEditorialLayout'
import AuthPasswordField from '../components/auth/AuthPasswordField'
import '../styles/authShell.css'

function ResetPasswordAside() {
  return (
    <>
      <p className="auth-aside__eyebrow">— Nueva contraseña</p>
      <h2 className="auth-aside__title">
        Vuelve a tu <em>cuenta.</em>
      </h2>
      <ol className="auth-list">
        <li>
          <span className="auth-list__num">i</span>
          <span className="auth-list__label">Mínimo 6 caracteres</span>
          <span className="auth-list__value">Segura</span>
        </li>
        <li>
          <span className="auth-list__num">ii</span>
          <span className="auth-list__label">Confirma la misma</span>
          <span className="auth-list__value">2 campos</span>
        </li>
        <li>
          <span className="auth-list__num">iii</span>
          <span className="auth-list__label">Inicia sesión</span>
          <span className="auth-list__value">Listo</span>
        </li>
      </ol>
      <blockquote className="auth-quote">
        Un acceso claro te devuelve al estudio sin <em>fricción.</em>
        <cite>— Estudio Popnest</cite>
      </blockquote>
    </>
  )
}

function ResetPassword() {
  const navigate = useNavigate()
  const search = typeof window !== 'undefined' ? window.location.search : ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!supabase) {
        setError('Falta configurar Supabase en el frontend (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY).')
        setCheckingSession(false)
        return
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return
      if (!session) {
        setError(
          'Abre esta página desde el enlace de recuperación que envió Supabase por correo (debe cargarse en esta misma ventana).',
        )
        setCheckingSession(false)
        return
      }
      setSessionReady(true)
      if (session.access_token) {
        localStorage.setItem('auth_token', session.access_token)
      }
      setCheckingSession(false)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

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
      const result = await resetPassword(null, password)
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

  const layoutProps = {
    eyebrow: '03 Nueva contraseña',
    title: (
      <>
        Elige tu <em>contraseña.</em>
      </>
    ),
    lead: 'Mínimo 6 caracteres. Después podrás iniciar sesión con tu correo y esta contraseña nueva.',
    aside: <ResetPasswordAside />,
    switchPrompt: '¿Ya tienes acceso?',
    switchLinkText: 'Iniciar sesión',
    switchTo: '/login',
  }

  if (checkingSession) {
    return (
      <AuthEditorialLayout {...layoutProps} lead="Verificando tu enlace de recuperación…">
        <p className="auth-lead" style={{ marginBottom: 0 }}>
          Un momento…
        </p>
      </AuthEditorialLayout>
    )
  }

  if (error && !sessionReady) {
    return (
      <AuthEditorialLayout
        {...layoutProps}
        lead="No pudimos validar el enlace. Solicita uno nuevo o vuelve al inicio de sesión."
        switchPrompt={null}
        switchTo={null}
      >
        <div className="auth-alert" role="alert">
          {error}
        </div>
        <Link to={`/forgot-password${search}`} className="auth-submit auth-submit--link" style={{ marginTop: 12 }}>
          Solicitar nuevo enlace →
        </Link>
        <p style={{ marginTop: 20, fontSize: 'var(--pn-text-sm)' }}>
          <Link to={`/login${search}`} className="auth-field__link">
            Volver al inicio de sesión
          </Link>
        </p>
      </AuthEditorialLayout>
    )
  }

  return (
    <AuthEditorialLayout {...layoutProps}>
      {error ? (
        <div className="auth-alert" role="alert">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="auth-alert auth-alert--ok" role="status">
          <p style={{ margin: 0 }}>Contraseña actualizada. Redirigiendo al inicio de sesión…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <AuthPasswordField
            id="password"
            name="password"
            label="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            hint="Mínimo 6 caracteres"
            placeholder="Mínimo 6 caracteres"
          />
          <AuthPasswordField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            placeholder="Repite tu contraseña"
          />
          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? 'Guardando…' : 'Restablecer contraseña →'}
          </button>
        </form>
      )}
    </AuthEditorialLayout>
  )
}

export default ResetPassword
