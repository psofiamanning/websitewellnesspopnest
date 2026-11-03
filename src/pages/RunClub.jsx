import { Link } from 'react-router-dom'
import WhatsAppFloatingButton from '../components/WhatsAppFloatingButton'
import { SITE_URL } from '../utils/seo'

const RED = 'var(--pn-color-primary)'
const DARK = 'var(--pn-color-text)'
const GRAY = 'var(--pn-color-text-muted)'
const SUBTLE = 'var(--pn-color-text-subtle)'
const BORDER = 'var(--pn-color-border-soft)'

const ADDRESS = 'Londres 105, Col. Del Carmen, Coyoacán, CDMX'
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  'Estudio Popnest Wellness, Londres 105, Del Carmen, Coyoacán'
)}`
const WHATSAPP_URL = `https://wa.me/525554379644?text=${encodeURIComponent(
  'Hola, quiero información del Run Club de Estudio Popnest.'
)}`

const SESSIONS = [
  { day: 'Miércoles', time: '6:30 a.m.', isoDay: 'Wednesday', isoTime: '06:30' },
  { day: 'Sábado', time: '7:30 a.m.', isoDay: 'Saturday', isoTime: '07:30' },
]

const STEPS = [
  { title: 'Llega al estudio', text: `Nos vemos en Estudio Popnest Wellness, ${ADDRESS}. Llega 5 minutos antes para calentar.` },
  { title: 'Corremos juntos', text: 'Salimos en grupo por las calles de Coyoacán a un ritmo en el que se puede platicar.' },
  { title: 'Estiramos al final', text: 'Regresamos al estudio para estirar y cerrar la sesión en comunidad.' },
]

const BRING = [
  'Tenis para correr y ropa cómoda',
  'Botella de agua',
  'Gorra o lentes si hay sol',
  'Ganas de conocer gente del barrio',
]

const FAQ_ITEMS = [
  {
    q: '¿El Run Club de Coyoacán tiene costo?',
    a: 'No. El Run Club de Estudio Popnest es gratuito y abierto a todas las personas.',
  },
  {
    q: '¿Necesito reservar o registrarme?',
    a: 'No hace falta reservar. Solo llega al estudio a la hora de salida: miércoles 6:30 a.m. o sábado 7:30 a.m.',
  },
  {
    q: '¿Dónde es el punto de encuentro?',
    a: `En Estudio Popnest Wellness, ${ADDRESS}, a unos pasos del Museo Frida Kahlo.`,
  },
  {
    q: '¿Necesito experiencia corriendo?',
    a: 'No. Corremos a un ritmo cómodo para platicar y el grupo se espera. Es para todos los niveles, desde quien empieza hasta quien ya corre seguido.',
  },
]

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

const EVENT_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SportsEvent',
  name: 'Run Club Coyoacán — Estudio Popnest',
  description: 'Run club gratuito en Coyoacán. Salidas en grupo desde Estudio Popnest Wellness, todos los niveles, sin reservación.',
  sport: 'Running',
  isAccessibleForFree: true,
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  eventSchedule: SESSIONS.map((s) => ({
    '@type': 'Schedule',
    repeatFrequency: 'P1W',
    byDay: `https://schema.org/${s.isoDay}`,
    startTime: s.isoTime,
    scheduleTimezone: 'America/Mexico_City',
  })),
  location: {
    '@type': 'Place',
    name: 'Estudio Popnest Wellness',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Londres 105, Del Carmen',
      addressLocality: 'Coyoacán',
      addressRegion: 'CDMX',
      addressCountry: 'MX',
    },
  },
  organizer: { '@type': 'Organization', name: 'Estudio Popnest Wellness', url: SITE_URL },
  offers: { '@type': 'Offer', price: 0, priceCurrency: 'MXN', availability: 'https://schema.org/InStock' },
}

