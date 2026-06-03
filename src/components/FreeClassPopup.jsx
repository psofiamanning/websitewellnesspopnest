import { useEffect, useRef, useState } from 'react'
import { saveLeadEmail } from '../services/leadService'
import '../styles/freeClassPopup.css'

const RESOLVED_KEY = 'popnest_free_class_v1' // localStorage: no volver a mostrar tras resolver
const SHOWN_KEY = 'popnest_free_class_shown' // sessionStorage: mostrar máximo una vez por sesión
const SHOW_DELAY_MS = 5000
const COUNTDOWN_START = 50

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function persistResolved(value) {
  try {
    window.localStorage.setItem(RESOLVED_KEY, value)
  } catch {
    /* almacenamiento no disponible */
  }
}

/**
 * Popup de captura de correo con cuenta regresiva de 20s.
 * Si el visitante escribe su correo antes de que el contador llegue a 0,
 * se registra el lead y obtiene una clase gratis. Al llegar a 0, la oferta se cierra.
 * Se muestra una sola vez por sesión y nunca más tras resolverse.
 */
function FreeClassPopup() {
  const [status, setStatus] = useState('hidden') // hidden | form | loading | success | expired
  const [seconds, setSeconds] = useState(COUNTDOWN_START)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  // Programar la aparición del popup
  useEffect(() => {
    if (typeof window === 'undefined') return
    let resolved = null
    let shown = null
    try {
      resolved = window.localStorage.getItem(RESOLVED_KEY)
      shown = window.sessionStorage.getItem(SHOWN_KEY)
    } catch {
      /* almacenamiento no disponible: no mostrar para evitar errores */
      return
    }
    if (resolved || shown) return

    const timer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(SHOWN_KEY, '1')
      } catch {
        /* ignore */
      }
      setSeconds(COUNTDOWN_START)
      setStatus('form')
    }, SHOW_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [])

  // Cuenta regresiva (solo mientras se muestra el formulario)
  useEffect(() => {
    if (status !== 'form') return
    const id = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          window.clearInterval(id)
          persistResolved('expired')
          setStatus('expired')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [status])

  // Enfocar el input al mostrar el formulario
  useEffect(() => {
    if (status === 'form' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [status])

  // Cerrar con Escape
  useEffect(() => {
    if (status === 'hidden') return
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const handleClose = () => {
    persistResolved('closed')
    setStatus('hidden')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const value = email.trim().toLowerCase()
    if (!EMAIL_RE.test(value)) {
      setError('Escribe un correo electrónico válido.')
      return
    }
    setError('')
    setStatus('loading')
    try {
      await saveLeadEmail(value)
      persistResolved('submitted')
      setStatus('success')
    } catch (err) {
      setError(err.message || 'No pudimos guardar tu correo. Inténtalo de nuevo.')
      setStatus('form') // reanuda la cuenta regresiva con el tiempo restante
    }
  }

  if (status === 'hidden') return null

  const urgent = seconds <= 5

  return (
    <div
      className="fcp-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fcp-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div className="fcp-card">
        <button type="button" className="fcp-close" aria-label="Cerrar" onClick={handleClose}>
          ×
        </button>

        {status === 'success' ? (
          <>
            <div className="fcp-success__icon" aria-hidden>
              ✓
            </div>
            <h2 id="fcp-title" className="fcp-title">
              ¡Tu clase <span className="pn-serif">gratis</span> está apartada!
            </h2>
            <p className="fcp-sub">
              Te escribiremos a <strong>{email.trim().toLowerCase()}</strong> con los pasos para reservar tu primera
              clase sin costo. ¡Nos vemos en el estudio!
            </p>
            <button type="button" className="fcp-btn" onClick={handleClose}>
              Entendido
            </button>
          </>
        ) : status === 'expired' ? (
          <>
            <h2 id="fcp-title" className="fcp-title">
              Se acabó el <span className="pn-serif">tiempo</span>
            </h2>
            <p className="fcp-sub">
              Esta vez la oferta relámpago expiró. Pero siempre puedes reservar tu clase en línea cuando quieras.
            </p>
            <button type="button" className="fcp-btn" onClick={handleClose}>
              Cerrar
            </button>
          </>
        ) : (
          <>
            <div className="fcp-eyebrow">Oferta relámpago</div>
            <h2 id="fcp-title" className="fcp-title">
              Tu primera clase, <span className="pn-serif">gratis</span>
            </h2>
            <p className="fcp-sub">
              Déjanos tu correo antes de que termine el tiempo y te regalamos una clase para estrenar el estudio.
            </p>

            <div className="fcp-timer" aria-hidden>
              <span className={`fcp-timer__num${urgent ? ' fcp-timer__num--urgent' : ''}`}>
                {String(seconds).padStart(2, '0')}
              </span>
              <span className="fcp-timer__label">segundos</span>
            </div>

            <form className="fcp-form" onSubmit={handleSubmit} noValidate>
              <input
                ref={inputRef}
                type="email"
                className="fcp-input"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                aria-label="Correo electrónico"
                disabled={status === 'loading'}
              />
              {error ? <p className="fcp-error">{error}</p> : null}
              <button type="submit" className="fcp-btn" disabled={status === 'loading'}>
                {status === 'loading' ? 'Enviando…' : 'Quiero mi clase gratis'}
              </button>
            </form>

            <p className="fcp-fineprint">
              Usaremos tu correo solo para enviarte tu clase de regalo y novedades del estudio. Puedes darte de baja
              cuando quieras.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default FreeClassPopup
