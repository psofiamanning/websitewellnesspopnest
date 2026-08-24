import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 pt-28 pb-20 text-center">
        <p className="text-sm font-body mb-2" style={{ color: '#B73D37' }}>Error 404</p>
        <h1 className="text-3xl md:text-4xl font-heading font-light mb-4" style={{ color: '#1F2937' }}>
          No encontramos esta página
        </h1>
        <p className="font-body text-base leading-relaxed mb-8" style={{ color: '#4B5563' }}>
          El enlace puede estar roto o la página ya no existe. Prueba estos accesos directos:
        </p>
        <div className="flex flex-wrap justify-center gap-3 font-body text-sm">
          <Link to="/" className="underline" style={{ color: '#B73D37' }}>Inicio</Link>
          <Link to="/classes" className="underline" style={{ color: '#B73D37' }}>Clases</Link>
          <Link to="/horario" className="underline" style={{ color: '#B73D37' }}>Horario</Link>
          <Link to="/packages" className="underline" style={{ color: '#B73D37' }}>Paquetes</Link>
          <Link to="/ubicacion" className="underline" style={{ color: '#B73D37' }}>Ubicación</Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
