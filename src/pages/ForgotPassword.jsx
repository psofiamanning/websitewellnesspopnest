import { Link } from 'react-router-dom'

function ForgotPassword() {
  return (
    <div className="wellness-background min-h-screen flex items-center justify-center py-20">
      <div className="wellness-shapes">
        <div className="wellness-shape shape-1"></div>
        <div className="wellness-shape shape-2"></div>
        <div className="wellness-shape shape-3"></div>
      </div>

      <div className="wellness-content relative z-10 w-full max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg p-8 shadow-xl border-2" style={{ borderColor: '#E5B3B0' }}>
          <h1 className="text-3xl font-heading font-bold mb-2 text-center" style={{ color: '#1F2937' }}>
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-body font-body text-center mb-6" style={{ color: '#6B7280' }}>
            Si olvidaste tu contraseña, comunícate con el equipo de Estudio Popnest Wellness para que te ayudemos a recuperar el acceso a tu cuenta.
          </p>
          <div className="mb-6 p-6 rounded-lg border-2" style={{ backgroundColor: '#fef3c7', borderColor: '#fcd34d' }}>
            <p className="text-sm font-body text-gray-800 text-center">
              Escríbenos a <a href="mailto:info@estudiopopnest.com" className="font-semibold underline" style={{ color: '#B73D37' }}>info@estudiopopnest.com</a> o contáctanos por nuestros canales habituales indicando el correo con el que te registraste.
            </p>
          </div>
          <Link
            to="/login"
            className="block w-full py-4 rounded-lg font-heading font-semibold text-lg text-center transition-all duration-300"
            style={{
              backgroundColor: '#B73D37',
              color: '#FFFFFF',
              border: 'none',
              boxShadow: '0 4px 12px rgba(183, 61, 55, 0.3)'
            }}
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
