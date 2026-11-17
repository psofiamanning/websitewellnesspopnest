import { useEffect, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import {
  useFituneLive,
  FITUNE_URLS,
  fituneScheduleUrl,
  fitunePackageUrl
} from '../config/fitune'

/** A dónde mandar en Fitune cada ruta vieja de reservas/cuentas. */
function useFituneTarget(kind) {
  const { id } = useParams()
  const { search } = useLocation()
  return useMemo(() => {
    if (kind === 'class') {
      const date = new URLSearchParams(search).get('date')
      return fituneScheduleUrl(/^\d{4}-\d{2}-\d{2}$/.test(date || '') ? date : null)
    }
    if (kind === 'package') return fitunePackageUrl(id)
    return FITUNE_URLS.account
  }, [kind, id, search])
}

/**
 * Envuelve las rutas de reserva, compra y cuenta de clientes. Antes del corte muestra la
 * página de siempre; después redirige a Fitune (los enlaces viejos de correos y Google siguen sirviendo).
 */
function FituneRedirect({ kind = 'account', children }) {
  const live = useFituneLive()
  const target = useFituneTarget(kind)

  useEffect(() => {
    if (live) window.location.replace(target)
  }, [live, target])

  if (!live) return children

  return (
    <div className="route-loading" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: '120px 24px' }}>
      <p className="pn-text" style={{ textAlign: 'center', maxWidth: 420 }}>
        Ahora reservas, compras y tu cuenta están en Fitune. Te estamos llevando…{' '}
        <a href={target} className="underline">
          Abrir Fitune
        </a>
      </p>
    </div>
  )
}

export default FituneRedirect
