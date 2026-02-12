import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import studioPhoto from '../assets/studio-photo.png'
import studioPhoto1 from '../assets/studio-photo-1.png'
import studioPhoto2 from '../assets/studio-photo-2.png'
import studioPhoto3 from '../assets/studio-photo-3.png'
import studioPhoto4 from '../assets/studio-photo-4.png'
import studioPhoto5 from '../assets/studio-photo-5.png'

function Home() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash])

  return (
    <div style={{ backgroundColor: '#FAFAFA' }}>
      <div className="wellness-content">
        {/* Hero Section - Diseño Limpio y Profesional */}
        <section className="min-h-screen flex items-center px-6 sm:px-8 lg:px-12 relative overflow-hidden"
                 style={{ backgroundColor: '#FAFAFA' }}>
          
          {/* Grid Layout Profesional: en móvil imagen + CTA arriba, texto abajo */}
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-screen py-20">
            
            {/* Columna Izquierda - Contenido (en móvil order-2 = aparece debajo de la imagen) */}
            <div className="flex flex-col justify-center space-y-8 lg:pr-8 order-2 lg:order-none">
              {/* Nombre de la marca (solo desktop; en móvil va arriba de la imagen) */}
              <p className="hidden lg:block text-xl md:text-2xl font-heading font-medium tracking-wide mb-2"
                 style={{ color: '#B73D37', letterSpacing: '0.05em' }}>
                Popnest Wellness
              </p>
              {/* Título Principal */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-light leading-tight mb-6"
                  style={{ color: '#1F2937', letterSpacing: '-0.02em' }}>
                Un espacio para{' '}
                <span className="font-normal italic" style={{ color: '#B73D37' }}>respirar</span>,{' '}
                <span className="font-normal italic" style={{ color: '#B73D37' }}>moverte</span> y{' '}
                <span className="font-normal italic" style={{ color: '#B73D37' }}>reconectar</span>
              </h1>
              
              {/* Descripción Elegante */}
              <div className="space-y-4 max-w-xl">
                <p className="text-lg md:text-xl font-body leading-relaxed" style={{ color: '#4B5563', letterSpacing: '0.01em' }}>
                  Entras por una galería de arte y una cafetería. Avanzas por un pasillo tranquilo hasta llegar a un espacio de coworking donde puedes quedarte a trabajar.
                </p>
                <p className="text-lg md:text-xl font-body leading-relaxed font-medium" style={{ color: '#B73D37' }}>
                  Y al fondo...
                </p>
                <p className="text-lg md:text-xl font-body leading-relaxed" style={{ color: '#4B5563', letterSpacing: '0.01em' }}>
                  Te espera nuestro salón de yoga y meditación: <span className="font-medium" style={{ color: '#1F2937' }}>lleno de luz, espejos, diseño y silencio</span>.
                </p>
              </div>
              
              {/* Mensaje Final */}
              <div className="pt-6 border-t" style={{ borderColor: '#E5D7D6' }}>
                <p className="text-base md:text-lg font-body italic leading-relaxed" style={{ color: '#6B7280' }}>
                  Una hora para ti. Sin distracciones. Sin prisa. Solo presencia.
                </p>
              </div>
              
              {/* CTA Button - oculto en móvil (ahí se muestra el que está bajo la imagen) */}
              <div className="pt-4 hidden lg:block">
                <button 
                  onClick={() => navigate('/classes')}
                  className="px-8 py-4 rounded-md transition-all duration-200 font-body font-medium text-base flex items-center gap-2 group"
                  style={{ 
                    backgroundColor: '#B73D37', 
                    color: '#FFFFFF',
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#C76661'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#B73D37'
                  }}
                >
                  <span>Explorar clases</span>
                  <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Columna Derecha - Imagen + CTA en móvil (order-first = arriba) */}
            <div className="order-1 lg:order-none flex flex-col gap-6">
              {/* En móvil: nombre de marca arriba de la imagen */}
              <p className="lg:hidden text-xl font-heading font-medium tracking-wide text-center"
                 style={{ color: '#B73D37', letterSpacing: '0.05em' }}>
                Popnest Wellness
              </p>
              <div className="relative w-full aspect-[4/3] max-h-[50vh] lg:max-h-[70vh] rounded-lg overflow-hidden">
                <img 
                  src={studioPhoto} 
                  alt="Estudio Popnest Wellness"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5"></div>
              </div>
              {/* CTA solo visible en móvil, justo debajo de la imagen */}
              <div className="lg:hidden">
                <button 
                  onClick={() => navigate('/classes')}
                  className="w-full px-8 py-4 rounded-md transition-all duration-200 font-body font-medium text-base flex items-center justify-center gap-2 group"
                  style={{ 
                    backgroundColor: '#B73D37', 
                    color: '#FFFFFF',
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#C76661'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#B73D37'
                  }}
                >
                  <span>Explorar clases</span>
                  <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>


        {/* Gallery Section - Diseño Limpio */}
        <section className="py-20 px-6 sm:px-8 lg:px-12 relative z-10"
                 style={{ backgroundColor: '#FAFAFA' }}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-light mb-4" style={{ color: '#1F2937', letterSpacing: '-0.02em' }}>
                Nuestro Espacio
              </h2>
              <p className="text-base md:text-lg font-body max-w-2xl leading-relaxed" style={{ color: '#6B7280' }}>
                Lleno de luz, espejos, diseño y silencio. Un espacio para respirar, moverte y reconectar.
              </p>
            </div>
            
            {/* Galería con scroll horizontal */}
            <div className="relative">
              <div 
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
                style={{
                  scrollBehavior: 'smooth',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <div className="flex-shrink-0 w-[85%] sm:w-[70%] md:w-[60%] lg:w-[45%] rounded-md overflow-hidden aspect-[4/3]">
                  <img 
                    src={studioPhoto1} 
                    alt="Espacio de meditación"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-shrink-0 w-[85%] sm:w-[70%] md:w-[60%] lg:w-[45%] rounded-md overflow-hidden aspect-[4/3]">
                  <img 
                    src={studioPhoto2} 
                    alt="Ambiente del estudio"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-shrink-0 w-[85%] sm:w-[70%] md:w-[60%] lg:w-[45%] rounded-md overflow-hidden aspect-[4/3]">
                  <img 
                    src={studioPhoto3} 
                    alt="Espacio tranquilo"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-shrink-0 w-[85%] sm:w-[70%] md:w-[60%] lg:w-[45%] rounded-md overflow-hidden aspect-[4/3]">
                  <img 
                    src={studioPhoto4} 
                    alt="Vista del estudio"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Indicador visual de scroll */}
              <div className="flex justify-center mt-6 gap-2">
                <div className="text-xs font-body" style={{ color: '#9CA3AF' }}>
                  ← Desliza para ver más →
                </div>
              </div>
            </div>
            
            {/* Características simplificadas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              <div className="text-center p-6">
                <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full"
                     style={{ backgroundColor: '#FEE2E2' }}>
                  <svg className="w-10 h-10" style={{ color: '#B73D37' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 002 2h2.945M11 3.055V5a2 2 0 002 2h1a2 2 0 002 2 2 2 0 012 2v2.945M21 12.945V19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-1a2 2 0 00-2-2h-1a2 2 0 00-2 2v1a2 2 0 01-2 2H7a2 2 0 01-2-2v-1a2 2 0 00-2-2V9a2 2 0 012-2h1a2 2 0 002-2h1a2 2 0 002-2h2.945M21 12.945V9a2 2 0 00-2-2h-1a2 2 0 01-2-2V5a2 2 0 012-2h2.945" />
                  </svg>
                </div>
                <h4 className="text-base font-heading font-medium mb-1" style={{ color: '#1F2937' }}>Espacios Amplios</h4>
                <p className="text-sm font-body" style={{ color: '#6B7280' }}>Salones diseñados para comodidad</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full"
                     style={{ backgroundColor: '#FEE2E2' }}>
                  <svg className="w-10 h-10" style={{ color: '#B73D37' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h4 className="text-base font-heading font-medium mb-1" style={{ color: '#1F2937' }}>Iluminación Natural</h4>
                <p className="text-sm font-body" style={{ color: '#6B7280' }}>Ambiente luminoso y acogedor</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full"
                     style={{ backgroundColor: '#FEE2E2' }}>
                  <svg className="w-10 h-10" style={{ color: '#B73D37' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-base font-heading font-medium mb-1" style={{ color: '#1F2937' }}>Equipamiento Completo</h4>
                <p className="text-sm font-body" style={{ color: '#6B7280' }}>Todo lo necesario para tu práctica</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full"
                     style={{ backgroundColor: '#FEE2E2' }}>
                  <svg className="w-10 h-10" style={{ color: '#B73D37' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-base font-heading font-medium mb-1" style={{ color: '#1F2937' }}>Ambiente Tranquilo</h4>
                <p className="text-sm font-body" style={{ color: '#6B7280' }}>Espacio de paz y serenidad</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section - Limpio y Profesional */}
        <section id="sobre-nosotros" className="py-20 px-6 sm:px-8 lg:px-12 relative z-10 scroll-mt-24"
                 style={{ backgroundColor: '#FFFFFF' }}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-light mb-4" style={{ color: '#1F2937', letterSpacing: '-0.02em' }}>
                Nuestros Valores
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={studioPhoto1} 
                    alt="Un espacio para ti - Estudio Popnest Wellness"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>
                    Un Espacio para Ti
                  </h3>
                  <p className="text-base font-body leading-relaxed" style={{ color: '#6B7280' }}>
                    Una hora para ti. Sin distracciones. Sin prisa. Solo presencia. 
                    Un espacio para respirar, moverte y reconectar.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={studioPhoto2} 
                    alt="Lleno de luz y diseño - Estudio Popnest Wellness"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>
                    Lleno de Luz y Diseño
                  </h3>
                  <p className="text-base font-body leading-relaxed" style={{ color: '#6B7280' }}>
                    Nuestro salón de yoga y meditación está diseñado con espejos, 
                    iluminación natural y un ambiente que invita al silencio y la contemplación.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={studioPhoto3} 
                    alt="En el corazón del espacio - Estudio Popnest Wellness"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>
                    En el Corazón del Espacio
                  </h3>
                  <p className="text-base font-body leading-relaxed" style={{ color: '#6B7280' }}>
                    Ubicado al fondo de un espacio único que combina galería de arte, 
                    cafetería y coworking, nuestro salón es un refugio de tranquilidad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Horarios, Ubicación, Preguntas - anclas para el footer */}
        <section className="py-16 px-6 sm:px-8 lg:px-12 relative z-10" style={{ backgroundColor: '#FAFAFA' }}>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div id="horarios" className="scroll-mt-24 p-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="aspect-[16/9] rounded-lg overflow-hidden mb-4">
                <img src={studioPhoto1} alt="Horarios de clases" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-heading font-medium mb-2" style={{ color: '#1F2937' }}>Horarios</h3>
              <p className="text-sm font-body leading-relaxed" style={{ color: '#6B7280' }}>
                Consulta los horarios de cada clase en la página <button type="button" onClick={() => navigate('/classes')} className="underline" style={{ color: '#B73D37' }}>Clases</button>. Ahí verás el calendario y los días en que hay práctica.
              </p>
            </div>
            <div id="ubicacion" className="scroll-mt-24 p-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="aspect-[16/9] rounded-lg overflow-hidden mb-4">
                <img src={studioPhoto2} alt="Ubicación del estudio" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-heading font-medium mb-2" style={{ color: '#1F2937' }}>Ubicación</h3>
              <p className="text-sm font-body leading-relaxed" style={{ color: '#6B7280' }}>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Londres+105,+Del+Carmen,+Coyoacán,+04100+Ciudad+de+México,+CDMX" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="underline" 
                  style={{ color: '#B73D37' }}
                >
                  Londres 105, Del Carmen, Coyoacán, 04100 Ciudad de México, CDMX
                </a>
                . Te recomendamos hacer tu reservación en línea después de registrarte y pagar.
              </p>
            </div>
            <div id="preguntas-frecuentes" className="scroll-mt-24 p-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="aspect-[16/9] rounded-lg overflow-hidden mb-4">
                <img src={studioPhoto3} alt="Estudio Popnest Wellness" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-heading font-medium mb-2" style={{ color: '#1F2937' }}>Preguntas Frecuentes</h3>
              <p className="text-sm font-body leading-relaxed" style={{ color: '#6B7280' }}>
                ¿Dudas sobre reservas, paquetes o pagos? Contáctanos por <a href="mailto:info@estudiopopnest.com" className="underline" style={{ color: '#B73D37' }}>correo</a> o <a href="https://wa.me/525554379644" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#B73D37' }}>WhatsApp</a> y te respondemos a la brevedad.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section - Limpio y Profesional */}
        <section className="py-20 px-6 sm:px-8 lg:px-12 relative z-10"
                 style={{ backgroundColor: '#FFFFFF' }}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-light mb-4" style={{ color: '#1F2937', letterSpacing: '-0.02em' }}>
              ¿Listo para comenzar tu viaje?
            </h2>
            <p className="text-base md:text-lg font-body mb-8 leading-relaxed" style={{ color: '#6B7280' }}>
              Descubre nuestras clases y profesores. Encuentra la práctica perfecta para ti y reserva tu primera sesión hoy mismo.
            </p>
            <button 
              onClick={() => navigate('/classes')}
              className="px-8 py-4 rounded-md transition-all duration-200 font-body font-medium text-base flex items-center gap-2 mx-auto group"
              style={{ 
                backgroundColor: '#B73D37', 
                color: '#FFFFFF',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#C76661'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#B73D37'
              }}
            >
              <span>Explorar clases</span>
              <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Home
