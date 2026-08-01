import { Link, useNavigate } from 'react-router-dom'

const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Londres+105,+Del+Carmen,+Coyoacán,+04100+Ciudad+de+México,+CDMX'

function Ubicacion() {
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
            En el mismo edificio pueden aparecer otras actividades — cafetería, coworking, galería — con
            perfiles distintos en Google Maps y redes sociales. Para reservar yoga, meditación o sound healing,
            usa solo <strong>popnest.app</strong>.
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
                Estudio Popnest Wellness está en <strong>Coyoacán</strong>, una de las alcaldías con más vida cultural y tranquila de la Ciudad de México. La colonia <strong>Del Carmen</strong> nos sitúa cerca de centros de arte, cafés y espacios peatonales, ideal para combinar tu práctica de yoga o meditación con un rato en la zona.
              </p>
              <p className="mt-4">
                El estudio forma parte de un lugar que integra galería de arte, cafetería y zona de coworking. Al fondo del espacio encontrarás nuestro salón de yoga y meditación: un lugar reservado para las clases de hatha yoga, pilates, power yoga, tai chi, sound healing, meditación, belly dance y stretching en Coyoacán.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>
                Cómo llegar
              </h2>
              <p>
                Puedes llegar en transporte público o en auto. Te recomendamos revisar <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#B73D37' }}>Google Maps</a> para rutas y opciones de estacionamiento en la zona de Coyoacán. Si tienes dudas, escríbenos por <a href="https://wa.me/525554379644" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#B73D37' }}>WhatsApp</a> o a <a href="mailto:info@estudiopopnest.com" className="underline" style={{ color: '#B73D37' }}>info@estudiopopnest.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>
                Clases de yoga y bienestar en Coyoacán
              </h2>
              <p>
                Ofrecemos clases de hatha yoga, pilates, power yoga, tai chi, sound healing, meditación, belly dance y stretching. Todas se imparten en nuestro espacio en Coyoacán. Puedes ver el horario y <Link to="/classes" className="underline" style={{ color: '#B73D37' }}>reservar tu clase en línea</Link> desde esta misma web.
              </p>
            </section>
          </div>

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
