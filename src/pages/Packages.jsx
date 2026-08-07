import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { SINGLE_CLASS_PRICE_MXN } from '../config/pricing'
import { PACKAGE_OFFERS } from '../data/packageOffers'
import { shouldShowProposalPlans } from '../config/proposalPlans'
import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/components.css'
import '../styles/packagesShell.css'

const WA_URL =
  'https://wa.me/525554379644?text=' +
  encodeURIComponent('Hola, tengo dudas sobre los paquetes de clases en Estudio Popnest.')

const FAQ_ITEMS = [
  {
    q: '¿Cómo compro un paquete?',
    a: 'Elige tu plan, inicia sesión o crea cuenta, y completa el pago en línea de forma segura. Recibirás confirmación por correo.',
  },
  {
    q: '¿Puedo usar el paquete en cualquier clase?',
    a: 'Sí. Los paquetes aplican para todas las prácticas del horario regular: yoga, pilates, meditación, sound healing y tai chi.',
  },
  {
    q: '¿Cuánto tiempo tengo para usar mis clases?',
    a: 'Los paquetes de 10 y 20 clases tienen vigencia de 2 meses desde la compra. La clase suelta se usa en la reserva que elijas.',
  },
  {
    q: '¿Qué pasa si no puedo asistir?',
    a: 'Puedes cancelar o cambiar tu reserva desde Mis reservas con al menos 4 horas de anticipación, según nuestra política.',
  },
  {
    q: '¿El paquete de 20 incluye algo extra?',
    a: 'Sí. Las primeras 2 reservas no descuentan de tu saldo de clases; después consumes del paquete hasta completar 20 reservas.',
  },
  {
    q: '¿Métodos de pago?',
    a: 'Aceptamos tarjeta de crédito y débito en línea a través de nuestra plataforma de pago segura.',
  },
]

function formatMxn(n) {
  return `$${n.toLocaleString('es-MX')}`
}

