import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getCurrentUser, isAuthenticated } from '../services/authService'
import { getUserPackagesAll } from '../services/bookingService'
import '../styles/myPackagesShell.css'

function formatMxn(amount) {
  const n = Number(amount)
  if (!Number.isFinite(n)) return '—'
  return `$${n.toLocaleString('es-MX')} MXN`
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return format(new Date(iso), "d MMM yyyy", { locale: es })
  } catch {
    return '—'
  }
}

function packageStatus(pkg) {
  const remaining = Number(pkg.classesRemaining ?? 0)
  if (pkg.expiresAt && new Date(pkg.expiresAt) <= new Date()) return 'expired'
  if (remaining <= 0) return 'depleted'
  return 'active'
}

const STATUS_LABEL = {
  active: 'Activo',
  depleted: 'Agotado',
  expired: 'Vencido',
}

function PackageCard({ pkg, showReserve }) {
  const status = packageStatus(pkg)
  const total = Number(pkg.classes ?? 0)
  const used = Number(pkg.classesUsed ?? Math.max(0, total - (pkg.classesRemaining ?? 0)))
  const remaining = Number(pkg.classesRemaining ?? 0)

  return (
    <article className="mp-card">
      <div className="mp-card__top">
        <h3 className="mp-card__name">{pkg.packageName}</h3>
        <span
          className={`mp-card__badge ${
            status === 'active' ? 'mp-card__badge--active' : 'mp-card__badge--history'
          }`}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      {status === 'active' ? (
        <p className="mp-card__remaining">
          {remaining}
          <span>{remaining === 1 ? 'clase disponible' : 'clases disponibles'}</span>
        </p>
      ) : (
        <p className="mp-card__remaining" style={{ fontSize: '18px', color: 'var(--pn-color-text-soft)' }}>
          {used} de {total} clases usadas
        </p>
      )}

      <ul className="mp-card__meta">
        <li>
          <span>Compra</span>
          <span>{formatDate(pkg.purchaseDate || pkg.createdAt)}</span>
        </li>
        <li>
          <span>Vigencia hasta</span>
          <span>{formatDate(pkg.expiresAt)}</span>
        </li>
        <li>
          <span>Total del paquete</span>
          <span>{total} clases</span>
        </li>
        <li>
          <span>Usadas</span>
          <span>{used}</span>
        </li>
        {status === 'active' ? (
          <li>
            <span>Disponibles</span>
            <span>{remaining}</span>
          </li>
        ) : null}
        <li>
          <span>Pago</span>
          <span>{formatMxn(pkg.payment?.amount)}</span>
        </li>
      </ul>

      {showReserve && status === 'active' ? (
        <Link to="/classes" className="mp-card__cta">
          Reservar clase →
        </Link>
      ) : null}
    </article>
  )
}

function MyPackages() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated() || !user?.email) {
      navigate('/login?from=/mis-paquetes', { replace: true })
      return
    }

    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const result = await getUserPackagesAll(user.email)
        if (!cancelled) setData(result)
      } catch (e) {
        if (!cancelled) setError('No pudimos cargar tus paquetes. Intenta de nuevo.')
        console.error(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [navigate, user?.email])

  const active = data?.activePackages ?? []
  const history = data?.historyPackages ?? []
  const totalRemaining = data?.totalClassesRemaining ?? 0
  const totalPurchased = data?.allPackages?.length ?? 0

  return (
    <div className="mp-page mp-page--with-site-nav">
      <div className="mp-shell">
        <header className="mp-hero">
          <p className="mp-hero__eyebrow">
            <span className="mp-hero__eyebrow-line" aria-hidden />
            Mi cuenta
          </p>
          <h1 className="mp-hero__title">
            Mis <em>paquetes</em>
          </h1>
          <p className="mp-hero__lead">
            Consulta tus paquetes activos, cuántas clases te quedan y el historial de compras anteriores.
          </p>
        </header>

        {loading ? (
          <p className="mp-loading">Cargando paquetes…</p>
        ) : error ? (
          <div className="mp-empty">
            <p>{error}</p>
            <Link to="/classes" className="pn-btn pn-btn--primary">
              Ir a clases
            </Link>
          </div>
        ) : !data?.hasPurchasedPackages ? (
          <div className="mp-empty">
            <p>
              Aún no tienes paquetes comprados. Cuando compres uno, aparecerá aquí con el detalle de
              clases disponibles y vigencia.
            </p>
            <Link to="/packages" className="pn-btn pn-btn--primary">
              Ver planes
            </Link>
          </div>
        ) : (
          <>
            <div className="mp-stats">
              <div className="mp-stat">
                <span className="mp-stat__value">{totalRemaining}</span>
                <span className="mp-stat__label">
                  {totalRemaining === 1 ? 'Clase disponible' : 'Clases disponibles'}
                </span>
              </div>
              <div className="mp-stat">
                <span className="mp-stat__value">{active.length}</span>
                <span className="mp-stat__label">Paquetes activos</span>
              </div>
              <div className="mp-stat">
                <span className="mp-stat__value">{totalPurchased}</span>
                <span className="mp-stat__label">Compras totales</span>
              </div>
            </div>

            {active.length > 0 ? (
              <section className="mp-section" aria-labelledby="mp-active-heading">
                <div className="mp-section__head">
                  <h2 id="mp-active-heading" className="mp-section__title">
                    Paquetes activos
                  </h2>
                  <span className="mp-section__count">{active.length} paquete(s)</span>
                </div>
                <div className="mp-grid">
                  {active.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} showReserve />
                  ))}
                </div>
              </section>
            ) : null}

            {history.length > 0 ? (
              <section className="mp-section" aria-labelledby="mp-history-heading">
                <div className="mp-section__head">
                  <h2 id="mp-history-heading" className="mp-section__title">
                    Historial
                  </h2>
                  <span className="mp-section__count">{history.length} paquete(s)</span>
                </div>
                <div className="mp-grid">
                  {history.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} showReserve={false} />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="mp-section" style={{ paddingTop: 48 }}>
              <Link to="/mis-reservas" className="mp-card__cta">
                Ver mis reservas →
              </Link>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default MyPackages
