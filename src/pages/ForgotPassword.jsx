import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../services/authService'
import AuthEditorialLayout from '../components/auth/AuthEditorialLayout'
import '../styles/authShell.css'

function ForgotPasswordAside() {
  return (
    <>
      <p className="auth-aside__eyebrow">— Recuperar acceso</p>
      <h2 className="auth-aside__title">
        Un enlace, un <em>paso.</em>
      </h2>
      <ol className="auth-list">
        <li>
          <span className="auth-list__num">i</span>
          <span className="auth-list__label">Escribe tu correo</span>
          <span className="auth-list__value">Aquí</span>
        </li>
        <li>
          <span className="auth-list__num">ii</span>
          <span className="auth-list__label">Revisa tu bandeja</span>
          <span className="auth-list__value">1–2 min</span>
        </li>
        <li>
          <span className="auth-list__num">iii</span>
          <span className="auth-list__label">Elige contraseña nueva</span>
          <span className="auth-list__value">1 hora</span>
        </li>
      </ol>
      <blockquote className="auth-quote">
        El acceso a tu práctica debe sentirse tan claro como tu <em>respiración.</em>
        <cite>— Estudio Popnest</cite>
      </blockquote>
    </>
  )
}

function ForgotPassword() {
  const search = typeof window !== 'undefined' ? window.location.search : ''
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico')
      return
    }
    setIsLoading(true)
    try {
      const result = await forgotPassword(email.trim())
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
    <AuthEditorialLayout
      eyebrow="02 Recuperar acceso"
      title={
        <>
          ¿Olvidaste tu <em>contraseña?</em>
        </>
      }
      lead="Ingresa el correo con el que te registraste. Si hay una cuenta asociada, te enviaremos un enlace para restablecerla."
      aside={<ForgotPasswordAside />}
      switchPrompt="¿Recordaste tu contraseña?"
      switchLinkText="Iniciar sesión"
      switchTo="/login"
    >
      {error ? (
        <div className="auth-alert" role="alert">
          {error}
        </div>
      ) : null}

      {sent ? (
        <>
          <div className="auth-alert auth-alert--ok" role="status">
            <p style={{ margin: 0 }}>
              Si existe una cuenta con ese correo, recibirás un enlace en unos minutos. Revisa tu
              bandeja de entrada y la carpeta de spam. El enlace es válido por 1 hora.
            </p>
          </div>
          <Link to={`/login${search}`} className="auth-submit auth-submit--link">
            Volver al inicio de sesión →
          </Link>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="tu@email.com"
            />
          </div>

          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? 'Enviando…' : 'Enviar enlace →'}
          </button>
        </form>
      )}
    </AuthEditorialLayout>
  )
}

export default ForgotPassword
