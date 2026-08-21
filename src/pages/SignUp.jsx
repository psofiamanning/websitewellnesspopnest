import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup, getCurrentUser } from '../services/authService'
import { trackMetaLead } from '../utils/metaPixel'
import AuthEditorialLayout from '../components/auth/AuthEditorialLayout'
import AuthPasswordField from '../components/auth/AuthPasswordField'
import '../styles/authShell.css'

function SignUpAside() {
  return (
    <>
      <p className="auth-aside__eyebrow">Lo que recibes</p>
      <h2 className="auth-aside__title">
        Una cuenta, <em>cinco coaches.</em>
      </h2>
      <ol className="auth-list">
        <li>
          <span className="auth-list__num">i</span>
          <span className="auth-list__label">Acceso a siete disciplinas</span>
          <span className="auth-list__value">Yoga · pilates · sound</span>
        </li>
        <li>
          <span className="auth-list__num">ii</span>
          <span className="auth-list__label">Ocho personas por clase</span>
          <span className="auth-list__value">Cupo limitado</span>
        </li>
        <li>
          <span className="auth-list__num">iii</span>
          <span className="auth-list__label">Reservas en un minuto</span>
          <span className="auth-list__value">Sin llamadas</span>
        </li>
        <li>
          <span className="auth-list__num">iv</span>
          <span className="auth-list__label">Cancelación gratuita</span>
          <span className="auth-list__value">Hasta 2h antes</span>
        </li>
      </ol>
      <blockquote className="auth-quote">
        Un espacio para el cuerpo, en una ciudad que rara vez le da tiempo.
        <cite>— Estudio Popnest · Coyoacán</cite>
      </blockquote>
    </>
  )
}

function SignUp() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const errorRef = useRef(null)

  // El aviso de error vive arriba del formulario y el botón está hasta abajo:
  // sin esto, en móvil parece que el clic "no hizo nada".
  useEffect(() => {
    // Salto directo (sin 'smooth'): algunos navegadores ignoran el scroll suave
    // y el aviso se quedaría fuera de pantalla.
    if (error) errorRef.current?.scrollIntoView({ block: 'center' })
  }, [error])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLoading) return
    setError('')

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (!acceptTerms) {
      setError('Debes aceptar los Términos y Condiciones y la Política de Privacidad')
      return
    }

    setIsLoading(true)

    try {
      const result = await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      })

      if (result.success) {
        trackMetaLead({ content_name: 'registro', value: 0, currency: 'MXN' })
        getCurrentUser()
        setShowSuccess(true)
        setTimeout(() => {
          const from = new URLSearchParams(window.location.search).get('from') || '/'
          navigate(from)
        }, 4000)
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
    <AuthEditorialLayout
      eyebrow="01 Crear cuenta"
      title={
        <>
          Empieza tu <em>práctica.</em>
        </>
      }
      lead="Guardamos tus datos para que reservar la próxima sesión sea cuestión de segundos."
      aside={<SignUpAside />}
      switchPrompt="¿Ya tienes cuenta? Ingresa con tu correo."
      switchLinkText="Iniciar sesión"
      switchTo="/login"
    >
      {showSuccess ? (
        <div className="auth-alert auth-alert--ok" role="status">
          <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Cuenta creada exitosamente</p>
          <p style={{ margin: 0 }}>
            Revisa tu correo para confirmar tus datos. En unos segundos te llevamos a continuar.
          </p>
        </div>
      ) : (
        <>
          {error ? (
            <div className="auth-alert" role="alert" ref={errorRef}>
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit}>
            <div className="auth-field-row">
              <div className="auth-field">
                <label htmlFor="firstName">Nombre</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                />
              </div>
              <div className="auth-field">
                <label htmlFor="lastName">Apellido</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>

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

            <div className="auth-field">
              <label htmlFor="phone">Teléfono</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                autoComplete="tel"
                placeholder="+52 55 1234 5678"
              />
            </div>

            <AuthPasswordField
              id="password"
              name="password"
              label="Contraseña"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              autoComplete="new-password"
              hint="Mínimo 8 caracteres"
            />

            <label className="auth-terms">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked)
                  setError('')
                }}
                required
              />
              <span>
                Acepto los{' '}
                <Link to="/terminos" target="_blank" rel="noopener noreferrer">
                  Términos y Condiciones
                </Link>{' '}
                y la{' '}
                <Link to="/privacidad" target="_blank" rel="noopener noreferrer">
                  Política de Privacidad
                </Link>
                .
              </span>
            </label>

            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? 'Creando cuenta…' : 'Crear cuenta →'}
            </button>
          </form>
        </>
      )}
    </AuthEditorialLayout>
  )
}

export default SignUp
