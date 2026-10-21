import { useState } from 'react'
import heroPhoto from '../assets/studio-hero-mirrors.jpg'
import wallPhoto from '../assets/studio-photo-1.png'
import windowPhoto from '../assets/studio-photo-4.png'
import classPhoto from '../assets/studio-photo.png'
import widePhoto from '../assets/studio-photo-2.jpg'
import entrancePhoto from '../assets/studio-photo-3.png'
import {
  SALON_SLOTS,
  SALON_PRICE_TIERS,
  SALON_EXTRAS,
  SALON_MAX_CAPACITY,
  SALON_MIN_HOURS,
} from '../config/salonPricing'

const RED = 'var(--pn-color-primary)'
const DARK = 'var(--pn-color-text)'
const GRAY = 'var(--pn-color-text-muted)'
const SUBTLE = 'var(--pn-color-text-subtle)'
const BORDER = 'var(--pn-color-border-soft)'
const AMBER = '#9A5B13'

const WHATSAPP_URL = 'https://wa.me/525554379644'

const SLOT_DAYS_LABEL = {
  valle: 'Lunes a viernes',
  tarde: 'Lunes a viernes',
  fin_semana_dia: 'Sábado y domingo',
  noche: 'Todos los días',
}

const USE_CASES = ['Clases privadas', 'Talleres', 'Sesiones de fotos y video', 'Ensayos', 'Celebraciones', 'Juntas y offsites']

function formatMoney(n) {
  return `$${Number(n || 0).toLocaleString('es-MX')} MXN`
}

function formatShortMoney(n) {
  return `$${Number(n || 0).toLocaleString('es-MX')}`
}

const minPrice = Math.min(...SALON_PRICE_TIERS.flatMap((t) => Object.values(t.prices)))

const cardClass = 'rounded-3xl bg-white ring-1 ring-black/[0.06] shadow-[0_1px_2px_rgba(45,46,53,0.04),0_8px_24px_-12px_rgba(45,46,53,0.12)]'

