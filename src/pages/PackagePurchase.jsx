import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { createPaymentIntent, validatePackageDiscountCode } from '../services/bookingService'
import { getCurrentUser, isAuthenticated } from '../services/authService'
import { trackMetaLead } from '../utils/metaPixel'
import StripeCardElement from '../components/StripeCardElement'
import { PACKAGE_OFFERS } from '../data/packageOffers'
import { shouldShowProposalPlans } from '../config/proposalPlans'

import { BACKEND_URL } from '../config/api.js'

const packages = PACKAGE_OFFERS

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

  // Código de descuento (porcentaje) y nombre de quien refirió
  const [discountCodeInput, setDiscountCodeInput] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(null) // { code, percent, label }
  const [discountError, setDiscountError] = useState('')
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false)
  const [referredBy, setReferredBy] = useState('')

  const handleApplyDiscountCode = async () => {
    setDiscountError('')
    if (!discountCodeInput.trim()) {
      setDiscountError('Escribe un código de descuento.')
      return
    }
    setIsValidatingDiscount(true)
    try {
      const result = await validatePackageDiscountCode(discountCodeInput)
      setAppliedDiscount({ code: result.code, percent: result.percent, label: result.label })
    } catch (err) {
      setAppliedDiscount(null)
      setDiscountError(err.message || 'No se pudo aplicar el código.')
    } finally {
      setIsValidatingDiscount(false)
    }
  }

  const handleRemoveDiscountCode = () => {
    setAppliedDiscount(null)
    setDiscountCodeInput('')
    setDiscountError('')
  }

  useEffect(() => {
    // El detalle del paquete es PÚBLICO: no se exige login para verlo. El login
    // se pide solo al presionar "Comprar" (ver botón más abajo).
    const pkg = packages.find(p => p.id === id)
    if (!pkg) {
      navigate('/packages')
      return
    }
    // Blindaje: un plan en propuesta solo es visible/comprable con preview activo
    // (o si ya se hizo público). Evita accesos del público por deep-link.
    if (pkg.isProposal && !shouldShowProposalPlans()) {
      navigate('/packages')
      return
    }
    setPackageInfo(pkg)
    setIsCheckingAuth(false)

    // Si no hay sesión, no precargamos datos: se pedirá al comprar.
    if (!isAuthenticated()) return

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
      // Precio del paquete con descuento (si aplica), en centavos
      const finalPrice = appliedDiscount
        ? Math.max(0, Math.round(packageInfo.price * (1 - appliedDiscount.percent / 100)))
        : packageInfo.price
      const amount = finalPrice * 100 // precio en centavos (ej. $2,250 = 225000)
      
      // Crear Payment Intent con Stripe
      let paymentIntent
      try {
        paymentIntent = await createPaymentIntent(amount, 'mxn', {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone
        }, {
          // Permite que el webhook registre el paquete como respaldo si el navegador falla.
          purchase_type: 'package',
          package_name: packageInfo.name,
          package_id: packageInfo.id,
          // Para que el servidor pueda verificar que `amount` sí corresponde al
          // precio con descuento, no confiar en el monto que manda el navegador.
          discount_code: appliedDiscount?.code || '',
          referred_by: referredBy?.trim() || '',
        })
      } catch (paymentError) {
        console.error('Error al crear Payment Intent:', paymentError)
        if (paymentError.message.includes('fetch') || paymentError.message.includes('Failed to fetch')) {
          alert('⚠️ No se pudo conectar con el servidor de pagos. Intenta de nuevo en unos minutos.')
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
        discountCode: appliedDiscount ? appliedDiscount.code : null,
        discountPercent: appliedDiscount ? appliedDiscount.percent : null,
        referredBy: referredBy?.trim() || null,
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
      let saveFailed = false
      let saveErrorMsg = ''
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`${BACKEND_URL}/api/packages/purchase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(packagePurchase)
        })

        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          throw new Error(error.error || 'Error al guardar la compra del paquete')
        }
      } catch (saveError) {
        console.error('Error guardando compra:', saveError)
        saveFailed = true
        saveErrorMsg = saveError.message || 'Error desconocido'
      }

      if (stripeError) {
        alert(`⚠️ Compra guardada pero el pago requiere atención.\n\nPaquete: ${packageInfo.name}\nCliente: ${customerInfo.firstName} ${customerInfo.lastName}\n\nError: ${stripeError.message}`)
      } else if (paymentStatus === 'succeeded') {
        trackMetaLead({ content_name: 'compra_paquete', value: finalPrice || 0, currency: 'MXN' })
        if (saveFailed) {
          // El pago SÍ se realizó. Si el registro directo falló, el respaldo por webhook
          // del servidor lo registra igual. No mostramos un "éxito" falso: avisamos con honestidad.
          alert(`✅ Tu pago se realizó correctamente.\n\nPaquete: ${packageInfo.name}\nCliente: ${customerInfo.firstName} ${customerInfo.lastName}\nEmail: ${customerInfo.email}\n\n⚠️ Hubo un detalle al mostrar tu paquete al instante, pero tu pago quedó registrado y tu paquete se activará en unos minutos. Si en un par de horas no ves tus clases, escríbenos a info@estudiopopnest.com con tu nombre y te lo activamos de inmediato.`)
        } else {
          alert(`✅ ¡Paquete comprado exitosamente!\n\n${packageInfo.name}\nCliente: ${customerInfo.firstName} ${customerInfo.lastName}\nEmail: ${customerInfo.email}\n\n${packageInfo.unlimited ? 'Ya puedes reservar clases ilimitadas durante tu mes.' : `Ahora puedes usar tus ${packageInfo.classes} clases cuando quieras.`}`)
        }
        navigate('/packages')
      } else {
        alert(`⚠️ El estado del pago es: ${paymentStatus}\n\nSi se te hizo un cargo, escríbenos a info@estudiopopnest.com y lo revisamos.`)
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

  // Precio final mostrado (con descuento porcentual si hay un código aplicado)
  const finalPrice = appliedDiscount
    ? Math.max(0, Math.round(packageInfo.price * (1 - appliedDiscount.percent / 100)))
    : packageInfo.price

  return (
    <div className="pkg-page pkg-page--with-site-nav">
      <div className="pkg-shell" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
        <header style={{ paddingTop: '24px' }}>
          <button
            type="button"
            onClick={() => navigate('/packages')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'var(--pn-color-primary)',
              fontSize: '15px',
              marginBottom: '16px',
            }}
          >
            ← Volver a planes
          </button>
          <h1 className="pn-h1">{packageInfo.name}</h1>
        </header>

        <main style={{ maxWidth: '760px', margin: '0 auto', padding: '24px 0 56px' }}>
          <div
            style={{
              background: 'var(--pn-color-bg-elevated)',
              borderRadius: '18px',
              padding: '28px',
              border: '1px solid #e7ddd6',
            }}
          >
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
              {packageInfo.originalPrice > 0 && (
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

            {/* Compra: el detalle es público; el login se pide AQUÍ, al comprar. */}
            {!isAuthenticated() && (
              <div style={{ marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => navigate(`/signup?from=/booking/package/${packageInfo.id}`)}
                  className="pn-btn pn-btn--primary pn-btn--block"
                >
                  Comprar {packageInfo.name}
                </button>
                <p style={{ marginTop: '14px', textAlign: 'center', fontSize: '14px', color: 'var(--pn-color-text-subtle)' }}>
                  Crea tu cuenta o{' '}
                  <button
                    type="button"
                    onClick={() => navigate(`/login?from=/booking/package/${packageInfo.id}`)}
                    style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', textDecoration: 'underline', color: 'var(--pn-color-primary)', cursor: 'pointer' }}
                  >
                    inicia sesión
                  </button>{' '}
                  para completar tu compra de forma segura.
                </p>
              </div>
            )}

            {isAuthenticated() && (
            <>
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

            {/* Código de descuento y referido */}
            <div className="mb-8">
              <h3 className="text-h3 font-heading text-body mb-4">
                Descuento y referido
              </h3>
              <div className="rounded-lg p-6 border-2 space-y-6"
                   style={{
                     backgroundColor: '#faf9f9',
                     borderColor: '#E5B3B0',
                     boxShadow: '0 2px 8px rgba(183, 61, 55, 0.05)'
                   }}>
                {/* Código de descuento */}
                <div>
                  <label className="block text-body font-body font-medium mb-2">
                    Código de descuento
                  </label>
                  {appliedDiscount ? (
                    <div className="rounded-lg p-4 border-2 flex flex-wrap items-center justify-between gap-3"
                         style={{ borderColor: '#B73D37', backgroundColor: '#FEE2E2' }}>
                      <p className="text-sm font-body text-body m-0">
                        <strong>{appliedDiscount.code}</strong> aplicado — {appliedDiscount.label}
                      </p>
                      <button
                        type="button"
                        onClick={handleRemoveDiscountCode}
                        className="text-sm font-body underline"
                        style={{ color: '#B73D37' }}
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          placeholder="Ej. POPNEST20"
                          value={discountCodeInput}
                          onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                          className="flex-1 px-4 py-3 rounded-lg border-2 focus:outline-none font-body text-body uppercase transition-all duration-300"
                          style={{ borderColor: '#DED5D5', backgroundColor: '#FFFFFF' }}
                          onFocus={(e) => e.target.style.borderColor = '#B73D37'}
                          onBlur={(e) => e.target.style.borderColor = '#DED5D5'}
                        />
                        <button
                          type="button"
                          onClick={handleApplyDiscountCode}
                          disabled={isValidatingDiscount}
                          className="px-6 py-3 rounded-lg font-body font-semibold transition-colors disabled:opacity-50"
                          style={{ backgroundColor: '#B73D37', color: '#FFFFFF' }}
                        >
                          {isValidatingDiscount ? 'Validando…' : 'Aplicar'}
                        </button>
                      </div>
                      {discountError && (
                        <p className="text-sm font-body mt-2" style={{ color: '#B73D37' }}>
                          {discountError}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Nombre de quien refirió */}
                <div>
                  <label className="block text-body font-body font-medium mb-2">
                    Nombre de la persona que te refirió (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Ana García"
                    value={referredBy}
                    onChange={(e) => setReferredBy(e.target.value)}
                    maxLength={120}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-body text-body transition-all duration-300"
                    style={{ borderColor: '#DED5D5', backgroundColor: '#FFFFFF' }}
                    onFocus={(e) => e.target.style.borderColor = '#B73D37'}
                    onBlur={(e) => e.target.style.borderColor = '#DED5D5'}
                  />
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
                    <span className="font-medium">Clases incluidas:</span> {packageInfo.unlimited ? 'Ilimitadas' : packageInfo.classes}
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
                  {appliedDiscount && (
                    <p>
                      <span className="font-medium">Descuento ({appliedDiscount.code}):</span>{' '}
                      <span style={{ color: '#B73D37' }}>
                        −{appliedDiscount.percent}% (−${(packageInfo.price - finalPrice).toLocaleString()} MXN)
                      </span>
                    </p>
                  )}
                  <p className="pt-2 border-t" style={{ borderColor: '#E5B3B0' }}>
                    <span className="font-medium">Total:</span>{' '}
                    {appliedDiscount && (
                      <span className="text-lg font-body line-through mr-2" style={{ color: '#9CA3AF' }}>
                        ${packageInfo.price.toLocaleString()}
                      </span>
                    )}
                    <span className="text-2xl font-bold" style={{ color: '#B73D37' }}>
                      ${finalPrice.toLocaleString()} MXN
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
                    {isProcessing ? 'Procesando pago...' : `Pagar $${finalPrice.toLocaleString()} MXN`}
                  </button>
                  <p className="text-xs text-body font-body text-center mt-2 opacity-75">
                    Al hacer clic, procesaremos tu pago de forma segura
                  </p>
                </div>
              )
            })()}
            </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default PackagePurchase
