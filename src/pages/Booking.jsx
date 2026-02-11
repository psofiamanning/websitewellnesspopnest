import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { teachers, classTypes, classSchedules, teacherSchedules } from '../data/classes'
import Calendar from '../components/Calendar'
import TimeSlotSelector from '../components/TimeSlotSelector'
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { saveBooking, createPaymentIntent, confirmBooking, confirmPayment, checkAvailability, getUserPackages } from '../services/bookingService'
import { getCurrentUser, isAuthenticated } from '../services/authService'
import StripeCardElement from '../components/StripeCardElement'

// Función para cargar Stripe dinámicamente (solo si está instalado)
// Esta función maneja el caso cuando Stripe no está instalado
const loadStripe = async () => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
  
  if (!publishableKey) {
    console.warn('⚠️ Stripe Publishable Key no configurada. Configura VITE_STRIPE_PUBLISHABLE_KEY en .env')
    return null
  }
  
  // Intentar cargar Stripe solo si está disponible
  // Usamos una función que verifica si el módulo existe antes de importarlo
  try {
    // Intentar importar Stripe dinámicamente
    // Usamos @vite-ignore para evitar que Vite intente resolverlo en tiempo de compilación
    // Si el módulo no existe, el catch lo manejará
    const stripeModule = await import(/* @vite-ignore */ '@stripe/stripe-js').catch(() => null)
    
    if (!stripeModule || !stripeModule.loadStripe) {
      console.warn('⚠️ @stripe/stripe-js no está instalado. Ejecuta: npm install @stripe/stripe-js')
      return null
    }
    
    const { loadStripe: loadStripeJS } = stripeModule
    return await loadStripeJS(publishableKey)
  } catch (error) {
    // Cualquier error significa que Stripe no está disponible
    console.warn('⚠️ Stripe no está disponible. Continuando en modo simulación.')
    console.warn('   Para habilitar Stripe: npm install @stripe/stripe-js')
    return null
  }
}

