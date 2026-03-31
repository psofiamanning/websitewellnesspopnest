import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { POST_LOGIN_CLASSES_SESSION_KEY } from '../services/authService'

const BANNER_HEIGHT_CLASS = 'h-11'

function PostLoginClassesBanner() {
  const location = useLocation()
  const [count, setCount] = useState(null)

  const readStorage = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(POST_LOGIN_CLASSES_SESSION_KEY)
      if (raw == null || raw === '') {
        setCount(null)
        return
      }
      const n = parseInt(raw, 10)
      if (!Number.isFinite(n) || n < 1) {
        setCount(null)
        return
      }
      setCount(n)
    } catch {
      setCount(null)
    }
  }, [])

  useEffect(() => {
    readStorage()
  }, [location.pathname, readStorage])

  const dismiss = () => {
    try {
      sessionStorage.removeItem(POST_LOGIN_CLASSES_SESSION_KEY)
    } catch (_) {}
    setCount(null)
  }

  if (count == null) {
    return null
  }

  if (location.pathname === '/login') {
    return null
  }

  return (
    <>
      <div className={`${BANNER_HEIGHT_CLASS} w-full shrink-0`} aria-hidden="true" />
      <div
        role="status"
        className="fixed left-0 right-0 z-40 border-b px-4 py-2.5 shadow-sm flex items-center justify-center gap-3 flex-wrap"
        style={{
          top: 'calc(7rem + env(safe-area-inset-top, 0px))',
          backgroundColor: '#ecfdf5',
          borderColor: '#86efac',
          color: '#166534',
        }}
      >
        <p className="text-sm font-body font-medium text-center">
          Tienes {count} {count === 1 ? 'clase disponible' : 'clases disponibles'} en tu paquete activo.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-xs font-body font-semibold underline underline-offset-2 hover:opacity-80"
          style={{ color: '#15803d' }}
        >
          Cerrar
        </button>
      </div>
    </>
  )
}

export default PostLoginClassesBanner
