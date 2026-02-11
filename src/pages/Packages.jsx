import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../services/authService'

function Packages() {
  const navigate = useNavigate()

  const packages = [
    {
      id: 'package-10-classes',
      name: 'Paquete de 10 Clases',
      classes: 10,
      price: 300,
      originalPrice: 450,
      description: 'Ahorra $150 comprando 10 clases. Puedes usar estas clases para cualquier práctica disponible en nuestro estudio.',
      benefits: [
        'Válido para todas las clases',
        'Válido por 2 meses desde la compra',
        'Ahorra $15 por clase',
        'Flexibilidad total'
      ],
      popular: true
    }
  ]

  const handlePurchasePackage = (packageId) => {
    // Verificar autenticación antes de navegar a la compra
    if (!isAuthenticated()) {
      // Redirigir al registro (crear cuenta) con la ruta de destino para después del registro
      navigate(`/signup?from=/booking/package/${packageId}`)
      return
    }
    // Si está autenticado, ir directamente a la compra
    navigate(`/booking/package/${packageId}`)
  }

  return (
    <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <header className="relative z-10 pt-28 pb-16"
              style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <h1 className="text-4xl md:text-5xl font-heading font-light mb-4"
              style={{ color: '#1F2937', letterSpacing: '-0.02em' }}>
            Paquetes de Clases
          </h1>
          <p className="text-base md:text-lg font-body leading-relaxed" style={{ color: '#6B7280' }}>
            Ahorra dinero comprando paquetes de clases. Usa tus clases cuando quieras, para cualquier práctica disponible.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-lg overflow-hidden cursor-pointer transition-all duration-300 flex flex-col relative ${
                pkg.popular ? 'ring-2 ring-offset-4' : ''
              }`}
              style={{ 
                boxShadow: pkg.popular 
                  ? '0 8px 24px rgba(183, 61, 55, 0.2)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderColor: pkg.popular ? '#B73D37' : 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(183, 61, 55, 0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = pkg.popular 
                  ? '0 8px 24px rgba(183, 61, 55, 0.2)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm font-semibold rounded-bl-lg"
                     style={{ backgroundColor: '#B73D37' }}>
                  Más Popular
                </div>
              )}
              
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-heading font-bold mb-2" style={{ color: '#1F2937' }}>
                  {pkg.name}
                </h3>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-heading font-bold" style={{ color: '#B73D37' }}>
                      ${pkg.price.toLocaleString()}
                    </span>
                    <span className="text-lg font-body" style={{ color: '#6B7280' }}>
                      MXN
                    </span>
                  </div>
                  {pkg.originalPrice && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-body line-through" style={{ color: '#9CA3AF' }}>
                        ${pkg.originalPrice.toLocaleString()} MXN
                      </span>
                      <span className="text-sm font-body font-semibold px-2 py-1 rounded"
                            style={{ backgroundColor: '#FEE2E2', color: '#B73D37' }}>
                        Ahorra ${(pkg.originalPrice - pkg.price).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-body font-body mb-6 leading-relaxed" style={{ color: '#4B5563' }}>
                  {pkg.description}
                </p>

                <div className="mb-6 flex-grow">
                  <h4 className="text-sm font-heading font-semibold mb-3" style={{ color: '#1F2937' }}>
                    Beneficios:
                  </h4>
                  <ul className="space-y-2">
                    {pkg.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span className="text-sm font-body" style={{ color: '#4B5563' }}>
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handlePurchasePackage(pkg.id)}
                  className="w-full py-4 rounded-lg font-heading font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                  style={{ 
                    backgroundColor: '#B73D37', 
                    color: '#FFFFFF',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(183, 61, 55, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#C76661'
                    e.target.style.boxShadow = '0 6px 16px rgba(183, 61, 55, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#B73D37'
                    e.target.style.boxShadow = '0 4px 12px rgba(183, 61, 55, 0.3)'
                  }}
                >
                  Comprar Paquete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Packages