function Booking() {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedClassId, setSelectedClassId] = useState(null) // Nueva: clase seleccionada cuando es profesor
  const [availableDates, setAvailableDates] = useState([])
  const [availableTimes, setAvailableTimes] = useState([])
  
  // Estado para información del cliente
  const [customerInfo, setCustomerInfo] = useState(() => {
    const user = getCurrentUser()
    return {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || ''
    }
  })
  
  // Estado para información de tarjeta (ahora usando Stripe Elements)
  const [cardholderName, setCardholderName] = useState('')
  const [stripeCardData, setStripeCardData] = useState(null) // { stripe, elements, isComplete, error }
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [userPackages, setUserPackages] = useState(null)
  const [selectedPackageId, setSelectedPackageId] = useState(null)
  const [usePackage, setUsePackage] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Obtener información según el tipo (profesor o clase)
  const teacherInfo = type === 'teacher' ? teachers.find(t => t.id === parseInt(id)) : null
  const classInfo = type === 'class' ? classTypes.find(c => c.id === id) : null
  const selectedClassInfo = selectedClassId ? classTypes.find(c => c.id === selectedClassId) : null
  
  // bookingInfo será la clase seleccionada si es profesor, o la clase directa si es clase
  const bookingInfo = type === 'teacher' 
    ? (selectedClassInfo || teacherInfo)
    : classInfo

  // Obtener horarios disponibles - solo cuando hay una clase seleccionada
  useEffect(() => {
    // Si es profesor y no hay clase seleccionada, no hacer nada
    if (type === 'teacher' && !selectedClassId) {
      setAvailableDates([])
      setAvailableTimes([])
      return
    }

    // Si es clase directa o ya hay clase seleccionada del profesor
    const classId = type === 'teacher' ? selectedClassId : id
    if (!classId) return

    const schedule = classSchedules[classId]
    if (!schedule) return

    // Generar fechas disponibles para las próximas 4 semanas
    const today = new Date()
    const endDate = addDays(today, 28)
    const allDays = eachDayOfInterval({ start: today, end: endDate })
    
    // Filtrar días según los días disponibles de la clase
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const availableDays = schedule.days || []
    
    const dates = allDays.filter(date => {
      const dayName = dayNames[date.getDay()]
      return availableDays.includes(dayName)
    })

    setAvailableDates(dates)
    setAvailableTimes(schedule.times || [])
  }, [type, id, selectedClassId])

  // Horarios por día (ej. Sound Healing: sábado solo 10:00)
  useEffect(() => {
    const classId = type === 'teacher' ? selectedClassId : id
    if (!classId) return
    const schedule = classSchedules[classId]
    if (!schedule?.timesByDay) return
    if (!selectedDate) {
      setAvailableTimes(schedule.times || [])
      return
    }
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const dayName = dayNames[selectedDate.getDay()]
    const timesForDay = schedule.timesByDay[dayName]
    if (timesForDay) setAvailableTimes(timesForDay)
  }, [selectedDate, type, id, selectedClassId])

  // Resetear fecha y hora cuando cambia la clase seleccionada
  useEffect(() => {
    if (selectedClassId) {
      setSelectedDate(null)
      setSelectedTime(null)
    }
  }, [selectedClassId])

  // Cargar paquetes del usuario si está autenticado
  useEffect(() => {
    const loadUserPackages = async () => {
      if (isAuthenticated() && customerInfo.email) {
        try {
          const packagesData = await getUserPackages(customerInfo.email)
          setUserPackages(packagesData)
          // Si tiene paquetes activos, seleccionar el primero por defecto
          if (packagesData.hasActivePackages && packagesData.packages.length > 0) {
            setSelectedPackageId(packagesData.packages[0].id)
            setUsePackage(true)
          }
        } catch (error) {
          console.error('Error loading user packages:', error)
        }
      }
    }
    loadUserPackages()
  }, [customerInfo.email])

  // Resetear índice de imagen cuando cambia la clase
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [selectedClassId, type, id])

  const handleClassSelect = (classId) => {
    setSelectedClassId(classId)
    setSelectedDate(null)
    setSelectedTime(null)
    setCardholderName('')
    setStripeCardData(null)
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setSelectedTime(null) // Resetear hora al cambiar fecha
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
    // Resetear información de tarjeta al cambiar hora
    setCardholderName('')
    setStripeCardData(null)
  }
  
  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBooking = async () => {
    // Validar que haya clase seleccionada si es profesor
    if (type === 'teacher' && !selectedClassId) {
      alert('Por favor selecciona una clase primero')
      return
    }
    
    if (!selectedDate || !selectedTime) {
      alert('Por favor selecciona una fecha y hora')
      return
    }
    
    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !customerInfo.phone) {
      alert('Por favor completa toda la información de contacto')
      return
    }
    
    // Si está usando paquete, no requiere tarjeta
    if (!usePackage) {
      if (!stripeCardData || !stripeCardData.isComplete || !cardholderName) {
        alert('Por favor completa la información de la tarjeta o selecciona usar un paquete')
        return
      }
      
      if (stripeCardData.error) {
        alert(`Error en la tarjeta: ${stripeCardData.error.message}`)
        return
      }
    } else {
      // Validar que tenga un paquete seleccionado
      if (!selectedPackageId) {
        alert('Por favor selecciona un paquete para usar')
        return
      }
    }

    setIsProcessing(true)

    try {
      // Verificar disponibilidad antes de procesar el pago
      const className = selectedClassInfo ? selectedClassInfo.name : bookingInfo.name
      const dateString = format(selectedDate, 'yyyy-MM-dd')
      
      try {
        const availability = await checkAvailability(className, dateString, selectedTime)
        if (!availability.available) {
          setIsProcessing(false)
          alert(`⚠️ Lo sentimos, esta clase ya tiene ${availability.maxBookings} reservaciones para esta fecha y hora. Por favor selecciona otra fecha u hora.\n\nLugares disponibles: ${availability.remainingSpots}`)
          return
        }
        if (availability.remainingSpots <= 2) {
          // Advertir si quedan pocos lugares
          const confirm = window.confirm(`⚠️ Solo quedan ${availability.remainingSpots} lugar(es) disponible(s) para esta clase. ¿Deseas continuar con la reserva?`)
          if (!confirm) {
            setIsProcessing(false)
            return
          }
        }
      } catch (availabilityError) {
        console.warn('Error verificando disponibilidad:', availabilityError)
        // Continuar de todas formas, el backend lo validará
      }
      
      // Si está usando paquete, saltar el proceso de pago
      let paymentStatus = 'succeeded'
      let stripeError = null
      let paymentIntent = null
      
      if (!usePackage) {
        // Precio de la clase (puedes obtenerlo de bookingInfo si lo tienes)
        const amount = 3000 // $30.00 MXN en centavos
        
        // Crear Payment Intent con Stripe (incluyendo información del cliente)
        try {
          paymentIntent = await createPaymentIntent(amount, 'mxn', {
            firstName: customerInfo.firstName,
            lastName: customerInfo.lastName,
            email: customerInfo.email,
            phone: customerInfo.phone
          })
        } catch (paymentError) {
          console.error('Error al crear Payment Intent:', paymentError)
          // Verificar si es un error de conexión
          if (paymentError.message.includes('fetch') || paymentError.message.includes('Failed to fetch')) {
            alert('⚠️ No se pudo conectar con el servidor de pagos. Por favor verifica que el backend esté corriendo en http://localhost:3002')
          } else {
            alert(`⚠️ Error al crear el intento de pago: ${paymentError.message}`)
          }
          setIsProcessing(false)
          return
        }
        
        // Procesar pago con Stripe Elements
        if (stripeCardData && stripeCardData.stripe && stripeCardData.elements && paymentIntent.clientSecret) {
          try {
            const { stripe, elements } = stripeCardData
          
          // Obtener el CardElement
          const cardElement = elements.getElement('card')
          
          if (!cardElement) {
            throw new Error('CardElement no encontrado. Por favor completa la información de la tarjeta.')
          }

          // Verificar que el CardElement esté completo
          if (!stripeCardData.isComplete) {
            throw new Error('Por favor completa toda la información de la tarjeta antes de continuar.')
          }

          // Verificar que tenemos el clientSecret válido
          if (!paymentIntent.clientSecret || !paymentIntent.clientSecret.startsWith('pi_')) {
            throw new Error('No se pudo obtener el secreto del intento de pago. Por favor intenta de nuevo.')
          }

          // Confirmar el pago directamente con el CardElement
          // Según la documentación de Stripe, confirmCardPayment puede recibir el CardElement directamente
          console.log('🔵 Confirmando pago con CardElement...')
          console.log('   PaymentIntent ID:', paymentIntent.paymentIntentId)
          console.log('   ClientSecret:', paymentIntent.clientSecret?.substring(0, 20) + '...')
          console.log('   CardElement completo:', stripeCardData.isComplete)
          console.log('   CardElement error:', stripeCardData.error)
          
          try {
            // Usar confirmCardPayment con el CardElement directamente
            // Stripe manejará la creación del PaymentMethod internamente
            console.log('🔵 Llamando confirmCardPayment con:', {
              clientSecret: paymentIntent.clientSecret?.substring(0, 30) + '...',
              hasCardElement: !!cardElement,
              cardElementComplete: stripeCardData.isComplete,
              cardholderName: cardholderName,
              customerEmail: customerInfo.email,
              paymentIntentId: paymentIntent.paymentIntentId
            })
            
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

            console.log('🔵 Resultado de confirmCardPayment:', {
              hasError: !!result.error,
              hasPaymentIntent: !!result.paymentIntent,
              paymentIntentStatus: result.paymentIntent?.status,
              paymentIntentId: result.paymentIntent?.id,
              errorCode: result.error?.code,
              errorMessage: result.error?.message,
              errorType: result.error?.type
            })

            if (result.error) {
              stripeError = result.error
              paymentStatus = 'pending'
              console.error('❌ Error al confirmar pago:', result.error)
              console.error('   Código:', result.error.code)
              console.error('   Tipo:', result.error.type)
              console.error('   Mensaje:', result.error.message)
              console.error('   PaymentIntent:', result.error.payment_intent)
              
              // Si hay un PaymentIntent en el error, puede ser que necesite acción adicional
              if (result.error.payment_intent) {
                const pi = result.error.payment_intent
                console.log('   PaymentIntent en error:', {
                  id: pi.id,
                  status: pi.status,
                  last_payment_error: pi.last_payment_error
                })
              }
            } else if (result.paymentIntent) {
              const piStatus = result.paymentIntent.status
              
              // Manejar diferentes estados del PaymentIntent
              if (piStatus === 'succeeded') {
                paymentStatus = 'succeeded'
                console.log('✅ Pago confirmado exitosamente:', {
                  status: piStatus,
                  id: result.paymentIntent.id
                })
              } else if (piStatus === 'requires_action') {
                // 3D Secure u otra autenticación requerida
                paymentStatus = 'pending'
                stripeError = {
                  message: 'Se requiere autenticación adicional. Por favor completa la verificación.',
                  type: 'card_error',
                  code: 'requires_action'
                }
                console.warn('⚠️ Pago requiere acción adicional (3D Secure):', {
                  status: piStatus,
                  id: result.paymentIntent.id,
                  next_action: result.paymentIntent.next_action
                })
              } else if (piStatus === 'processing') {
                paymentStatus = 'pending'
                console.log('⏳ Pago en procesamiento:', {
                  status: piStatus,
                  id: result.paymentIntent.id
                })
              } else {
                paymentStatus = 'pending'
                console.warn('⚠️ Estado inesperado del PaymentIntent:', {
                  status: piStatus,
                  id: result.paymentIntent.id
                })
              }
              
              // Guardar información del PaymentMethod si está disponible
              if (result.paymentIntent.payment_method) {
                try {
                  const pm = await stripe.paymentMethods.retrieve(result.paymentIntent.payment_method)
                  setStripeCardData(prev => ({
                    ...prev,
                    paymentMethod: pm
                  }))
                  console.log('✅ PaymentMethod recuperado:', {
                    id: pm.id,
                    last4: pm.card?.last4,
                    brand: pm.card?.brand
                  })
                } catch (pmError) {
                  console.warn('⚠️ No se pudo recuperar PaymentMethod:', pmError)
                }
              }
              
              // Actualizar el paymentIntentId con el ID confirmado
              if (result.paymentIntent.id) {
                paymentIntent.paymentIntentId = result.paymentIntent.id
              }
            } else {
              console.warn('⚠️ Resultado inesperado de confirmCardPayment:', result)
              paymentStatus = 'pending'
              stripeError = {
                message: 'Respuesta inesperada de Stripe',
                type: 'api_error',
                code: 'unexpected_response'
              }
            }
          } catch (confirmError) {
            console.error('❌ Excepción al confirmar pago:', confirmError)
            stripeError = {
              message: confirmError.message || 'Error desconocido al confirmar pago',
              type: 'exception',
              code: confirmError.code
            }
            paymentStatus = 'pending'
          }
        } catch (error) {
          console.error('❌ Error al procesar pago:', error)
          console.error('   Tipo:', error.type)
          console.error('   Código:', error.code)
          console.error('   Mensaje:', error.message)
          stripeError = { 
            message: error.message || 'Error desconocido al procesar el pago', 
            type: error.type || 'exception',
            code: error.code
          }
          paymentStatus = 'pending'
        }
        } else {
          console.warn('⚠️ Stripe Elements no disponible')
          paymentStatus = 'pending'
        }
      }

      // Guardar la reserva con información completa
      const bookingData = {
        type: type === 'teacher' ? 'profesor' : 'clase',
        className: selectedClassInfo ? selectedClassInfo.name : bookingInfo.name,
        teacherName: type === 'class' ? bookingInfo.teacher : (teacherInfo ? teacherInfo.name : bookingInfo.name),
        date: format(selectedDate, 'yyyy-MM-dd'),
        formattedDate: format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }),
        time: selectedTime,
        customer: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          fullName: `${customerInfo.firstName} ${customerInfo.lastName}`
        },
        paymentMethod: usePackage ? 'package' : 'card',
        packageId: usePackage ? selectedPackageId : null,
        payment: usePackage ? {
          method: 'Paquete de Clases',
          amount: 0,
          currency: 'MXN',
          status: 'succeeded'
        } : {
          method: 'Tarjeta de Crédito/Débito',
          amount: 15000,
          currency: 'MXN',
          cardLastFour: stripeCardData?.paymentMethod?.card?.last4 || '****',
          status: paymentStatus
        },
        stripeInfo: usePackage ? null : {
          paymentIntentId: paymentIntent?.paymentIntentId,
          clientSecret: paymentIntent?.clientSecret,
          amount: 15000,
          currency: 'mxn',
          error: stripeError ? stripeError.message : null
        }
      }

      // Si el pago fue exitoso en el frontend, simplemente guardar la reserva
      // No necesitamos confirmar de nuevo en el backend porque Stripe ya procesó el pago
      if (paymentStatus === 'succeeded' && !stripeError) {
        console.log('✅ Pago exitoso en el frontend, guardando reserva directamente')
        // El pago ya fue procesado por Stripe, solo guardamos la reserva
      } else if (paymentStatus === 'pending' && !stripeError) {
        console.warn('⚠️ Estado del pago es pending, pero no hay error. Guardando reserva de todas formas.')
      }

      // Guardar en el backend (o localStorage como fallback)
      // El backend validará nuevamente la disponibilidad antes de guardar
      try {
        await saveBooking(bookingData)
        
        // Actualizar paquetes del usuario después de reservar
        if (usePackage && customerInfo.email) {
          const updatedPackages = await getUserPackages(customerInfo.email)
          setUserPackages(updatedPackages)
        }
      } catch (saveError) {
        // Si el error es de disponibilidad o de paquete, mostrar mensaje específico
        if (saveError.message && (
          saveError.message.includes('reservaciones') || 
          saveError.message.includes('disponible') ||
          saveError.message.includes('clases disponibles') ||
          saveError.message.includes('paquete')
        )) {
          setIsProcessing(false)
          alert(saveError.message)
          return
        }
        throw saveError
      }

      if (usePackage) {
        alert(`✅ ¡Reserva confirmada!\n\n${bookingData.type === 'profesor' ? 'Profesor' : 'Clase'}: ${bookingData.className}\nFecha: ${bookingData.formattedDate}\nHora: ${bookingData.time}\nCliente: ${bookingData.customer.fullName}\nEmail: ${bookingData.customer.email}\n\nSe usó una clase de tu paquete.`)
      } else if (stripeError) {
        const errorMessage = stripeError.message || 'Error desconocido'
        const errorType = stripeError.type || 'unknown'
        alert(`⚠️ Reserva guardada pero el pago requiere atención.\n\n${bookingData.type === 'profesor' ? 'Profesor' : 'Clase'}: ${bookingData.className}\nFecha: ${bookingData.formattedDate}\nHora: ${bookingData.time}\nCliente: ${bookingData.customer.fullName}\n\nError: ${errorMessage}\nTipo: ${errorType}\n\nRevisa la consola del navegador (F12) para más detalles o contacta al administrador.`)
      } else if (paymentStatus === 'succeeded') {
        alert(`✅ ¡Reserva confirmada y pagada!\n\n${bookingData.type === 'profesor' ? 'Profesor' : 'Clase'}: ${bookingData.className}\nFecha: ${bookingData.formattedDate}\nHora: ${bookingData.time}\nCliente: ${bookingData.customer.fullName}\nEmail: ${bookingData.customer.email}`)
      } else {
        alert(`⚠️ Reserva guardada pero el estado del pago es: ${paymentStatus}\n\n${bookingData.type === 'profesor' ? 'Profesor' : 'Clase'}: ${bookingData.className}\nFecha: ${bookingData.formattedDate}\nHora: ${bookingData.time}\nCliente: ${bookingData.customer.fullName}\n\nRevisa el panel de administración para más detalles.`)
      }
      
      navigate('/classes')
    } catch (error) {
      console.error('Error al procesar el pago:', error)
      console.error('Detalles del error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      
      // Mensaje de error más específico
      let errorMessage = 'Hubo un error al procesar el pago. Por favor intenta de nuevo.'
      
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        errorMessage = '⚠️ No se pudo conectar con el servidor. Por favor verifica que el backend esté corriendo en http://localhost:3002'
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`
      }
      
      alert(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  // Validar que exista el profesor o la clase
  if (type === 'teacher' && !teacherInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-h2 font-heading text-body mb-4">
            No se encontró el profesor solicitado
          </h2>
          <button
            onClick={() => navigate('/teachers')}
            className="text-primary hover:text-secondary font-body"
          >
            Volver a los profesores
          </button>
        </div>
      </div>
    )
  }

  if (type === 'class' && !classInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-h2 font-heading text-body mb-4">
            No se encontró la clase solicitada
          </h2>
          <button
            onClick={() => navigate('/classes')}
            className="text-primary hover:text-secondary font-body"
          >
            Volver a las clases
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="wellness-background">
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
            onClick={() => navigate(type === 'teacher' ? '/teachers' : '/classes')}
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
              Reservar {type === 'teacher' ? 'con' : ''} {type === 'teacher' ? teacherInfo?.name : bookingInfo.name}
            </h1>
            {type === 'teacher' && teacherInfo?.specialty && (
              <div className="mt-4">
                <span className="inline-block px-4 py-1.5 rounded-full"
                      style={{ 
                        backgroundColor: '#FEE2E2',
                        border: '1px solid #E5B3B0'
                      }}>
                  <span className="font-semibold text-xs font-body uppercase tracking-wide whitespace-nowrap" style={{ color: '#B73D37', letterSpacing: '0.05em' }}>
                    {teacherInfo.specialty}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="bg-white rounded-lg p-6 md:p-8 border-2"
             style={{ 
               borderColor: '#E5B3B0',
               boxShadow: '0 8px 32px rgba(183, 61, 55, 0.1)'
             }}>
          {/* Layout de dos columnas en desktop */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-start lg:overflow-visible">
            {/* Columna izquierda - Información y selección */}
            <div className="flex-1 w-full order-2 lg:order-1">
              {/* Información de la reserva - Solo cuando es tipo class y NO hay fecha seleccionada */}
              {type === 'class' && !selectedDate && (
                <div className="pb-6 border-b mb-6"
                     style={{ borderColor: '#E5B3B0' }}>
                  <h2 className="text-h2 font-heading text-body mb-4 text-center md:text-left">
                    Clase: {bookingInfo.name}
                  </h2>
                  <div className="text-body font-body space-y-3">
                    <div className="space-y-2">
                      <p style={{ color: '#6B7280' }}>
                        <span className="font-semibold" style={{ color: '#B73D37' }}>Profesor:</span> {bookingInfo.teacher}
                      </p>
                      <p style={{ color: '#6B7280' }}>
                        <span className="font-semibold" style={{ color: '#B73D37' }}>Duración:</span> {bookingInfo.duration} minutos
                      </p>
                    </div>
                    {bookingInfo.fullDescription && (
                      <div className="mt-6 pt-6 border-t" style={{ borderColor: '#E5B3B0' }}>
                        <h3 className="text-lg font-heading font-semibold mb-4" style={{ color: '#1F2937' }}>
                          Sobre esta práctica
                        </h3>
                        <div className="prose prose-sm max-w-none mb-6">
                          {bookingInfo.fullDescription.split('\n\n').map((paragraph, index) => (
                            paragraph.trim() && (
                              <p key={index} className="text-body font-body leading-relaxed mb-4" style={{ color: '#4B5563', lineHeight: '1.8' }}>
                                {paragraph.trim()}
                              </p>
                            )
                          ))}
                        </div>
                        {bookingInfo.image && (
                          <div className="mt-6">
                            {(() => {
                              // Para Tai Chi, usar múltiples imágenes (por ahora la misma, pero preparado para más)
                              const images = bookingInfo.id === 'tai-chi' 
                                ? [bookingInfo.image, bookingInfo.image, bookingInfo.image] 
                                : [bookingInfo.image]
                              
                              const nextImage = () => {
                                setCurrentImageIndex((prev) => (prev + 1) % images.length)
                              }
                              
                              const prevImage = () => {
                                setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
                              }
                              
                              return (
                                <div className="relative">
                                  <div 
                                    className="w-full rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl"
                                    style={{ 
                                      maxHeight: '500px',
                                      aspectRatio: '16/10'
                                    }}
                                    onClick={images.length > 1 ? nextImage : undefined}
                                  >
                                    <img
                                      src={images[currentImageIndex]}
                                      alt={`${bookingInfo.name} - Imagen ${currentImageIndex + 1}`}
                                      className="w-full h-full object-cover"
                                      style={{ 
                                        objectPosition: bookingInfo.id === 'sound-healing' 
                                          ? 'center top' 
                                          : bookingInfo.id === 'meditacion' 
                                            ? 'center center' 
                                            : 'center center'
                                      }}
                                    />
                                  </div>
                                  {images.length > 1 && (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          prevImage()
                                        }}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
                                        style={{ color: '#B73D37' }}
                                        aria-label="Imagen anterior"
                                      >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          nextImage()
                                        }}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
                                        style={{ color: '#B73D37' }}
                                        aria-label="Siguiente imagen"
                                      >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                      </button>
                                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                        {images.map((_, index) => (
                                          <button
                                            key={index}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setCurrentImageIndex(index)
                                            }}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                              index === currentImageIndex 
                                                ? 'bg-white' 
                                                : 'bg-white/50 hover:bg-white/75'
                                            }`}
                                            aria-label={`Ir a imagen ${index + 1}`}
                                          />
                                        ))}
                                      </div>
                                      <p className="text-xs text-center mt-3 font-body" style={{ color: '#6B7280' }}>
                                        Haz clic en la imagen o usa las flechas para navegar ({currentImageIndex + 1}/{images.length})
                                      </p>
                                    </>
                                  )}
                                </div>
                              )
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                    {!bookingInfo.fullDescription && (
                      <p style={{ color: '#6B7280' }}>{bookingInfo.description}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Información resumida cuando hay fecha seleccionada */}
              {type === 'class' && selectedDate && (
                <div className="mb-6 p-6 rounded-xl border-2"
                     style={{
                       borderColor: '#D48D88',
                       backgroundColor: '#FFFFFF',
                       boxShadow: '0 4px 16px rgba(183, 61, 55, 0.1)'
                     }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                         style={{ backgroundColor: '#FEE2E2' }}>
                      <span className="text-lg">✓</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-bold" style={{ color: '#1F2937' }}>
                        {bookingInfo.name}
                      </h3>
                      <p className="text-sm font-body" style={{ color: '#6B7280' }}>
                        {bookingInfo.teacher} • {bookingInfo.duration} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm font-body">
                    <span style={{ color: '#6B7280' }}>
                      <span className="font-semibold" style={{ color: '#B73D37' }}>Fecha:</span>{' '}
                      {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                </div>
              )}

              {/* Foto y bio del profesor - Solo cuando es tipo teacher y NO hay clase seleccionada */}
              {type === 'teacher' && !selectedClassId && teacherInfo?.image && (
                <div>
                  <div className="mb-6">
                    <div className="w-full max-w-lg mx-auto lg:mx-0 rounded-2xl overflow-hidden shadow-lg"
                         style={{ 
                           border: '3px solid #E5B3B0',
                           boxShadow: '0 8px 24px rgba(183, 61, 55, 0.15)'
                         }}>
                      <img
                        src={teacherInfo.image}
                        alt={teacherInfo.name}
                        className="w-full h-auto object-cover"
                        style={{ 
                          objectPosition: teacherInfo.id === 3 ? 'center 25%' : 'center top'
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-body font-body max-w-lg mx-auto lg:mx-0" style={{ color: '#4B5563', lineHeight: '1.7' }}>{teacherInfo?.bio}</p>
                </div>
              )}


              {/* Información de la clase seleccionada - Solo cuando NO hay fecha seleccionada */}
              {type === 'teacher' && selectedClassInfo && !selectedDate && (
                <div className="mb-6 p-6 rounded-xl border-2 relative overflow-hidden"
                     style={{
                       borderColor: '#D48D88',
                       backgroundColor: '#FFFFFF',
                       boxShadow: '0 4px 16px rgba(183, 61, 55, 0.1)'
                     }}>
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
                       style={{ backgroundColor: '#B73D37', transform: 'translate(30%, -30%)' }}></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                           style={{ backgroundColor: '#FEE2E2' }}>
                        <span className="text-lg">✓</span>
                      </div>
                      <h3 className="text-lg font-heading font-bold" style={{ color: '#1F2937' }}>
                        Clase seleccionada: {selectedClassInfo.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-6 text-sm font-body mb-4">
                      <span style={{ color: '#6B7280' }}>
                        <span className="font-semibold" style={{ color: '#B73D37' }}>Duración:</span> {selectedClassInfo.duration} min
                      </span>
                    </div>
                    {selectedClassInfo.fullDescription && (
                      <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E5B3B0' }}>
                        <h4 className="text-base font-heading font-semibold mb-3" style={{ color: '#1F2937' }}>
                          Sobre esta práctica
                        </h4>
                        <div className="prose prose-sm max-w-none mb-4">
                          {selectedClassInfo.fullDescription.split('\n\n').map((paragraph, index) => (
                            paragraph.trim() && (
                              <p key={index} className="text-sm font-body leading-relaxed mb-3" style={{ color: '#4B5563', lineHeight: '1.8' }}>
                                {paragraph.trim()}
                              </p>
                            )
                          ))}
                        </div>
                        {selectedClassInfo.image && (
                          <div className="mt-4">
                            {(() => {
                              // Para Tai Chi, usar múltiples imágenes (por ahora la misma, pero preparado para más)
                              const images = selectedClassInfo.id === 'tai-chi' 
                                ? [selectedClassInfo.image, selectedClassInfo.image, selectedClassInfo.image] 
                                : [selectedClassInfo.image]
                              
                              const nextImage = () => {
                                setCurrentImageIndex((prev) => (prev + 1) % images.length)
                              }
                              
                              const prevImage = () => {
                                setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
                              }
                              
                              return (
                                <div className="relative">
                                  <div 
                                    className="w-full rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl"
                                    style={{ 
                                      maxHeight: '500px',
                                      aspectRatio: '16/10'
                                    }}
                                    onClick={images.length > 1 ? nextImage : undefined}
                                  >
                                    <img
                                      src={images[currentImageIndex]}
                                      alt={`${selectedClassInfo.name} - Imagen ${currentImageIndex + 1}`}
                                      className="w-full h-full object-cover"
                                      style={{ 
                                        objectPosition: selectedClassInfo.id === 'sound-healing' 
                                          ? 'center top' 
                                          : selectedClassInfo.id === 'meditacion' 
                                            ? 'center center' 
                                            : 'center center'
                                      }}
                                    />
                                  </div>
                                  {images.length > 1 && (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          prevImage()
                                        }}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
                                        style={{ color: '#B73D37' }}
                                        aria-label="Imagen anterior"
                                      >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          nextImage()
                                        }}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
                                        style={{ color: '#B73D37' }}
                                        aria-label="Siguiente imagen"
                                      >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                      </button>
                                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                        {images.map((_, index) => (
                                          <button
                                            key={index}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setCurrentImageIndex(index)
                                            }}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                              index === currentImageIndex 
                                                ? 'bg-white' 
                                                : 'bg-white/50 hover:bg-white/75'
                                            }`}
                                            aria-label={`Ir a imagen ${index + 1}`}
                                          />
                                        ))}
                                      </div>
                                      <p className="text-xs text-center mt-3 font-body" style={{ color: '#6B7280' }}>
                                        Haz clic en la imagen o usa las flechas para navegar ({currentImageIndex + 1}/{images.length})
                                      </p>
                                    </>
                                  )}
                                </div>
                              )
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                    {!selectedClassInfo.fullDescription && (
                      <p className="text-sm font-body mb-4" style={{ color: '#4B5563', lineHeight: '1.6' }}>
                        {selectedClassInfo.description}
                      </p>
                    )}
                    <button
                      onClick={() => {
                        setSelectedClassId(null)
                        setSelectedDate(null)
                        setSelectedTime(null)
                      }}
                      className="text-sm font-body font-medium transition-colors hover:underline mt-4"
                      style={{ color: '#B73D37' }}
                    >
                      ← Cambiar clase
                    </button>
                  </div>
                </div>
              )}

              {/* Información resumida cuando hay fecha seleccionada (tipo teacher) */}
              {type === 'teacher' && selectedClassInfo && selectedDate && (
                <div className="mb-6 p-6 rounded-xl border-2"
                     style={{
                       borderColor: '#D48D88',
                       backgroundColor: '#FFFFFF',
                       boxShadow: '0 4px 16px rgba(183, 61, 55, 0.1)'
                     }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                         style={{ backgroundColor: '#FEE2E2' }}>
                      <span className="text-lg">✓</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-bold" style={{ color: '#1F2937' }}>
                        {selectedClassInfo.name}
                      </h3>
                      <p className="text-sm font-body" style={{ color: '#6B7280' }}>
                        {selectedClassInfo.teacher} • {selectedClassInfo.duration} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm font-body mb-4">
                    <span style={{ color: '#6B7280' }}>
                      <span className="font-semibold" style={{ color: '#B73D37' }}>Fecha:</span>{' '}
                      {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDate(null)
                      setSelectedTime(null)
                    }}
                    className="text-sm font-body font-medium transition-colors hover:underline"
                    style={{ color: '#B73D37' }}
                  >
                    ← Cambiar fecha
                  </button>
                </div>
              )}

              {/* Instrucción clara para seleccionar fecha primero */}
              {type === 'teacher' && selectedClassId && !selectedDate && (
                <div className="mb-8 p-6 rounded-xl border-2 relative"
                     style={{ 
                       backgroundColor: '#FEF3F2', 
                       borderColor: '#B73D37',
                       boxShadow: '0 4px 12px rgba(183, 61, 55, 0.15)'
                     }}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                         style={{ backgroundColor: '#B73D37' }}>
                      <span className="text-2xl text-white">📅</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-heading font-bold mb-2" style={{ color: '#1F2937' }}>
                        Paso 1: Selecciona una fecha
                      </h3>
                      <p className="text-base font-body font-medium mb-2" style={{ color: '#B73D37' }}>
                        Usa el calendario a la derecha para elegir una fecha disponible.
                      </p>
                      <p className="text-sm font-body" style={{ color: '#6B7280' }}>
                        Las fechas disponibles aparecen marcadas en rojo claro. Una vez selecciones la fecha, podrás elegir el horario.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mensaje después de seleccionar fecha - indicar que deben seleccionar horario */}
              {type === 'teacher' && selectedClassId && selectedDate && !selectedTime && (
                <div className="mb-6 p-6 rounded-xl border-2 relative"
                     style={{ 
                       backgroundColor: '#FEF3F2', 
                       borderColor: '#B73D37',
                       boxShadow: '0 4px 12px rgba(183, 61, 55, 0.15)'
                     }}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                         style={{ backgroundColor: '#B73D37' }}>
                      <span className="text-2xl text-white">⏰</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-heading font-bold mb-2" style={{ color: '#1F2937' }}>
                        Paso 2: Selecciona un horario
                      </h3>
                      <p className="text-base font-body font-medium" style={{ color: '#B73D37' }}>
                        Elige el horario que prefieres para tu clase.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Selección de hora (solo cuando hay clase seleccionada y fecha seleccionada) */}
              {((type === 'teacher' && selectedClassId) || type === 'class') && selectedDate && (
                <div className="mb-6">
                  <h3 className="text-h3 font-heading text-body mb-4">
                    Horarios disponibles
                  </h3>
                  {availableTimes.length > 0 ? (
                    <TimeSlotSelector
                      availableTimes={availableTimes}
                      selectedTime={selectedTime}
                      onTimeSelect={handleTimeSelect}
                    />
                  ) : (
                    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                      <p className="text-sm font-body text-yellow-800">
                        No hay horarios disponibles para esta fecha. Por favor selecciona otra fecha.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Información del cliente */}
              {selectedTime && (
                <div className="mb-6">
                  <h3 className="text-h3 font-heading text-body mb-4">
                    Información de contacto
                  </h3>
                  <div className="rounded-lg p-6 border-2 mb-4"
                       style={{ 
                         backgroundColor: '#faf9f9',
                         borderColor: '#E5B3B0',
                         boxShadow: '0 2px 8px rgba(183, 61, 55, 0.05)'
                       }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nombre */}
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
                      
                      {/* Apellido */}
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
                      
                      {/* Email */}
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
                      
                      {/* Teléfono */}
                      <div>
                        <label className="block text-body font-body font-medium mb-2">
                          Teléfono *
                        </label>
                        <input
                          type="tel"
                          placeholder="+52 55 1234 5678"
                          value={customerInfo.phone}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^0-9+-\s]/gi, '')
                            handleCustomerInfoChange('phone', v)
                          }}
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
                    </div>
                  </div>
                </div>
              )}

              {/* Formulario de pago */}
              {selectedTime && (
                <div className="mb-6">
                  <h3 className="text-h3 font-heading text-body mb-4">
                    Información de pago
                  </h3>
                  <div className="rounded-lg p-6 border-2"
                       style={{ 
                         backgroundColor: '#faf9f9',
                         borderColor: '#D48D88',
                         boxShadow: '0 2px 8px rgba(212, 141, 136, 0.08)'
                       }}>
                    {/* Método de pago */}
                    <div className="mb-6">
                      <label className="block text-body font-body font-medium mb-2">
                        Método de pago *
                      </label>
                      
                      {/* Opción de usar paquete si tiene paquetes activos */}
                      {userPackages && userPackages.hasActivePackages && (
                        <div className="mb-4 space-y-3">
                          {userPackages.packages.map((pkg) => (
                            <div
                              key={pkg.id}
                              className="rounded-lg p-4 border-2 cursor-pointer transition-all"
                              style={{ 
                                borderColor: usePackage && selectedPackageId === pkg.id ? '#B73D37' : '#DED5D5',
                                backgroundColor: usePackage && selectedPackageId === pkg.id ? '#FEE2E2' : '#FFFFFF',
                                boxShadow: usePackage && selectedPackageId === pkg.id ? '0 2px 8px rgba(183, 61, 55, 0.2)' : 'none'
                              }}
                              onClick={() => {
                                setUsePackage(true)
                                setSelectedPackageId(pkg.id)
                                setStripeCardData(null)
                                setCardholderName('')
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  checked={usePackage && selectedPackageId === pkg.id}
                                  onChange={() => {
                                    setUsePackage(true)
                                    setSelectedPackageId(pkg.id)
                                  }}
                                  className="w-4 h-4"
                                  style={{ accentColor: '#B73D37' }}
                                />
                                <label className="flex items-center gap-2 cursor-pointer flex-1">
                                  <span className="text-xl">🎫</span>
                                  <div className="flex-1">
                                    <span className="font-body text-body font-semibold">{pkg.packageName}</span>
                                    <p className="text-xs font-body" style={{ color: '#6B7280' }}>
                                      {pkg.classesRemaining || pkg.classes} clases disponibles
                                    </p>
                                  </div>
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Opción de pagar con tarjeta */}
                      <div className="rounded-lg p-4 border-2 cursor-pointer transition-all"
                           style={{ 
                             borderColor: !usePackage ? '#B73D37' : '#DED5D5',
                             backgroundColor: !usePackage ? '#FEE2E2' : '#FFFFFF',
                             boxShadow: !usePackage ? '0 2px 8px rgba(183, 61, 55, 0.2)' : 'none'
                           }}
                           onClick={() => {
                             setUsePackage(false)
                             setSelectedPackageId(null)
                           }}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            id="payment-card"
                            name="paymentMethod"
                            value="card"
                            checked={!usePackage}
                            onChange={() => {
                              setUsePackage(false)
                              setSelectedPackageId(null)
                            }}
                            className="w-4 h-4"
                            style={{ accentColor: '#B73D37' }}
                          />
                          <label htmlFor="payment-card" className="flex items-center gap-2 cursor-pointer flex-1">
                            <span className="text-2xl">💳</span>
                            <span className="font-body text-body">Tarjeta de Crédito/Débito - $30.00 MXN</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Formulario de tarjeta solo si NO está usando paquete */}
                    {!usePackage && (
                      <>
                        <StripeCardElement
                          onCardReady={setStripeCardData}
                          cardholderName={cardholderName}
                          setCardholderName={setCardholderName}
                        />
                        
                        {/* Iconos de tarjetas aceptadas */}
                        <div className="pt-2 mt-4">
                          <p className="text-xs text-body font-body mb-2">Tarjetas aceptadas:</p>
                          <div className="flex gap-2">
                            <span className="text-2xl">💳</span>
                            <span className="text-2xl">🔵</span>
                            <span className="text-2xl">⚫</span>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {/* Mensaje si está usando paquete */}
                    {usePackage && selectedPackageId && (
                      <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-sm font-body text-green-800">
                          ✓ Usarás una clase de tu paquete. No se realizará ningún cargo.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Botón de pagar/reservar - Siempre visible cuando se completa la información */}
              {selectedTime && 
               customerInfo.firstName && customerInfo.lastName && customerInfo.email && customerInfo.phone &&
               ((usePackage && selectedPackageId) || (stripeCardData && stripeCardData.isComplete && cardholderName)) && (
                <div className="mb-4">
                  <button
                    onClick={handleBooking}
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
                        e.target.style.color = '#FFFFFF'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isProcessing) {
                        e.target.style.background = 'linear-gradient(135deg, #B73D37 0%, #8B2E29 100%)'
                        e.target.style.boxShadow = '0 10px 25px rgba(183, 61, 55, 0.3)'
                        e.target.style.color = '#FFFFFF'
                      }
                    }}
                  >
                    {isProcessing 
                      ? 'Procesando...' 
                      : usePackage 
                        ? 'Reservar con Paquete' 
                        : 'Pagar $30.00 MXN'}
                  </button>
                  <p className="text-xs text-body font-body text-center mt-2 opacity-75">
                    Al hacer clic, procesaremos tu pago de forma segura
                  </p>
                </div>
              )}

              {/* Resumen */}
              {selectedDate && selectedTime && 
               customerInfo.firstName && customerInfo.lastName && customerInfo.email && customerInfo.phone &&
               ((usePackage && selectedPackageId) || (stripeCardData && stripeCardData.isComplete && cardholderName)) && (
                <div className="pt-6 border-t"
                     style={{ borderColor: '#E5B3B0' }}>
                  <div className="rounded-lg p-6 border-2"
                       style={{ 
                         backgroundColor: '#faf9f9',
                         borderColor: '#E5B3B0',
                         boxShadow: '0 2px 8px rgba(183, 61, 55, 0.05)'
                       }}>
                    <h3 className="text-h5 font-heading text-body mb-4">
                      Resumen de tu reserva
                    </h3>
                    <div className="space-y-2 text-body font-body">
                      {type === 'teacher' && (
                        <>
                          <p>
                            <span className="font-medium">Profesor:</span>{' '}
                            {teacherInfo?.name}
                          </p>
                          <p>
                            <span className="font-medium">Clase:</span>{' '}
                            {selectedClassInfo?.name}
                          </p>
                        </>
                      )}
                      {type === 'class' && (
                        <p>
                          <span className="font-medium">Clase:</span>{' '}
                          {bookingInfo.name}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Fecha:</span>{' '}
                        {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                      <p>
                        <span className="font-medium">Hora:</span> {selectedTime}
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
                      <p>
                        <span className="font-medium">Precio:</span>{' '}
                        {usePackage ? (
                          <span className="text-green-600 font-semibold">Gratis (usando paquete)</span>
                        ) : (
                          '$30.00 MXN'
                        )}
                      </p>
                      {usePackage && selectedPackageId && (
                        <p className="text-xs text-body opacity-75">
                          Usando: {userPackages?.packages.find(p => p.id === selectedPackageId)?.packageName}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Método de pago:</span> 
                        <span className="ml-2 inline-flex items-center gap-1">
                          <span>💳</span>
                          <span>Tarjeta de Crédito/Débito</span>
                        </span>
                      </p>
                      {stripeCardData?.paymentMethod?.card && (
                        <p className="text-xs text-body opacity-75">
                          Tarjeta terminada en: {stripeCardData.paymentMethod.card.last4}
                          {stripeCardData.paymentMethod.card.brand && (
                            <span className="ml-2">({stripeCardData.paymentMethod.card.brand})</span>
                          )}
                        </p>
                      )}
                      {stripeCardData?.paymentMethod?.card?.last4 && (
                        <p className="text-xs text-body opacity-75">
                          Tarjeta terminada en: {stripeCardData.paymentMethod.card.last4}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Columna derecha - Selección de clase cuando es profesor sin clase seleccionada, o Calendario cuando hay clase seleccionada */}
            {type === 'teacher' && !selectedClassId && (
              <div className="w-full lg:w-96 lg:flex-shrink-0 order-1 lg:order-2">
                <div className="lg:sticky lg:top-24">
                  <div className="mb-6">
                    <h3 className="text-h3 font-heading text-body mb-2">
                      Selecciona una clase
                    </h3>
                    <p className="text-sm font-body" style={{ color: '#6B7280' }}>
                      Elige la clase que deseas tomar con {teacherInfo?.name}. Ver todas las clases disponibles y sus horarios.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {teacherInfo?.classes.map((className) => {
                      const classData = classTypes.find(c => c.name === className)
                      if (!classData) return null
                      return (
                        <div
                          key={classData.id}
                          onClick={() => handleClassSelect(classData.id)}
                          className="p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 group/class"
                          style={{
                            borderColor: '#E5B3B0',
                            backgroundColor: '#FFFFFF',
                            boxShadow: '0 2px 8px rgba(183, 61, 55, 0.08)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#B73D37'
                            e.currentTarget.style.transform = 'translateY(-4px)'
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(183, 61, 55, 0.2)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#E5B3B0'
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(183, 61, 55, 0.08)'
                          }}
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                 style={{ backgroundColor: '#FEE2E2' }}>
                              <span className="text-xl">🧘</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-heading font-bold mb-2" style={{ color: '#1F2937' }}>
                                {classData.name}
                              </h4>
                              <p className="text-sm font-body mb-3" style={{ color: '#4B5563', lineHeight: '1.6' }}>
                                {classData.description}
                              </p>
                            </div>
                          </div>
                          <div className="pt-4 border-t"
                               style={{ borderColor: '#F3F4F6' }}>
                            <span className="text-sm font-body" style={{ color: '#6B7280' }}>
                              <span className="font-semibold" style={{ color: '#B73D37' }}>Duración:</span> {classData.duration} min
                            </span>
                          </div>
                          <div className="mt-4 flex items-center gap-2 text-sm font-body font-medium opacity-0 group-hover/class:opacity-100 transition-opacity duration-300"
                               style={{ color: '#B73D37' }}>
                            <span>Seleccionar</span>
                            <span className="transform group-hover/class:translate-x-1 transition-transform duration-300">→</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Columna derecha - Calendario (solo cuando hay clase seleccionada) */}
            {((type === 'teacher' && selectedClassId) || type === 'class') && (
              <div className="w-full lg:w-[400px] xl:w-[420px] lg:flex-shrink-0 order-1 lg:order-2">
                <div className="lg:sticky lg:top-24">
                  {type === 'teacher' && selectedClassId && !selectedDate && (
                    <div className="mb-4 p-4 rounded-lg"
                         style={{ backgroundColor: '#FEE2E2', border: '1px solid #D48D88' }}>
                      <p className="text-sm font-body font-semibold text-center" style={{ color: '#B73D37' }}>
                        👇 Selecciona una fecha aquí
                      </p>
                    </div>
                  )}
                  <h3 className="text-h3 font-heading text-body mb-4 text-center lg:text-left">
                    Selecciona una fecha
                  </h3>
                  <Calendar
                    availableDates={availableDates}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      </div>
    </div>
  )
}

export default Booking
