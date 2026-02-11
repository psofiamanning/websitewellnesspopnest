import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { createPaymentIntent } from '../services/bookingService'
import { getCurrentUser, isAuthenticated } from '../services/authService'
import StripeCardElement from '../components/StripeCardElement'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002'

// Datos de paquetes
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
    ]
  }
]

function PackagePurchase() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [packageInfo, setPackageInfo] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  
  // Estado para información del cliente
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  
  // Estado para información de tarjeta
  const [cardholderName, setCardholderName] = useState('')
  const [stripeCardData, setStripeCardData] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Verificar autenticación primero
    if (!isAuthenticated()) {
      navigate(`/login?from=/booking/package/${id}`, { replace: true })
      return
    }

    // Función para cargar información del usuario
    const loadUserInfo = () => {
      const user = getCurrentUser()
      console.log('🔍 Usuario autenticado en PackagePurchase:', user)
      
      if (user) {
        // Solo actualizar campos que están vacíos, no sobrescribir lo que el usuario ya ingresó
        setCustomerInfo(prev => {
          const updatedInfo = {
            firstName: prev.firstName || user.firstName || '',
            lastName: prev.lastName || user.lastName || '',
            email: prev.email || user.email || '',
            phone: prev.phone || user.phone || ''
          }
          console.log('📝 Actualizando información del cliente (solo campos vacíos):', updatedInfo)
          console.log('📞 Teléfono previo:', prev.phone, 'Teléfono del usuario:', user.phone)
          
          // Si el teléfono no está en el token ni en el estado actual, intentar obtenerlo del backend
          if ((!updatedInfo.phone || updatedInfo.phone.trim() === '') && (!user.phone || user.phone === '' || user.phone === null || user.phone === undefined) && user.email) {
            console.log('⚠️ Teléfono no encontrado en token ni estado, obteniendo del backend...')
            // Llamar después de un pequeño delay para evitar conflictos con el setState
            setTimeout(() => fetchUserInfoFromBackend(user.email), 100)
          } else if (user.phone) {
            console.log('✅ Teléfono encontrado en token:', user.phone)
          }
          
          return updatedInfo
        })
      } else {
        console.warn('❌ No se pudo obtener información del usuario autenticado')
      }
    }

    // Cargar información inmediatamente
    loadUserInfo()

    // También intentar después de un pequeño delay por si el token aún no está disponible
    const timeoutId = setTimeout(() => {
      console.log('🔄 Reintentando cargar información del usuario después del delay...')
      loadUserInfo()
    }, 200)

    setIsCheckingAuth(false)

    const pkg = packages.find(p => p.id === id)
    if (!pkg) {
      navigate('/packages')
      return
    }
    setPackageInfo(pkg)

    return () => clearTimeout(timeoutId)
  }, [id, navigate])

  // Función para obtener información completa del usuario desde el backend
  const fetchUserInfoFromBackend = async (email) => {
    try {
      console.log('Obteniendo información del usuario desde el backend para:', email)
      const response = await fetch(`${BACKEND_URL}/api/users/email/${encodeURIComponent(email)}`)
      if (response.ok) {
        const userData = await response.json()
        console.log('Información del usuario obtenida del backend:', userData)
        if (userData.phone) {
          setCustomerInfo(prev => ({
            ...prev,
            phone: userData.phone
          }))
          console.log('Teléfono actualizado:', userData.phone)
        } else {
          console.warn('El usuario no tiene teléfono en el backend')
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        console.warn('Error al obtener información del usuario:', errorData)
      }
    } catch (error) {
      console.warn('No se pudo obtener información del usuario desde el backend:', error)
    }
  }

  // Función helper para validar si un teléfono es válido (mínimo 10 dígitos)
  const isValidPhone = (phone) => {
    if (!phone || typeof phone !== 'string') return false
    // Contar solo los dígitos (sin espacios, guiones, etc.)
    const digitsOnly = phone.replace(/[^0-9]/g, '')
    return digitsOnly.length >= 10
  }

  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePurchase = async () => {
    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !isValidPhone(customerInfo.phone)) {
      alert('Por favor completa toda la información de contacto. El teléfono debe tener al menos 10 dígitos.')
      return
    }
    
    if (!stripeCardData || !stripeCardData.isComplete || !cardholderName) {
      alert('Por favor completa la información de la tarjeta')
      return
    }
    
    if (stripeCardData.error) {
      alert(`Error en la tarjeta: ${stripeCardData.error.message}`)
      return
    }

    setIsProcessing(true)

    try {
      // Precio del paquete en centavos
      const amount = packageInfo.price * 100 // $300 = 30000 centavos
      
      // Crear Payment Intent con Stripe
      let paymentIntent
      try {
        paymentIntent = await createPaymentIntent(amount, 'mxn', {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone
        })
      } catch (paymentError) {
        console.error('Error al crear Payment Intent:', paymentError)
        if (paymentError.message.includes('fetch') || paymentError.message.includes('Failed to fetch')) {
          alert('⚠️ No se pudo conectar con el servidor de pagos. Por favor verifica que el backend esté corriendo en http://localhost:3002')
        } else {
          alert(`⚠️ Error al crear el intento de pago: ${paymentError.message}`)
        }
        setIsProcessing(false)
        return
      }
      
      // Procesar pago con Stripe
      let paymentStatus = 'succeeded'
      let stripeError = null
      
      if (stripeCardData && stripeCardData.stripe && stripeCardData.elements && paymentIntent.clientSecret) {
        try {
          const { stripe, elements } = stripeCardData
          const cardElement = elements.getElement('card')
          
          if (!cardElement || !stripeCardData.isComplete) {
            throw new Error('Por favor completa toda la información de la tarjeta antes de continuar.')
          }

          const result = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: cardholderName || `${customerInfo.firstName} ${customerInfo.lastName}`,
                email: customerInfo.email,
                phone: customerInfo.phone,
              }
            }
          })

          if (result.error) {
            stripeError = result.error
            paymentStatus = 'pending'
          } else if (result.paymentIntent) {
            paymentStatus = result.paymentIntent.status
          }
        } catch (error) {
          console.error('Error al procesar pago:', error)
          stripeError = {
            message: error.message || 'Error desconocido al procesar el pago',
            type: 'exception'
          }
          paymentStatus = 'pending'
        }
      }

      // Guardar la compra del paquete
      const packagePurchase = {
        type: 'package',
        packageId: packageInfo.id,
        packageName: packageInfo.name,
        classes: packageInfo.classes,
        customer: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          fullName: `${customerInfo.firstName} ${customerInfo.lastName}`
        },
        payment: {
          method: 'Tarjeta de Crédito/Débito',
          amount: amount,
          currency: 'MXN',
          cardLastFour: stripeCardData?.paymentMethod?.card?.last4 || '****',
          status: paymentStatus
        },
        stripeInfo: {
          paymentIntentId: paymentIntent.paymentIntentId,
          clientSecret: paymentIntent.clientSecret,
          amount: amount,
          currency: 'mxn',
          error: stripeError ? stripeError.message : null
        },
        purchaseDate: new Date().toISOString(),
        status: paymentStatus === 'succeeded' ? 'confirmed' : 'pending'
      }

      // Guardar en el backend
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002'}/api/packages/purchase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(packagePurchase)
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Error al guardar la compra del paquete')
        }
      } catch (saveError) {
        console.error('Error guardando compra:', saveError)
        // Continuar de todas formas
      }

      if (stripeError) {
        alert(`⚠️ Compra guardada pero el pago requiere atención.\n\nPaquete: ${packageInfo.name}\nCliente: ${customerInfo.firstName} ${customerInfo.lastName}\n\nError: ${stripeError.message}`)
      } else if (paymentStatus === 'succeeded') {
        alert(`✅ ¡Paquete comprado exitosamente!\n\n${packageInfo.name}\nCliente: ${customerInfo.firstName} ${customerInfo.lastName}\nEmail: ${customerInfo.email}\n\nAhora puedes usar tus ${packageInfo.classes} clases cuando quieras.`)
        navigate('/packages')
      } else {
        alert(`⚠️ Compra guardada pero el estado del pago es: ${paymentStatus}\n\nRevisa el panel de administración para más detalles.`)
      }
    } catch (error) {
      console.error('Error al procesar la compra:', error)
      alert(`Error: ${error.message || 'Error desconocido. Por favor intenta de nuevo.'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  if (isCheckingAuth || !packageInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-h2 font-heading text-body mb-4">
            Cargando...
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="wellness-background min-h-screen">
      <div className="wellness-shapes">
        <div className="wellness-shape shape-1"></div>
        <div className="wellness-shape shape-2"></div>
        <div className="wellness-shape shape-3"></div>
        <div className="wellness-shape shape-4"></div>
        <div className="wellness-shape shape-5"></div>
      </div>
      <div className="wellness-content">
        <header className="relative z-10 mt-20 border-b"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5B3B0',
                  boxShadow: '0 2px 8px rgba(183, 61, 55, 0.05)'
                }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
              onClick={() => navigate('/packages')}
              className="text-primary hover:text-secondary mb-6 flex items-center font-body transition-colors duration-300"
              style={{ color: '#B73D37' }}
              onMouseEnter={(e) => e.target.style.color = '#C76661'}
              onMouseLeave={(e) => e.target.style.color = '#B73D37'}
            >
              ← Volver
            </button>
            <div className="flex flex-col">
              <div className="inline-block mb-4">
                <div className="w-16 h-1 rounded-full" style={{ backgroundColor: '#D48D88' }}></div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-body">
                Comprar {packageInfo.name}
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="bg-white rounded-lg p-6 md:p-8 border-2"
               style={{ 
                 borderColor: '#E5B3B0',
                 boxShadow: '0 8px 32px rgba(183, 61, 55, 0.1)'
               }}>
            {/* Información del paquete */}
            <div className="mb-8 pb-8 border-b" style={{ borderColor: '#E5B3B0' }}>
              <h2 className="text-2xl font-heading font-bold mb-4" style={{ color: '#1F2937' }}>
                {packageInfo.name}
              </h2>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-heading font-bold" style={{ color: '#B73D37' }}>
                  ${packageInfo.price.toLocaleString()}
                </span>
                <span className="text-lg font-body" style={{ color: '#6B7280' }}>
                  MXN
                </span>
              </div>
              {packageInfo.originalPrice && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-body line-through" style={{ color: '#9CA3AF' }}>
                    ${packageInfo.originalPrice.toLocaleString()} MXN
                  </span>
                  <span className="text-sm font-body font-semibold px-2 py-1 rounded"
                        style={{ backgroundColor: '#FEE2E2', color: '#B73D37' }}>
                    Ahorra ${(packageInfo.originalPrice - packageInfo.price).toLocaleString()}
                  </span>
                </div>
              )}
              <p className="text-body font-body mb-4" style={{ color: '#4B5563' }}>
                {packageInfo.description}
              </p>
              <div className="mt-4">
                <h3 className="text-sm font-heading font-semibold mb-2" style={{ color: '#1F2937' }}>
                  Beneficios:
                </h3>
                <ul className="space-y-2">
                  {packageInfo.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span className="text-sm font-body" style={{ color: '#4B5563' }}>
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Información del cliente */}
            <div className="mb-8">
              <h3 className="text-h3 font-heading text-body mb-4">
                Información de contacto
              </h3>
              
              {/* Mostrar mensaje de confirmación solo si TODA la información está completa Y el teléfono es válido */}
              {isAuthenticated() && customerInfo.firstName && customerInfo.lastName && customerInfo.email && isValidPhone(customerInfo.phone) ? (
                <div className="rounded-lg p-4 border-2 mb-4"
                     style={{ 
                       backgroundColor: '#f0fdf4',
                       borderColor: '#86efac',
                       boxShadow: '0 2px 8px rgba(34, 197, 94, 0.1)'
                     }}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">✓</span>
                    <div>
                      <p className="text-sm font-body font-semibold mb-1" style={{ color: '#166534' }}>
                        Información de contacto confirmada
                      </p>
                      <p className="text-xs font-body" style={{ color: '#15803d' }}>
                        {customerInfo.firstName} {customerInfo.lastName} • {customerInfo.email} • {customerInfo.phone}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
              
              {/* Campos de entrada */}
              <div className="rounded-lg p-6 border-2 mb-4"
                   style={{ 
                     backgroundColor: '#faf9f9',
                     borderColor: '#E5B3B0',
                     boxShadow: '0 2px 8px rgba(183, 61, 55, 0.05)'
                   }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre - Solo mostrar si falta o no está autenticado */}
                  {(!isAuthenticated() || !customerInfo.firstName) && (
                    <div>
                      <label className="block text-body font-body font-medium mb-2">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        placeholder="Juan"
                        value={customerInfo.firstName}
                        onChange={(e) => handleCustomerInfoChange('firstName', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-body text-body transition-all duration-300"
                        style={{ 
                          borderColor: '#DED5D5',
                          backgroundColor: '#FFFFFF'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#B73D37'}
                        onBlur={(e) => e.target.style.borderColor = '#DED5D5'}
                        required
                      />
                    </div>
                  )}
                  
                  {/* Apellido - Solo mostrar si falta o no está autenticado */}
                  {(!isAuthenticated() || !customerInfo.lastName) && (
                    <div>
                      <label className="block text-body font-body font-medium mb-2">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        placeholder="Pérez"
                        value={customerInfo.lastName}
                        onChange={(e) => handleCustomerInfoChange('lastName', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-body text-body transition-all duration-300"
                        style={{ 
                          borderColor: '#DED5D5',
                          backgroundColor: '#FFFFFF'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#B73D37'}
                        onBlur={(e) => e.target.style.borderColor = '#DED5D5'}
                        required
                      />
                    </div>
                  )}
                  
                  {/* Email - Solo mostrar si falta o no está autenticado */}
                  {(!isAuthenticated() || !customerInfo.email) && (
                    <div>
                      <label className="block text-body font-body font-medium mb-2">
                        Correo electrónico *
                      </label>
                      <input
                        type="email"
                        placeholder="juan.perez@email.com"
                        value={customerInfo.email}
                        onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-body text-body transition-all duration-300"
                        style={{ 
                          borderColor: '#DED5D5',
                          backgroundColor: '#FFFFFF'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#B73D37'}
                        onBlur={(e) => e.target.style.borderColor = '#DED5D5'}
                        required
                      />
                    </div>
                  )}
                  
                  {/* Teléfono - SIEMPRE visible y editable */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-body font-body font-medium">
                        Teléfono *
                      </label>
                      <span className="text-xs font-body" style={{ color: '#6B7280' }}>
                        {(() => {
                          const phoneValue = customerInfo.phone || ''
                          const currentDigits = phoneValue.replace(/[^0-9]/g, '').length
                          return `${currentDigits} dígitos`
                        })()}
                      </span>
                    </div>
                    <input
                      key="phone-input-field"
                      type="tel"
                      placeholder="+1 555 123 4567 o +52 55 1234 5678"
                      value={customerInfo.phone || ''}
                      onChange={(e) => {
                        // Permitir solo números, espacios, guiones y el símbolo +
                        const v = e.target.value.replace(/[^0-9+-\s]/gi, '')
                        handleCustomerInfoChange('phone', v)
                      }}
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-body text-body transition-all duration-300"
                      style={{ 
                        borderColor: '#DED5D5',
                        backgroundColor: '#FFFFFF',
                        pointerEvents: 'auto',
                        cursor: 'text'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#B73D37'}
                      onBlur={(e) => e.target.style.borderColor = '#DED5D5'}
                      required
                      autoComplete="tel"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario de tarjeta usando Stripe Elements */}
            <div className="mb-8">
              <h3 className="text-h3 font-heading text-body mb-4">
                Información de pago
              </h3>
              <div className="rounded-lg p-6 border-2"
                   style={{ 
                     backgroundColor: '#faf9f9',
                     borderColor: '#D48D88',
                     boxShadow: '0 2px 8px rgba(212, 141, 136, 0.08)'
                   }}>
                <div className="mb-6">
                  <label className="block text-body font-body font-medium mb-2">
                    Método de pago *
                  </label>
                  <div className="rounded-lg p-4 border-2"
                       style={{ 
                         borderColor: '#DED5D5',
                         backgroundColor: '#FFFFFF'
                       }}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="payment-card"
                        name="paymentMethod"
                        value="card"
                        checked={true}
                        readOnly
                        className="w-4 h-4"
                        style={{ accentColor: '#B73D37' }}
                      />
                      <label htmlFor="payment-card" className="flex items-center gap-2 cursor-pointer flex-1">
                        <span className="text-2xl">💳</span>
                        <span className="font-body text-body">Tarjeta de Crédito/Débito</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <StripeCardElement
                  onCardReady={setStripeCardData}
                  cardholderName={cardholderName}
                  setCardholderName={setCardholderName}
                />
                
                <div className="pt-2 mt-4">
                  <p className="text-xs text-body font-body mb-2">Tarjetas aceptadas:</p>
                  <div className="flex gap-2">
                    <span className="text-2xl">💳</span>
                    <span className="text-2xl">🔵</span>
                    <span className="text-2xl">⚫</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div className="mb-8 pt-6 border-t" style={{ borderColor: '#E5B3B0' }}>
              <div className="rounded-lg p-6 border-2"
                   style={{ 
                     backgroundColor: '#faf9f9',
                     borderColor: '#E5B3B0',
                     boxShadow: '0 2px 8px rgba(183, 61, 55, 0.05)'
                   }}>
                <h3 className="text-h5 font-heading text-body mb-4">
                  Resumen de tu compra
                </h3>
                <div className="space-y-2 text-body font-body">
                  <p>
                    <span className="font-medium">Paquete:</span> {packageInfo.name}
                  </p>
                  <p>
                    <span className="font-medium">Clases incluidas:</span> {packageInfo.classes}
                  </p>
                  <p>
                    <span className="font-medium">Cliente:</span> {customerInfo.firstName} {customerInfo.lastName}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {customerInfo.email}
                  </p>
                  <p>
                    <span className="font-medium">Teléfono:</span> {customerInfo.phone}
                  </p>
                  <p className="pt-2 border-t" style={{ borderColor: '#E5B3B0' }}>
                    <span className="font-medium">Total:</span>{' '}
                    <span className="text-2xl font-bold" style={{ color: '#B73D37' }}>
                      ${packageInfo.price.toLocaleString()} MXN
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Botón de pagar */}
            {(() => {
              // Verificar condiciones para mostrar el botón
              const hasCustomerInfo = customerInfo.firstName && customerInfo.lastName && customerInfo.email && isValidPhone(customerInfo.phone)
              const hasStripeInfo = stripeCardData && stripeCardData.isComplete && cardholderName
              
              // Debug: Log de las condiciones
              console.log('🔍 Condiciones para botón de pagar:', {
                hasCustomerInfo,
                customerInfo: {
                  firstName: !!customerInfo.firstName,
                  lastName: !!customerInfo.lastName,
                  email: !!customerInfo.email,
                  phone: isValidPhone(customerInfo.phone),
                  phoneValue: customerInfo.phone
                },
                hasStripeInfo,
                stripeCardData: !!stripeCardData,
                stripeIsComplete: stripeCardData?.isComplete,
                cardholderName: !!cardholderName
              })
              
              const canShowButton = hasCustomerInfo && hasStripeInfo
              
              if (!canShowButton) {
                // Mostrar mensaje indicando qué falta
                if (hasCustomerInfo && (!stripeCardData || !stripeCardData.isComplete || !cardholderName)) {
                  return (
                    <div className="mb-4 p-4 rounded-lg border-2"
                         style={{ 
                           backgroundColor: '#fef3c7',
                           borderColor: '#fbbf24',
                         }}>
                      <p className="text-sm font-body text-center" style={{ color: '#92400e' }}>
                        Por favor completa la información de la tarjeta para continuar
                      </p>
                    </div>
                  )
                }
                
                // Si falta información del cliente
                const missingFields = []
                if (!customerInfo.firstName) missingFields.push('Nombre')
                if (!customerInfo.lastName) missingFields.push('Apellido')
                if (!customerInfo.email) missingFields.push('Correo electrónico')
                if (!isValidPhone(customerInfo.phone)) {
                  const phoneDigits = customerInfo.phone ? customerInfo.phone.replace(/[^0-9]/g, '').length : 0
                  if (phoneDigits === 0) {
                    missingFields.push('Teléfono')
                  } else {
                    missingFields.push('Teléfono (mínimo 10 dígitos)')
                  }
                }
                
                if (missingFields.length > 0) {
                  return (
                    <div className="mb-4 p-4 rounded-lg border-2"
                         style={{ 
                           backgroundColor: '#fee2e2',
                           borderColor: '#fca5a5',
                         }}>
                      <p className="text-sm font-body text-center" style={{ color: '#991b1b' }}>
                        Por favor completa: {missingFields.join(', ')}
                      </p>
                    </div>
                  )
                }
                
                return null
              }
              
              return (
                <div className="mb-4">
                  <button
                    onClick={handlePurchase}
                    disabled={isProcessing}
                    className="w-full py-4 rounded-lg text-lg font-semibold transition-all shadow-xl font-body disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    style={{ 
                      background: 'linear-gradient(135deg, #B73D37 0%, #8B2E29 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      boxShadow: '0 10px 25px rgba(183, 61, 55, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isProcessing) {
                        e.target.style.background = 'linear-gradient(135deg, #C76661 0%, #B73D37 100%)'
                        e.target.style.boxShadow = '0 12px 30px rgba(183, 61, 55, 0.4)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isProcessing) {
                        e.target.style.background = 'linear-gradient(135deg, #B73D37 0%, #8B2E29 100%)'
                        e.target.style.boxShadow = '0 10px 25px rgba(183, 61, 55, 0.3)'
                      }
                    }}
                  >
                    {isProcessing ? 'Procesando pago...' : `Pagar $${packageInfo.price.toLocaleString()} MXN`}
                  </button>
                  <p className="text-xs text-body font-body text-center mt-2 opacity-75">
                    Al hacer clic, procesaremos tu pago de forma segura
                  </p>
                </div>
              )
            })()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default PackagePurchase
