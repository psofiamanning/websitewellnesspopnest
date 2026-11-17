import { Link, useNavigate } from 'react-router-dom'
import { useFituneLive, FITUNE_URLS, FITUNE_LINK_PROPS } from '../config/fitune'

const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Londres+105,+Del+Carmen,+Coyoacán,+04100+Ciudad+de+México,+CDMX'

const UBICACION_FAQ = [
  {
    q: '¿Hay estacionamiento?',
    a: 'El estudio no tiene estacionamiento propio, pero es fácil encontrar lugar en las calles aledañas de la colonia Del Carmen.'
  },
  {
    q: '¿Qué metro me queda más cerca?',
    a: 'Metro Coyoacán (Línea 3), a 1.6 km: unos 20–25 minutos caminando por Av. Coyoacán y Av. México hasta la calle Londres, o 5 minutos en taxi. También están General Anaya (Línea 2) y Viveros / Derechos Humanos (Línea 3), a unos 25–27 minutos a pie. No hay Metrobús cercano.'
  },
  {
    q: '¿Cómo encuentro el salón de clases?',
    a: 'Entra por Londres 105: el inmueble comparte entrada con galería, cafetería y coworking. El salón de Estudio Popnest está al fondo del espacio.'
  },
  {
    q: '¿En qué zona de Coyoacán están?',
    a: 'En la colonia Del Carmen (C.P. 04100), a unos pasos del Museo Frida Kahlo (Casa Azul) y cerca del centro de Coyoacán, entre cafés, galerías y calles peatonales.'
  }
]

const UBICACION_FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: UBICACION_FAQ.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a }
  }))
}