function Packages() {
  const navigate = useNavigate()

  const tenPack = PACKAGE_OFFERS.find((p) => p.id === 'package-10-classes')
  const twentyPack = PACKAGE_OFFERS.find((p) => p.id === 'package-20-classes')

  // Clic en una tarjeta → página de detalle pública (el login se pide al comprar).
  function handlePurchase(packageId) {
    navigate(`/booking/package/${packageId}`)
  }

  const plans = useMemo(() => {
    if (!tenPack || !twentyPack) return []
    const perTen = Math.round(tenPack.price / tenPack.classes)
    const perTwenty = Math.round(twentyPack.price / twentyPack.classes)
    const base = [
      {
        id: 'single',
        purchaseId: null,
        title: 'Clase suelta',
        classes: 1,
        price: SINGLE_CLASS_PRICE_MXN,
        perClass: SINGLE_CLASS_PRICE_MXN,
        savings: 0,
        vigenciaShort: 'Por reserva',
        featured: false,
        cta: 'Reservar',
      },
      {
        id: tenPack.id,
        purchaseId: tenPack.id,
        title: 'Paquete de 10',
        classes: tenPack.classes,
        price: tenPack.price,
        perClass: perTen,
        savings: tenPack.originalPrice ? tenPack.originalPrice - tenPack.price : 0,
        vigenciaShort: 'Vigencia 2 meses',
        featured: true,
        cta: 'Ver detalle',
      },
      {
        id: twentyPack.id,
        purchaseId: twentyPack.id,
        title: 'Paquete de 20',
        classes: twentyPack.classes,
        price: twentyPack.price,
        perClass: perTwenty,
        savings: twentyPack.originalPrice ? twentyPack.originalPrice - twentyPack.price : 0,
        vigenciaShort: 'Vigencia 2 meses',
        featured: false,
        cta: 'Ver detalle',
      },
    ]

    // Planes en propuesta (revisión interna): se agregan solo si el modo preview
    // está activo o si ya se hicieron públicos. El público normal no los ve.
    if (shouldShowProposalPlans()) {
      const proposals = PACKAGE_OFFERS.filter((p) => p.isProposal).map((p) => ({
        id: p.id,
        purchaseId: p.id,
        title: p.name,
        classes: p.classes,
        unlimited: p.unlimited || false,
        price: p.price,
        perClass: p.classes ? Math.round(p.price / p.classes) : 0,
        savings: p.originalPrice ? p.originalPrice - p.price : 0,
        vigenciaShort: `Vigencia ${p.validityDays || 30} días`,
        featured: false,
        isNew: true,
        cta: 'Ver detalle',
      }))
      base.push(...proposals)
    }
    return base
  }, [tenPack, twentyPack])

  const comparisonRows = useMemo(() => {
    if (!tenPack || !twentyPack) return []
    const perTen = Math.round(tenPack.price / tenPack.classes)
    const perTwenty = Math.round(twentyPack.price / twentyPack.classes)
    return [
      {
        label: 'Precio total',
        single: `${formatMxn(SINGLE_CLASS_PRICE_MXN)} MXN`,
        ten: `${formatMxn(tenPack.price)} MXN`,
        twenty: `${formatMxn(twentyPack.price)} MXN`,
      },
      {
        label: 'Precio por clase',
        single: formatMxn(SINGLE_CLASS_PRICE_MXN),
        ten: formatMxn(perTen),
        twenty: formatMxn(perTwenty),
      },
      {
        label: 'Clases incluidas',
        single: '1',
        ten: String(tenPack.classes),
        twenty: String(twentyPack.classes),
      },
      {
        label: 'Vigencia',
        single: 'Por reserva',
        ten: '2 meses',
        twenty: '2 meses',
      },
      {
        label: 'Todas las prácticas',
        single: 'yes',
        ten: 'yes',
        twenty: 'yes',
      },
      {
        label: '2 reservas sin consumo',
        single: 'no',
        ten: 'no',
        twenty: 'Sí',
      },
      {
        label: 'Ahorro vs clases sueltas',
        single: '—',
        ten: tenPack.originalPrice
          ? formatMxn(tenPack.originalPrice - tenPack.price)
          : formatMxn(250),
        twenty: twentyPack.originalPrice
          ? formatMxn(twentyPack.originalPrice - twentyPack.price)
          : formatMxn(500),
      },
    ]
  }, [tenPack, twentyPack])

  function onPlanClick(plan) {
    if (!plan.purchaseId) {
      navigate('/classes')
      return
    }
    handlePurchase(plan.purchaseId)
  }

  function renderCompareCell(value) {
    if (value === 'yes') return <span className="pkg-compare__yes">✓</span>
    if (value === 'no') return <span className="pkg-compare__no">—</span>
    return value
  }

  return (
    <div className="pkg-page pkg-page--with-site-nav">
      <div className="pkg-shell pkg-shell--direct">
        <section className="pkg-section pkg-section--first" aria-labelledby="pkg-pricing-heading">
          <div className="pkg-section__head">
            <div className="pn-eyebrow" style={{ marginBottom: 14 }}>
              Tarifas
            </div>
            <h2 id="pkg-pricing-heading" className="pn-h1">
              Elige tu <span className="pn-serif" style={{ color: 'var(--pn-color-primary)' }}>paquete.</span>
            </h2>
            <p className="pkg-section__sub">Toca un plan para ver el detalle completo.</p>
          </div>
          <div className="pkg-grid">
            {plans.map((plan) => (
              <button
                type="button"
                key={plan.id}
                className={`pkg-tile${plan.featured ? ' pkg-tile--featured' : ''}${plan.isNew ? ' pkg-tile--new' : ''}`}
                onClick={() => onPlanClick(plan)}
              >
                {plan.isNew ? (
                  <span className="pkg-tile__flag pkg-tile__flag--new">Nuevo</span>
                ) : plan.featured ? (
                  <span className="pkg-tile__flag">Popular</span>
                ) : null}
                <span className="pkg-tile__name">{plan.title}</span>
                <span className="pkg-tile__num">{plan.unlimited ? '∞' : plan.classes}</span>
                <span className="pkg-tile__unit">
                  {plan.unlimited ? 'ilimitadas' : plan.classes === 1 ? 'clase' : 'clases'}
                </span>
                <span className="pkg-tile__price">
                  {formatMxn(plan.price)} <em>MXN</em>
                </span>
                {plan.unlimited ? (
                  <span className="pkg-tile__perclass">Todas las disciplinas</span>
                ) : plan.savings > 0 ? (
                  <span className="pkg-tile__save">Ahorra {formatMxn(plan.savings)}</span>
                ) : (
                  <span className="pkg-tile__perclass">{formatMxn(plan.perClass)} / clase</span>
                )}
                <span className="pkg-tile__meta">{plan.vigenciaShort}</span>
                <span className="pkg-tile__cta">{plan.cta} →</span>
              </button>
            ))}
          </div>
        </section>

        <section className="pkg-section" aria-labelledby="pkg-compare-heading">
          <div className="pkg-section__head">
            <div className="pn-eyebrow" style={{ marginBottom: 14 }}>
              Comparar
            </div>
            <h2 id="pkg-compare-heading" className="pn-h2">
              Mira las <span className="pn-serif" style={{ color: 'var(--pn-color-primary)' }}>diferencias.</span>
            </h2>
          </div>
          <div className="pkg-compare-wrap">
            <table className="pkg-compare">
              <thead>
                <tr>
                  <th scope="col" />
                  <th scope="col">Clase suelta</th>
                  <th scope="col">Paquete de diez</th>
                  <th scope="col">Paquete de veinte</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td>{renderCompareCell(row.single)}</td>
                    <td>{renderCompareCell(row.ten)}</td>
                    <td>{renderCompareCell(row.twenty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="pkg-section" aria-labelledby="pkg-faq-heading">
          <div className="pkg-section__head">
            <div className="pn-eyebrow" style={{ marginBottom: 14 }}>
              Dudas
            </div>
            <h2 id="pkg-faq-heading" className="pn-h2">
              Lo que <span className="pn-serif" style={{ color: 'var(--pn-color-primary)' }}>preguntan.</span>
            </h2>
            <a href="#pkg-cta" className="pkg-faq__link">
              ¿Aún tienes dudas? Escríbenos →
            </a>
          </div>
          <div className="pkg-faq-grid">
            {FAQ_ITEMS.map((item) => (
              <div key={item.q} className="pkg-faq-item">
                <p className="pkg-faq-item__q">
                  <span className="pkg-faq-item__line" aria-hidden />
                  {item.q}
                </p>
                <p className="pkg-faq-item__a">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pkg-cta" className="pkg-cta">
          <h2 className="pkg-cta__title">
            ¿Aún tienes <em>dudas?</em>
          </h2>
          <div className="pkg-cta__actions">
            <a href={WA_URL} className="pn-btn pn-btn--primary" target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <a href="mailto:info@estudiopopnest.com" className="pn-btn pn-btn--ghost-light">
              Escríbenos
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Packages