function RentaSalon() {
  return (
    <div className="pn-page-with-site-nav min-h-screen" style={{ background: 'var(--pn-color-bg-base)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-20">
        <Hero />
        <Gallery />
        <PricingSection />
        <StudioPhotos />
        <FinePrint />
      </div>
    </div>
  )
}

function Hero() {
  return (
    <header className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-center">
      <div>
        <p className="text-xs font-body font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: RED }}>
          Espacios · Popnest Coyoacán
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold leading-[1.05]" style={{ color: DARK }}>
          Un salón cálido y luminoso para lo que quieras crear.
        </h1>
        <p className="mt-5 max-w-xl text-base md:text-lg font-body leading-relaxed" style={{ color: 'var(--pn-color-text-soft)' }}>
          Renta nuestro salón por hora para tu clase privada, taller, sesión de fotos o celebración.
        </p>

        <dl className="mt-8 grid grid-cols-3 max-w-md rounded-2xl overflow-hidden ring-1 ring-black/[0.06] bg-white">
          <Fact label="Desde" value={`${formatShortMoney(minPrice)}/hr`} />
          <Fact label="Hasta" value={`${SALON_MAX_CAPACITY} personas`} border />
          <Fact label="Mínimo" value={`${SALON_MIN_HOURS} hora`} border />
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-body font-semibold text-white transition-colors hover:bg-[#9d342e]"
            style={{ backgroundColor: RED }}
          >
            Reservar por WhatsApp
          </a>
          <a
            href="#precios"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-body font-semibold ring-1 transition-colors hover:bg-white"
            style={{ color: DARK, '--tw-ring-color': 'var(--pn-color-border)' }}
          >
            Ver precios
          </a>
        </div>
      </div>

      <div className="relative">
        <img
          src={heroPhoto}
          alt="Salón de Estudio Popnest con espejos de pared completa y luz cálida"
          className="w-full aspect-[4/3] object-cover rounded-[2rem] shadow-[0_24px_48px_-24px_rgba(45,46,53,0.45)]"
          fetchpriority="high"
        />
      </div>
    </header>
  )
}

function Fact({ label, value, border }) {
  return (
    <div className="px-4 py-3.5" style={border ? { borderLeft: `1px solid ${BORDER}` } : undefined}>
      <dt className="text-[11px] font-body font-semibold uppercase tracking-wider" style={{ color: SUBTLE }}>
        {label}
      </dt>
      <dd className="mt-0.5 text-sm sm:text-base font-body font-bold whitespace-nowrap" style={{ color: DARK }}>
        {value}
      </dd>
    </div>
  )
}

function Gallery() {
  return (
    <section className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-[1fr_1fr_1.1fr] gap-4 md:gap-5 items-stretch">
      <img src={wallPhoto} alt="Muro de madera con iluminación indirecta" loading="lazy" className="w-full h-56 md:h-full object-cover rounded-3xl" />
      <img src={windowPhoto} alt="Zona del salón junto al ventanal con luz natural" loading="lazy" className="w-full h-56 md:h-full object-cover rounded-3xl" />
      <div className={`${cardClass} p-6 md:p-7`}>
        <p className="text-xs font-body font-semibold uppercase tracking-[0.18em]" style={{ color: SUBTLE }}>
          Ideal para
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {USE_CASES.map((u) => (
            <li
              key={u}
              className="rounded-full px-3 py-1.5 text-sm font-body"
              style={{ backgroundColor: 'var(--pn-color-bg-base)', color: DARK }}
            >
              {u}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm font-body leading-relaxed" style={{ color: GRAY }}>
          Espejos de pared completa, sistema de sonido, luz natural y una iluminación cálida que se siente desde que entras.
        </p>
        <p className="mt-4 text-sm font-body" style={{ color: GRAY }}>
          ¿Grupo de más de {SALON_MAX_CAPACITY}?{' '}
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 font-semibold" style={{ color: RED }}>
            Escríbenos
          </a>{' '}
          y lo cotizamos.
        </p>
      </div>
    </section>
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
        <p className="mt-3 max-w-2xl text-sm md:text-base font-body" style={{ color: GRAY }}>
          {children}
        </p>
      )}
    </div>
  )
}

function PricingSection() {
  const [tierIdx, setTierIdx] = useState(0)
  const tier = SALON_PRICE_TIERS[tierIdx]
  const slotKeys = Object.keys(SALON_SLOTS)

  return (
    <section id="precios" className="mt-16 md:mt-20 scroll-mt-28">
      <SectionHeading eyebrow="Precios" title="Precio por hora, según tu grupo">
        Elige cuántas personas vienen para ver la tarifa de cada horario. Precios en MXN.
      </SectionHeading>

      <div className="mt-6">
        <p className="text-xs font-body font-semibold uppercase tracking-wide mb-2.5" style={{ color: SUBTLE }}>
          Personas
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {SALON_PRICE_TIERS.map((t, i) => {
            const active = i === tierIdx
            return (
              <button
                key={`${t.minPeople}-${t.maxPeople}`}
                type="button"
                onClick={() => setTierIdx(i)}
                aria-pressed={active}
                className="shrink-0 rounded-full px-4 py-2 text-sm font-body font-semibold ring-1 transition-colors"
                style={{
                  backgroundColor: active ? DARK : 'white',
                  color: active ? 'var(--pn-color-on-dark)' : DARK,
                  '--tw-ring-color': active ? 'transparent' : 'var(--pn-color-border-soft)',
                }}
              >
                {t.minPeople}–{t.maxPeople}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {slotKeys.map((k) => {
          const s = SALON_SLOTS[k]
          return (
            <div key={k} className={`${cardClass} p-4 md:p-5 flex flex-col`}>
              <p className="font-heading text-lg font-bold" style={{ color: DARK }}>{s.label}</p>
              <p className="mt-0.5 text-xs font-body" style={{ color: GRAY }}>
                {SLOT_DAYS_LABEL[k]}
                <br />
                {s.startTime}–{s.endTime}
              </p>
              <p className="mt-auto pt-4 font-body" style={{ color: DARK }}>
                <span className="text-2xl md:text-3xl font-bold tabular-nums">{formatShortMoney(tier.prices[k])}</span>
                <span className="text-sm" style={{ color: GRAY }}> /hr</span>
              </p>
            </div>
          )
        })}
        <div
          className="col-span-2 lg:col-span-1 rounded-3xl p-4 md:p-5 flex flex-col ring-1"
          style={{ backgroundColor: '#FBF3E8', '--tw-ring-color': '#EBD3B4' }}
        >
          <p className="font-heading text-lg font-bold" style={{ color: AMBER }}>Sobre horario de clase</p>
          <p className="mt-0.5 text-xs font-body" style={{ color: AMBER }}>
            Cuando ya hay una clase en ese horario; lo confirmamos contigo
          </p>
          <p className="mt-auto pt-4 font-body" style={{ color: AMBER }}>
            <span className="text-2xl md:text-3xl font-bold tabular-nums">{formatShortMoney(tier.sobreHorarioClase)}</span>
            <span className="text-sm"> /hr</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm font-body" style={{ color: GRAY }}>
        <span>Extras opcionales:</span>
        <span>{SALON_EXTRAS.proyector.label} · {formatMoney(SALON_EXTRAS.proyector.amount)}</span>
        <span>{SALON_EXTRAS.montaje.label} · {formatMoney(SALON_EXTRAS.montaje.amount)}</span>
      </div>
    </section>
  )
}

function StudioPhotos() {
  return (
    <section className="mt-16 md:mt-20">
      <SectionHeading eyebrow="El espacio" title="Conoce el salón" />
      <div className="mt-6 grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-4 md:gap-5">
        <img
          src={classPhoto}
          alt="Grupo en una sesión dentro del salón de Estudio Popnest"
          loading="lazy"
          className="w-full h-80 md:h-full object-cover rounded-3xl"
        />
        <div className="grid grid-rows-2 gap-4 md:gap-5">
          <img
            src={widePhoto}
            alt="Vista amplia del salón con muro de madera, espejos y ventanal"
            loading="lazy"
            className="w-full h-56 md:h-72 object-cover rounded-3xl"
          />
          <img
            src={entrancePhoto}
            alt="Entrada al salón con paneles acústicos circulares"
            loading="lazy"
            className="w-full h-56 md:h-72 object-cover rounded-3xl"
          />
        </div>
      </div>
    </section>
  )
}

function FinePrint() {
  const items = [
    'Las horas rentadas son de puerta a puerta: incluyen tu montaje y recogida, no solo la actividad.',
    'El precio se cotiza según el número de personas contratado. Si llegan más personas de las declaradas, se cobra la diferencia al cierre.',
    'Si necesitas un horario donde ya hay una clase, aplica la tarifa "Sobre horario de clase" y se confirma directamente contigo.',
    `Capacidad máxima ${SALON_MAX_CAPACITY} personas · renta mínima ${SALON_MIN_HOURS} hora.`,
  ]
  return (
    <section className="mt-16 rounded-3xl p-6 md:p-8" style={{ backgroundColor: 'var(--pn-color-bg-secondary)' }}>
      <h2 className="font-heading text-xl font-bold" style={{ color: DARK }}>Antes de reservar</h2>
      <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
        {items.map((t) => (
          <li key={t} className="flex gap-3 text-sm font-body leading-relaxed" style={{ color: 'var(--pn-color-text-soft)' }}>
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: RED }} aria-hidden="true" />
            {t}
          </li>
        ))}
      </ul>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-body font-semibold text-white transition-colors hover:bg-[#9d342e]"
        style={{ backgroundColor: RED }}
      >
        Reservar por WhatsApp
      </a>
    </section>
  )
}

export default RentaSalon