function Ubicacion() {
  const fituneLive = useFituneLive()
  const navigate = useNavigate()

  return (
    <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 pt-28 pb-20">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12">
          <button
            onClick={() => navigate(-1)}
            className="text-body font-body text-sm mb-6 flex items-center gap-1 hover:underline"
            style={{ color: '#B73D37' }}
          >
            ← Volver
          </button>
          <h1 className="text-3xl md:text-4xl font-heading font-light mb-2" style={{ color: '#1F2937' }}>
            Ubicación — Estudio de yoga en Coyoacán
          </h1>
          <p className="text-base font-body mb-6" style={{ color: '#6B7280' }}>
            Encuéntranos en Del Carmen, Coyoacán, Ciudad de México.
          </p>

          <div
            className="mb-8 p-4 rounded-lg text-sm leading-relaxed"
            style={{ backgroundColor: '#FEF3F2', border: '1px solid #FECACA', color: '#4B5563' }}
            role="note"
          >
            <strong style={{ color: '#1F2937' }}>Estudio de yoga y bienestar.</strong>{' '}
            Estudio Popnest Wellness es el salón de clases en Londres 105 (al fondo del inmueble).
            En el mismo edificio está{' '}
            <a href="https://www.estudiopopnest.com/" target="_blank" rel="noopener" className="underline" style={{ color: '#B73D37' }}>
              Estudio Popnest Coworking
            </a>{' '}
            (coworking, salas de juntas y cafetería), un negocio distinto con su propio perfil en Google Maps, además de una galería.
            Para reservar yoga, pilates o sound healing,
            {fituneLive ? (
              <>
                {' '}usa solo nuestro{' '}
                <a href={FITUNE_URLS.schedule} className="underline" style={{ color: '#B73D37' }} {...FITUNE_LINK_PROPS}>
                  horario de reservas en Fitune
                </a>
                {' '}(enlazado desde popnest.app).
              </>
            ) : (
              <>
                {' '}usa solo <strong>popnest.app</strong>.
              </>
            )}
          </div>

          <div className="space-y-8 font-body text-base leading-relaxed" style={{ color: '#4B5563' }}>
            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>
                Dirección
              </h2>
              <p className="mb-4">
                <strong>Estudio Popnest Wellness</strong><br />
                Londres 105, Colonia Del Carmen<br />
                Coyoacán, 04100 Ciudad de México, CDMX
              </p>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#FEE2E2', color: '#B73D37' }}
              >
                Ver en Google Maps
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>
                Nuestro espacio en Coyoacán
              </h2>
              <p>
                Estudio Popnest Wellness está en <strong>Coyoacán</strong>, una de las alcaldías con más vida cultural y tranquila de la Ciudad de México. La colonia <strong>Del Carmen</strong> nos sitúa a unos pasos del <strong>Museo Frida Kahlo (Casa Azul)</strong>, cerca de centros de arte, cafés y espacios peatonales, ideal para combinar tu práctica de yoga o meditación con un rato en la zona.
              </p>
              <p className="mt-4">
                El estudio forma parte de un lugar que integra galería de arte, cafetería y zona de coworking. Al fondo del espacio encontrarás nuestro salón de yoga y meditación: un lugar reservado para las clases de hatha yoga, pilates, power yoga, tai chi, sound healing, belly dance y stretching en Coyoacán.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>
                Cómo llegar
              </h2>
              <h3 className="text-base font-heading font-medium mt-4 mb-2" style={{ color: '#1F2937' }}>
                En Metro (lo más cercano): estación Coyoacán, Línea 3
              </h3>
              <p className="mb-2">
                Son unos <strong>1.6 km, 20–25 minutos caminando</strong> (todo plano), o 5 minutos en taxi o app desde la estación:
              </p>
              <ol className="list-decimal pl-5 space-y-1 mb-4">
                <li>Sal de Metro Coyoacán hacia <strong>Av. Universidad</strong> y camina unos 100 m hasta la esquina con <strong>Av. Coyoacán</strong> (Eje 3 Poniente).</li>
                <li>Gira a la izquierda en Av. Coyoacán (hacia el oriente); más adelante la calle se convierte en <strong>Av. México</strong>.</li>
                <li>Sigue por Av. México unos 600 m hasta la calle <strong>Londres</strong>.</li>
                <li>Gira a la izquierda en Londres y camina hasta el <strong>número 105</strong>; el estudio queda a tu izquierda, a unos pasos del Museo Frida Kahlo.</li>
              </ol>
              <p className="mb-4">
                Otras estaciones: <strong>General Anaya</strong> (Línea 2) y <strong>Viveros / Derechos Humanos</strong> (Línea 3), a unos 25–27 minutos caminando. No hay estación de Metrobús cercana: la más próxima es la Línea 1 sobre Insurgentes Sur (Félix Cuevas), a unos 30 minutos en transporte público.
              </p>
              <p>
                Puedes llegar en transporte público o en auto. El estudio no tiene estacionamiento propio, pero es fácil encontrar lugar en las calles aledañas. Revisa <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#B73D37' }}>Google Maps</a> para rutas. Si tienes dudas, escríbenos por <a href="https://wa.me/525554379644" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#B73D37' }}>WhatsApp</a> o a <a href="mailto:info@estudiopopnest.com" className="underline" style={{ color: '#B73D37' }}>info@estudiopopnest.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>
                Clases de yoga y bienestar en Coyoacán
              </h2>
              <p>
                Ofrecemos clases de hatha yoga, pilates mat, power yoga, tai chi, sound healing, belly dance y stretching. Todas se imparten en nuestro espacio en Coyoacán. Puedes ver el <Link to="/horario" className="underline" style={{ color: '#B73D37' }}>horario</Link> y reservar tu clase en línea.
              </p>
            </section>
          </div>

          <section className="mt-10 font-body text-base leading-relaxed" style={{ color: '#4B5563' }}>
            <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>
              Preguntas frecuentes
            </h2>
            <dl className="space-y-4">
              {UBICACION_FAQ.map((item) => (
                <div key={item.q}>
                  <dt className="font-medium" style={{ color: '#1F2937' }}>{item.q}</dt>
                  <dd className="mt-1">{item.a}</dd>
                </div>
              ))}
            </dl>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(UBICACION_FAQ_SCHEMA) }}
            />
          </section>

          <div className="mt-12 pt-8 border-t" style={{ borderColor: '#E5E7EB' }}>
            <Link to="/" className="font-body text-sm hover:underline" style={{ color: '#B73D37' }}>
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Ubicacion
