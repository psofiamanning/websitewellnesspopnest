import { Link } from 'react-router-dom'
import WhatsAppFloatingButton from '../components/WhatsAppFloatingButton'
import heroPhoto from '../assets/cowork-sala-azul.jpg'
import officePhoto from '../assets/cowork-oficina-privada.jpg'
import muralPhoto from '../assets/cowork-sala-mural.jpg'
import patioPhoto from '../assets/cowork-patio.jpg'

const RED = 'var(--pn-color-primary)'
const DARK = 'var(--pn-color-text)'
const GRAY = 'var(--pn-color-text-muted)'
const SUBTLE = 'var(--pn-color-text-subtle)'
const BORDER = 'var(--pn-color-border-soft)'

const COWORKING_URL = 'https://www.estudiopopnest.com/'
const WHATSAPP_OFFICE_URL = `https://wa.me/525554379644?text=${encodeURIComponent(
  'Hola, me interesa rentar una oficina en Estudio Popnest.'
)}`

// Precios y textos tomados de estudiopopnest.com (planes y oficinas). Si cambian allá, actualízalos aquí.
const DAY_OFFICE_RATES = [
  { title: 'Oficina por día', schedule: 'Día completo · 9:00 a 19:00 h', price: '$1,200', unit: 'por día' },
  { title: 'Oficina por medio día', schedule: 'Mañana 9:00–12:00 h · Tarde 12:00–19:00 h', price: '$600', unit: 'por medio día' },
]

const LONG_TERM_OPTIONS = [
  {
    title: 'Contrato anual',
    text: 'Tarifa mensual acordada con compromiso de 12 meses: presupuesto previsible e ideal para equipos en crecimiento.',
  },
  {
    title: 'Largo plazo (no anual)',
    text: 'Acuerdos de varios meses según disponibilidad. Lo afinamos contigo en una visita o por correo.',
  },
]

const AMENITIES = [
  'Wi‑Fi de alta velocidad',
  'Café, té y agua siempre disponibles',
  'Cocina, refrigerador y áreas comunes',
  'Pantalla para presentaciones',
  'Impresora',
  'Atención en recepción',
  'Patio y terraza arbolada',
  'Pet-friendly',
]

const OTHER_PRODUCTS = [
  {
    title: 'Pase por día',
    price: '$300',
    unit: 'por persona',
    text: 'Escritorio flexible en zona compartida, un día completo. Sin contrato.',
    href: 'https://www.estudiopopnest.com/planes',
  },
  {
    title: 'Paquete 5 días',
    price: '$1,350',
    unit: 'al mes',
    text: 'Cinco días al mes para usar cuando los necesites.',
    href: 'https://www.estudiopopnest.com/planes',
  },
  {
    title: 'Paquete 10 días',
    price: '$2,700',
    unit: 'al mes',
    text: 'Diez días al mes, distribuidos según tu calendario.',
    href: 'https://www.estudiopopnest.com/planes',
  },
  {
    title: 'Plan mensual',
    price: '$4,800',
    unit: 'al mes',
    text: 'Acceso ilimitado, mesas compartidas, locker personal y terraza.',
    href: 'https://www.estudiopopnest.com/planes',
  },
  {
    title: 'Salas de juntas',
    price: 'Desde $300',
    unit: 'por hora',
    text: 'Salas equipadas para presentaciones, de 2 a 10 personas.',
    href: 'https://www.estudiopopnest.com/salas-de-juntas',
  },
]