const cardClass = 'rounded-3xl bg-white ring-1 ring-black/[0.06] shadow-[0_1px_2px_rgba(45,46,53,0.04),0_8px_24px_-12px_rgba(45,46,53,0.12)]'
const primaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-body font-semibold text-white transition-colors hover:bg-[#9d342e]'
const secondaryBtn =
  'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-body font-semibold ring-1 transition-colors hover:bg-white'

function RunClub() {
  return (
    <div className="pn-page-with-site-nav min-h-screen" style={{ background: 'var(--pn-color-bg-base)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(EVENT_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-20">
        <Hero />
        <HowItWorks />
        <WhatToBring />
        <Faq />
        <FinalCta />
      </div>
      <WhatsAppFloatingButton message="Hola, quiero información del Run Club de Estudio Popnest." />
    </div>
  )
}

function Hero() {
  return (
    <header className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-12 items-center">
      <div>
        <p className="text-xs font-body font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: RED }}>
          Run Club · Coyoacán · Gratis
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold leading-[1.05]" style={{ color: DARK }}>
          Run Club en Coyoacán: corre con nosotros, gratis.
        </h1>
        <p className="mt-5 max-w-xl text-base md:text-lg font-body leading-relaxed" style={{ color: 'var(--pn-color-text-soft)' }}>
          Salimos a correr en grupo desde Estudio Popnest, en la colonia Del Carmen. Sin costo, sin reservación y para
          todos los niveles: solo llega con tus tenis.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className={primaryBtn} style={{ backgroundColor: RED }}>
            Cómo llegar
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={secondaryBtn}
            style={{ color: DARK, '--tw-ring-color': 'var(--pn-color-border)' }}
          >
            Preguntar por WhatsApp
          </a>
        </div>
      </div>

      <section className={`${cardClass} p-6 md:p-8`} aria-labelledby="run-club-horario">
        <p id="run-club-horario" className="text-xs font-body font-semibold uppercase tracking-[0.18em]" style={{ color: SUBTLE }}>
          Horario de salidas
        </p>
        <dl className="mt-4">
          {SESSIONS.map((s) => (
            <div key={s.day} className="flex items-baseline justify-between gap-4 border-t py-4" style={{ borderColor: BORDER }}>
              <dt className="font-heading text-2xl font-bold" style={{ color: DARK }}>{s.day}</dt>
              <dd className="font-body text-2xl font-bold tabular-nums" style={{ color: RED }}>{s.time}</dd>
            </div>
          ))}
        </dl>
        <div className="border-t pt-4 text-sm font-body leading-relaxed" style={{ borderColor: BORDER, color: GRAY }}>
          <p className="font-semibold" style={{ color: DARK }}>Punto de encuentro</p>
          <p className="mt-1">Estudio Popnest Wellness · {ADDRESS}</p>
        </div>
      </section>
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

function HowItWorks() {
  return (
    <section className="mt-16 md:mt-24">
      <SectionHeading eyebrow="Cómo funciona" title="Sin registro, sin presión">
        Corremos a un ritmo en el que se puede platicar y el grupo se espera. Si estás empezando, aquí tienes lugar.
      </SectionHeading>
      <ol className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {STEPS.map((step, i) => (
          <li key={step.title} className={`${cardClass} p-6`}>
            <span className="font-heading text-3xl font-bold" style={{ color: RED }}>{i + 1}</span>
            <p className="mt-3 font-heading text-xl font-bold" style={{ color: DARK }}>{step.title}</p>
            <p className="mt-1.5 text-sm font-body leading-relaxed" style={{ color: GRAY }}>{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Dot() {
  return <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: RED }} aria-hidden="true" />
}

function WhatToBring() {
  return (
    <section className="mt-6 rounded-3xl p-6 md:p-8" style={{ backgroundColor: 'var(--pn-color-bg-secondary)' }}>
      <p className="text-xs font-body font-semibold uppercase tracking-[0.18em]" style={{ color: SUBTLE }}>
        Qué llevar
      </p>
      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3">
        {BRING.map((item) => (
          <li key={item} className="flex gap-3 text-sm font-body" style={{ color: 'var(--pn-color-text-soft)' }}>
            <Dot />
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

function Faq() {
  return (
    <section className="mt-16 md:mt-24">
      <SectionHeading eyebrow="Preguntas frecuentes" title="Lo que nos preguntan del Run Club" />
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {FAQ_ITEMS.map((item) => (
          <div key={item.q} className={`${cardClass} p-6`}>
            <h3 className="font-heading text-lg font-bold" style={{ color: DARK }}>{item.q}</h3>
            <p className="mt-2 text-sm font-body leading-relaxed" style={{ color: GRAY }}>{item.a}</p>
          </div>
        ))}
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
      <h2 className="text-3xl md:text-4xl font-heading font-bold" style={{ color: 'var(--pn-color-on-dark)' }}>
        Después de correr, quédate a estirar
      </h2>
      <p className="mt-3 max-w-xl mx-auto text-sm md:text-base font-body leading-relaxed" style={{ color: 'var(--pn-color-on-dark-muted)' }}>
        Complementa tus kilómetros con yoga, pilates o stretching en el estudio, en el mismo lugar donde arranca el Run Club.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link to="/classes" className={`${primaryBtn} px-8 py-3.5`} style={{ backgroundColor: RED }}>
          Ver clases
        </Link>
        <Link
          to="/horario"
          className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-body font-semibold ring-1 transition-colors hover:bg-white/10"
          style={{ '--tw-ring-color': 'rgba(244,237,226,0.4)' }}
        >
          Ver horario
        </Link>
      </div>
      <p className="mt-8 text-xs font-body leading-relaxed" style={{ color: 'var(--pn-color-on-dark-soft)' }}>
        {ADDRESS} · Miércoles 6:30 a.m. y sábado 7:30 a.m.
      </p>
    </section>
  )
}

export default RunClub
