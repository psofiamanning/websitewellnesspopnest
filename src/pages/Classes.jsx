import { useNavigate } from 'react-router-dom'
import { classTypes } from '../data/classes'
import { SINGLE_CLASS_PRICE_MXN } from '../config/pricing'

function Classes() {
  const navigate = useNavigate()

  const goToBooking = (classId) => {
    navigate(`/booking/class/${classId}`)
  }

  const scrollToClass = (classId) => {
    const el = document.getElementById(`class-${classId}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <header
        className="relative z-10 pt-28 pb-6 lg:pt-24 lg:pb-3 shrink-0"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <h1
            className="text-4xl md:text-5xl lg:text-3xl xl:text-4xl font-heading font-light mb-2 lg:mb-1"
            style={{ color: '#1F2937', letterSpacing: '-0.02em' }}
          >
            Clases de Yoga y Bienestar en Coyoacán
          </h1>
          <p
            className="text-base md:text-lg lg:text-sm font-body leading-relaxed max-w-3xl lg:line-clamp-2"
            style={{ color: '#6B7280' }}
          >
            Descubre nuestras clases de yoga, tai chi, meditación y sound healing en Coyoacán. Encuentra la práctica perfecta para tu bienestar en nuestro estudio boutique.
          </p>
        </div>
      </header>

      <div
        className="lg:hidden sticky top-20 z-20 px-4 py-3 border-b bg-white/95 backdrop-blur"
        style={{ borderColor: '#E5D7D6', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <p className="text-xs font-body font-semibold mb-2 uppercase tracking-wide" style={{ color: '#6B7280' }}>
          Nuestras clases — toca para ver más
        </p>
        <div className="flex flex-wrap gap-2">
          {classTypes.map((classType) => (
            <button
              key={classType.id}
              type="button"
              onClick={() => scrollToClass(classType.id)}
              className="px-4 py-2.5 rounded-lg font-body font-medium text-sm transition-all"
              style={{
                backgroundColor: 'rgba(183, 61, 55, 0.12)',
                color: '#B73D37',
                border: '1px solid rgba(183, 61, 55, 0.3)'
              }}
            >
              {classType.name}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-6 lg:py-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-4">
          {classTypes.map((classType) => (
            <section
              key={classType.id}
              id={`class-${classType.id}`}
              className="scroll-mt-32 lg:scroll-mt-0"
              aria-labelledby={`class-heading-${classType.id}`}
            >
              <div
                className="group bg-white rounded-xl overflow-hidden transition-shadow duration-200 hover:shadow-lg flex flex-col sm:flex-row sm:items-stretch h-full border border-gray-100 hover:border-[#E5B3B0]"
                style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' }}
              >
                {/* Imagen: móvil/narrow arriba; desde sm (640px) columna izquierda (ancho fijo %) */}
                <div className="relative h-56 sm:h-auto sm:w-[40%] sm:min-w-[150px] md:min-w-[168px] lg:min-w-[184px] shrink-0 bg-neutral-100 sm:self-stretch">
                  <img
                    src={classType.image}
                    alt=""
                    className="h-full w-full sm:absolute sm:inset-0 object-cover"
                    style={{
                      objectPosition: 'center top',
                      filter: 'brightness(1.08) saturate(1.18) contrast(1.02) sepia(0.07)',
                    }}
                  />
                </div>

                {/* Contenido: jerarquía título → metadatos → acciones al pie (patrón F) */}
                <div className="flex flex-1 flex-col justify-between gap-4 p-4 sm:p-5 sm:pl-5 sm:pr-5 sm:py-5 min-w-0">
                  <div className="space-y-3 min-w-0">
                    <h3
                      id={`class-heading-${classType.id}`}
                      className="text-xl sm:text-lg font-heading font-semibold leading-snug tracking-tight"
                      style={{ color: '#1F2937' }}
                    >
                      {classType.name}
                    </h3>
                    <dl className="space-y-1.5 text-sm font-body" style={{ color: '#6B7280' }}>
                      <div className="flex flex-wrap gap-x-1">
                        <dt className="font-medium text-gray-800 shrink-0">Coach:</dt>
                        <dd className="min-w-0">{classType.teacher}</dd>
                      </div>
                      <div className="flex flex-wrap gap-x-1">
                        <dt className="font-medium text-gray-800 shrink-0">Duración:</dt>
                        <dd>{classType.duration} min</dd>
                      </div>
                      <div className="flex flex-wrap gap-x-1 items-baseline">
                        <dt className="font-medium shrink-0" style={{ color: '#B73D37' }}>Precio:</dt>
                        <dd className="font-medium tabular-nums" style={{ color: '#1F2937' }}>
                          ${SINGLE_CLASS_PRICE_MXN.toFixed(2)} MXN
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex flex-row gap-2 sm:gap-3 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => goToBooking(classType.id)}
                      className="flex-1 min-w-0 min-h-[44px] px-3 rounded-lg font-body font-semibold text-sm transition-colors duration-200 border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B73D37]"
                      style={{
                        backgroundColor: '#FFFFFF',
                        color: '#B73D37',
                        borderColor: '#B73D37'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(183, 61, 55, 0.06)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF'
                      }}
                    >
                      Ver más
                    </button>
                    <button
                      type="button"
                      onClick={() => goToBooking(classType.id)}
                      className="flex-1 min-w-0 min-h-[44px] px-3 rounded-lg font-body font-semibold text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B73D37]"
                      style={{ backgroundColor: '#B73D37', color: '#FFFFFF', border: '2px solid #B73D37' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#C76661' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#B73D37' }}
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Classes