const cardClass = 'rounded-3xl bg-white ring-1 ring-black/[0.06] shadow-[0_1px_2px_rgba(45,46,53,0.04),0_8px_24px_-12px_rgba(45,46,53,0.12)]'
const primaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-body font-semibold text-white transition-colors hover:bg-[#9d342e]'
const secondaryBtn =
  'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-body font-semibold ring-1 transition-colors hover:bg-white'

function ExternalArrow() {
  return (
    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M7 13 13 7M8 7h5v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Coworking() {
  return (
    <div className="pn-page-with-site-nav min-h-screen" style={{ background: 'var(--pn-color-bg-base)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-20">
        <Hero />
        <OfficesSection />
        <Amenities />
        <OtherProducts />
        <Gallery />
        <FinalCta />
      </div>
      <WhatsAppFloatingButton message="Hola, me interesa el coworking de Estudio Popnest." />
    </div>
  )
}

function Hero() {
  return (
    <header className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-center">
      <div>
        <p className="text-xs font-body font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: RED }}>
          Estudio Popnest · Coworking en Coyoacán
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold leading-[1.05]" style={{ color: DARK }}>
          Tu oficina en Coyoacán, por un día o por todo el año.
        </h1>
        <p className="mt-5 max-w-xl text-base md:text-lg font-body leading-relaxed" style={{ color: 'var(--pn-color-text-soft)' }}>
          En el mismo edificio que nuestro estudio de bienestar, a pasos del Museo Frida Kahlo: oficinas privadas,
          salas de juntas y un coworking tranquilo y lleno de diseño para trabajar solo o con tu equipo.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href={COWORKING_URL} target="_blank" rel="noopener noreferrer" className={primaryBtn} style={{ backgroundColor: RED }}>
            Ir a estudiopopnest.com <ExternalArrow />
          </a>
          <a href="#oficinas" className={secondaryBtn} style={{ color: DARK, '--tw-ring-color': 'var(--pn-color-border)' }}>
            Ver oficinas
          </a>
        </div>
      </div>

      <img
        src={heroPhoto}
        alt="Sala de juntas de Estudio Popnest con mesa azul y luces circulares"
        className="w-full aspect-[4/3] object-cover rounded-[2rem] shadow-[0_24px_48px_-24px_rgba(45,46,53,0.45)]"
        fetchpriority="high"
      />
    </header>
  )
}

function SectionHeading({ eyebrow, title, children }) {
  return (
    <div>
      <p className="text-xs font-body font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: RED }}>
        {eyebrow}
      </p>
      <h2 className="text-3xl md:text-4xl font-heading font-bold" style={{ color: DARK }}>
        {title}
      </h2>
      {children && (
        <p className="mt-3 max-w-2xl text-sm md:text-base font-body leading-relaxed" style={{ color: GRAY }}>
          {children}
        </p>
      )}
    </div>
  )
}

function OfficesSection() {
  return (
    <section id="oficinas" className="mt-16 md:mt-24 scroll-mt-28">
      <SectionHeading eyebrow="Oficinas privadas" title="Una oficina cerrada, a tu medida">
        Reserva la oficina privada solo el día que la necesitas, o asegura tu espacio con un contrato de largo plazo.
      </SectionHeading>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
        {/* Por día / medio día */}
        <article className={`${cardClass} overflow-hidden flex flex-col`}>
          <img
            src={officePhoto}
            alt="Oficina privada con mesa azul para hasta 10 personas, pantalla y ventanal al patio"
            loading="lazy"
            className="w-full h-56 md:h-64 object-cover object-[center_65%]"
          />
          <div className="p-6 md:p-7 flex-1 flex flex-col">
            <p className="text-xs font-body font-semibold uppercase tracking-[0.18em]" style={{ color: SUBTLE }}>
              Sin contrato
            </p>
            <h3 className="mt-2 font-heading text-2xl font-bold" style={{ color: DARK }}>Oficina por día</h3>
            <p className="mt-2 text-sm font-body leading-relaxed" style={{ color: GRAY }}>
              Espacio cerrado con mesa para hasta 10 personas, pantalla y ventanal al patio. Ideal para concentrarte,
              entrevistas o juntas privadas.
            </p>
            <dl className="mt-5 space-y-4">
              {DAY_OFFICE_RATES.map((r) => (
                <div key={r.title} className="flex items-baseline justify-between gap-4 border-t pt-4" style={{ borderColor: BORDER }}>
                  <div>
                    <dt className="font-body font-semibold text-sm" style={{ color: DARK }}>{r.title}</dt>
                    <dd className="text-xs font-body mt-0.5" style={{ color: GRAY }}>{r.schedule}</dd>
                  </div>
                  <dd className="text-right font-body whitespace-nowrap" style={{ color: RED }}>
                    <span className="text-2xl font-bold tabular-nums">{r.price}</span>
                    <span className="block text-[11px] uppercase tracking-wide" style={{ color: GRAY }}>MXN {r.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <a
              href="https://www.estudiopopnest.com/oficinas-largo-plazo"
              target="_blank"
              rel="noopener noreferrer"
              className={`${primaryBtn} mt-6 self-start`}
              style={{ backgroundColor: RED }}
            >
              Reservar oficina <ExternalArrow />
            </a>
          </div>
        </article>

        {/* Largo plazo */}
        <article
          className="rounded-3xl p-6 md:p-8 flex flex-col"
          style={{ backgroundColor: 'var(--pn-color-bg-dark)', color: 'var(--pn-color-on-dark)' }}
        >
          <p className="text-xs font-body font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--pn-color-on-dark-soft)' }}>
            Largo plazo
          </p>
          <h3 className="mt-2 font-heading text-2xl md:text-3xl font-bold" style={{ color: 'var(--pn-color-on-dark)' }}>Oficinas con contrato</h3>
          <p className="mt-3 text-sm font-body leading-relaxed" style={{ color: 'var(--pn-color-on-dark-muted)' }}>
            Para quien necesita el mismo espacio durante meses o todo el año, con todas las comodidades de Estudio Popnest
            en la colonia Del Carmen.
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LONG_TERM_OPTIONS.map((o) => (
              <div key={o.title} className="rounded-2xl p-4" style={{ backgroundColor: 'rgba(244,237,226,0.07)' }}>
                <p className="font-body font-semibold" style={{ color: 'var(--pn-color-on-dark)' }}>{o.title}</p>
                <p className="mt-1.5 text-sm font-body leading-relaxed" style={{ color: 'var(--pn-color-on-dark-soft)' }}>{o.text}</p>
              </div>
            ))}
          </div>
          <ul className="mt-6 space-y-2 text-sm font-body" style={{ color: 'var(--pn-color-on-dark-muted)' }}>
            <li className="flex gap-3"><Dot light />Uso exclusivo de tu espacio en el horario acordado</li>
            <li className="flex gap-3"><Dot light />Áreas comunes, cafetería y ambiente profesional</li>
            <li className="flex gap-3"><Dot light />Mobiliario ajustable según inventario disponible</li>
          </ul>
          <p className="mt-6 text-xs font-body leading-relaxed" style={{ color: 'var(--pn-color-on-dark-soft)' }}>
            El precio depende de los m², la ubicación dentro del edificio y la duración del contrato. Cuéntanos qué necesitas
            y te mandamos una propuesta.
          </p>
          <div className="mt-auto pt-6 flex flex-wrap gap-3">
            <a
              href="https://www.estudiopopnest.com/oficinas-largo-plazo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-body font-semibold transition-colors hover:bg-white"
              style={{ backgroundColor: 'var(--pn-color-on-dark)', color: DARK }}
            >
              Solicitar cotización <ExternalArrow />
            </a>
            <a
              href={WHATSAPP_OFFICE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-body font-semibold ring-1 transition-colors hover:bg-white/10"
              style={{ '--tw-ring-color': 'rgba(244,237,226,0.4)' }}
            >
              Preguntar por WhatsApp
            </a>
          </div>
        </article>
      </div>
    </section>
  )
}

function Dot({ light }) {
  return (
    <span
      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
      style={{ backgroundColor: light ? 'var(--pn-color-tertiary)' : RED }}
      aria-hidden="true"
    />
  )
}

function Amenities() {
  return (
    <section className="mt-6 rounded-3xl p-6 md:p-8" style={{ backgroundColor: 'var(--pn-color-bg-secondary)' }}>
      <p className="text-xs font-body font-semibold uppercase tracking-[0.18em]" style={{ color: SUBTLE }}>
        Incluido en las oficinas
      </p>
      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3">
        {AMENITIES.map((a) => (
          <li key={a} className="flex gap-3 text-sm font-body" style={{ color: 'var(--pn-color-text-soft)' }}>
            <Dot />
            {a}
          </li>
        ))}
      </ul>
    </section>
  )
}

function OtherProducts() {
  return (
    <section className="mt-16 md:mt-24">
      <SectionHeading eyebrow="Más formas de trabajar" title="Coworking flexible y salas de juntas">
        ¿No necesitas una oficina cerrada? Elige un pase, un paquete de días o una sala por hora. Precios en MXN.
      </SectionHeading>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {OTHER_PRODUCTS.map((p) => (
          <a
            key={p.title}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${cardClass} group p-5 md:p-6 flex flex-col transition-transform hover:-translate-y-0.5`}
          >
            <p className="font-heading text-xl font-bold" style={{ color: DARK }}>{p.title}</p>
            <p className="mt-1.5 text-sm font-body leading-relaxed" style={{ color: GRAY }}>{p.text}</p>
            <p className="mt-auto pt-5 flex items-end justify-between gap-3 font-body">
              <span style={{ color: DARK }}>
                <span className="text-2xl font-bold tabular-nums">{p.price}</span>
                <span className="text-sm" style={{ color: GRAY }}> {p.unit}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: RED }}>
                Ver <ExternalArrow />
              </span>
            </p>
          </a>
        ))}
        <Link
          to="/renta-salon"
          className="rounded-3xl p-5 md:p-6 flex flex-col ring-1 transition-transform hover:-translate-y-0.5"
          style={{ backgroundColor: '#FBF3E8', '--tw-ring-color': '#EBD3B4' }}
        >
          <p className="font-heading text-xl font-bold" style={{ color: DARK }}>Eventos y salón</p>
          <p className="mt-1.5 text-sm font-body leading-relaxed" style={{ color: GRAY }}>
            Renta el salón de bienestar para talleres, clases privadas o celebraciones de hasta 20 personas.
          </p>
          <p className="mt-auto pt-5 flex items-end justify-between gap-3 font-body">
            <span style={{ color: DARK }}>
              <span className="text-2xl font-bold tabular-nums">Desde $150</span>
              <span className="text-sm" style={{ color: GRAY }}> por hora</span>
            </span>
            <span className="text-sm font-semibold" style={{ color: RED }}>Ver →</span>
          </p>
        </Link>
      </div>
    </section>
  )
}

function Gallery() {
  return (
    <section className="mt-16 md:mt-24">
      <SectionHeading eyebrow="El espacio" title="Diseño, calma y buena luz" />
      <div className="mt-6 grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4 md:gap-5">
        <img
          src={muralPhoto}
          alt="Sala de juntas con mural de colores, mesa terracota y lámpara circular"
          loading="lazy"
          className="w-full h-72 md:h-[26rem] object-cover rounded-3xl"
        />
        <img
          src={patioPhoto}
          alt="Patio interior con cactus en macetas y mesa para trabajar al aire libre"
          loading="lazy"
          className="w-full h-72 md:h-[26rem] object-cover rounded-3xl"
        />
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section
      className="mt-16 md:mt-24 rounded-[2rem] px-6 py-10 md:px-12 md:py-14 text-center"
      style={{ backgroundColor: 'var(--pn-color-bg-dark)', color: 'var(--pn-color-on-dark)' }}
    >
      <h2 className="text-3xl md:text-4xl font-heading font-bold" style={{ color: 'var(--pn-color-on-dark)' }}>Conoce todo el coworking</h2>
      <p className="mt-3 max-w-xl mx-auto text-sm md:text-base font-body leading-relaxed" style={{ color: 'var(--pn-color-on-dark-muted)' }}>
        Planes, salas, oficinas y reservas en línea en el sitio de Estudio Popnest.
      </p>
      <a
        href={COWORKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`${primaryBtn} mt-7 px-8 py-3.5`}
        style={{ backgroundColor: RED }}
      >
        Ir a estudiopopnest.com <ExternalArrow />
      </a>
      <p className="mt-8 text-xs font-body leading-relaxed" style={{ color: 'var(--pn-color-on-dark-soft)' }}>
        Londres 105, Col. Del Carmen, Coyoacán, CDMX · Lun a Vie 9am–7pm, Sáb 9am–5pm
      </p>
    </section>
  )
}

export default Coworking
