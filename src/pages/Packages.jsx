import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { SINGLE_CLASS_PRICE_MXN } from '../config/pricing'
import { PACKAGE_OFFERS } from '../data/packageOffers'
import { classTypes } from '../data/classes'
import { isAuthenticated } from '../services/authService'
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

  function handlePurchase(packageId) {
    if (!isAuthenticated()) {
      navigate(`/signup?from=/booking/package/${packageId}`)
      return
    }
    navigate(`/booking/package/${packageId}`)
  }

  const plans = useMemo(() => {
    if (!tenPack || !twentyPack) return []
    const perTen = Math.round(tenPack.price / tenPack.classes)
    const perTwenty = Math.round(twentyPack.price / twentyPack.classes)
    return [
      {
        id: 'single',
        purchaseId: null,
        eyebrow: 'Primera vez',
        title: 'Clase suelta',
        subtitle: 'Prueba una sesión sin compromiso',
        price: SINGLE_CLASS_PRICE_MXN,
        priceNote: 'MXN · pago por reserva',
        benefits: [
          'Una clase del horario regular',
          'Reserva en línea en minutos',
          'Ideal para conocer el estudio',
        ],
        featured: false,
        cta: 'Reservar clase',
      },
      {
        id: tenPack.id,
        purchaseId: tenPack.id,
        eyebrow: 'Más elegido',
        title: 'Paquete de diez',
        subtitle: tenPack.description,
        price: tenPack.price,
        priceNote: `MXN · ${formatMxn(perTen)} por clase · vigencia 2 meses`,
        benefits: tenPack.benefits,
        featured: true,
        cta: 'Comprar paquete',
      },
      {
        id: twentyPack.id,
        purchaseId: twentyPack.id,
        eyebrow: 'Mejor valor',
        title: 'Paquete de veinte',
        subtitle: twentyPack.description,
        price: twentyPack.price,
        priceNote: `MXN · ${formatMxn(perTwenty)} por clase · vigencia 2 meses`,
        benefits: twentyPack.benefits,
        featured: false,
        cta: 'Comprar paquete',
      },
    ]
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

  const practiceCount = classTypes.length

  return (
    <div className="pkg-page pkg-page--with-site-nav">
      <div className="pkg-shell">
        <header className="pkg-hero">
          <div>
            <p className="pkg-hero__eyebrow">
              <span className="pkg-hero__eyebrow-line" aria-hidden />
              03 · Planes
            </p>
            <h1 className="pkg-hero__title">
              Elige tu <em className="pn-serif">ritmo.</em>
            </h1>
          </div>
          <div>
            <p className="pkg-hero__copy">
              Compra una clase suelta o un paquete y reserva cuando te convenga. Todos los planes incluyen acceso al
              horario regular del estudio.
            </p>
            <p className="pkg-hero__copy">
              Grupos de hasta 8 personas, maestras presentes y reserva en línea sin complicaciones.
            </p>
          </div>
        </header>

        <section className="pkg-stats" aria-label="Resumen de planes">
          <div className="pkg-stat">
            <span className="pkg-stat__value">3</span>
            <span className="pkg-stat__label">opciones</span>
            <span className="pkg-stat__sublabel">suelta y paquetes</span>
          </div>
          <div className="pkg-stat">
            <span className="pkg-stat__value">2</span>
            <span className="pkg-stat__label">meses</span>
            <span className="pkg-stat__sublabel">de vigencia</span>
          </div>
          <div className="pkg-stat">
            <span className="pkg-stat__value">{practiceCount}</span>
            <span className="pkg-stat__label">prácticas</span>
            <span className="pkg-stat__sublabel">del horario</span>
          </div>
          <div className="pkg-stat">
            <span className="pkg-stat__value">8</span>
            <span className="pkg-stat__label">max</span>
            <span className="pkg-stat__sublabel">personas por clase</span>
          </div>
        </section>

        <section className="pkg-section" aria-labelledby="pkg-pricing-heading">
          <div className="pkg-section__head">
            <div className="pn-eyebrow" style={{ marginBottom: 14 }}>
              Tarifas
            </div>
            <h2 id="pkg-pricing-heading" className="pn-h1">
              Paquetes que se sienten <span className="pn-serif" style={{ color: 'var(--pn-color-primary)' }}>claros.</span>
            </h2>
          </div>
          <div className="pkg-pricing">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`pkg-card${plan.featured ? ' pkg-card--featured' : ''}`}
              >
                {plan.featured ? <span className="pkg-card__badge">Más popular</span> : null}
                <p className="pkg-card__eyebrow">{plan.eyebrow}</p>
                <h3 className="pkg-card__title">{plan.title}</h3>
                <p className="pkg-card__subtitle">{plan.subtitle}</p>
                <p className="pkg-card__price">{formatMxn(plan.price)}</p>
                <p className="pkg-card__price-note">{plan.priceNote}</p>
                <ul className="pkg-card__list">
                  {plan.benefits.map((b) => (
                    <li key={b}>
                      <span className="pkg-card__check" aria-hidden>
                        ✓
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`pkg-card__cta pn-btn pn-btn--block${plan.featured ? ' pn-btn--primary' : ' pn-btn--ghost'}`}
                  onClick={() => onPlanClick(plan)}
                >
                  {plan.cta}
                </button>
              </article>
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
