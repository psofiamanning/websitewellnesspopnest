// Servicio para manejar reservas y pagos
// Simula un backend usando localStorage

const STORAGE_KEY = 'estudio_popnest_bookings'

// Backend URL
import { BACKEND_URL } from '../config/api.js'

// Validar código de descuento (un uso por correo y por código)
export const validateDiscountCode = async (email, code) => {
  const response = await fetch(`${BACKEND_URL}/api/discount-codes/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.valid) {
    throw new Error(data.error || 'Código de descuento no válido.')
  }
  return data
}

// Validar código de descuento porcentual para PAQUETES → { code, percent, label }
export const validatePackageDiscountCode = async (code) => {
  const response = await fetch(`${BACKEND_URL}/api/package-discounts/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.valid) {
    throw new Error(data.error || 'Código de descuento no válido.')
  }
  return data
}

// Guardar reserva (ahora usa el backend)
export const saveBooking = async (bookingData) => {
  // Paquete, código de descuento o pago con tarjeta confirmado
  if (
    bookingData.paymentMethod === 'package' ||
    bookingData.paymentMethod === 'discount_code' ||
    (bookingData.payment?.status === 'succeeded' && bookingData.stripeInfo?.paymentIntentId)
  ) {
    // Intentar guardar en el backend primero
    try {
      const response = await fetch(`${BACKEND_URL}/api/bookings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      })

      if (response.ok) {
        const result = await response.json()
        return result.booking || bookingData
      } else {
        // Manejar errores del backend
        const error = await response.json()
        throw new Error(error.error || 'Error al guardar la reserva')
      }
    } catch (error) {
      // Si es un error de disponibilidad o paquete, propagarlo
      if (error.message && (
        error.message.includes('reservaciones') || 
        error.message.includes('disponible') ||
        error.message.includes('clases disponibles') ||
        error.message.includes('paquete') ||
        error.message.includes('descuento') ||
        error.message.includes('código')
      )) {
        throw error
      }
      console.warn('Backend no disponible, usando localStorage:', error)
    }
  }
  
  // Si el pago no fue exitoso o no hay paymentIntentId, intentar confirmar en el backend
  if (bookingData.stripeInfo?.paymentIntentId && bookingData.payment?.status !== 'succeeded') {
    try {
      const result = await confirmBooking(bookingData.stripeInfo.paymentIntentId, bookingData)
      return result.booking
    } catch (error) {
      console.error('Error confirming booking in backend:', error)
      // Continuar para guardar en localStorage como fallback
    }
  }
  
  // Fallback a localStorage
  const bookings = await getBookings()
  const newBooking = {
    id: Date.now().toString(),
    ...bookingData,
    createdAt: new Date().toISOString(),
    status: bookingData.payment?.status === 'succeeded' ? 'confirmed' : 'pending'
  }
  bookings.push(newBooking)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
  return newBooking
}

// Obtener todas las reservas (desde el backend)
export const getBookings = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/bookings`)
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.warn('Backend not available, using localStorage:', error)
  }
  
  // Fallback a localStorage
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

// Obtener reserva por ID
export const getBookingById = async (id) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/bookings/${id}`)
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.warn('Backend not available, using localStorage:', error)
  }
  
  // Fallback a localStorage
  const bookings = await getBookings()
  return bookings.find(b => b.id === id)
}

// Obtener reservas de un usuario por email
export const getBookingsByUser = async (email) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/bookings/user/${encodeURIComponent(email)}`)
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.warn('Error getting user bookings:', error)
  }
  return []
}

// Reagendar una reserva (nueva fecha y hora; solo permitido con 48 h de anticipación)
export const rescheduleBooking = async (bookingId, { newDate, newTime }, userEmail) => {
  const response = await fetch(`${BACKEND_URL}/api/bookings/${bookingId}/reschedule`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newDate, newTime, userEmail })
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Error al reagendar')
  }
  return await response.json()
}

// Obtener reservas por rango de fechas
export const getBookingsByDateRange = async (startDate, endDate) => {
  const bookings = await getBookings()
  return bookings.filter(booking => {
    const bookingDate = new Date(booking.date)
    return bookingDate >= startDate && bookingDate <= endDate
  })
}

// Crear Payment Intent con Stripe (llamada al backend)
export const createPaymentIntent = async (amount, currency = 'mxn', customerInfo = {}) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/create-payment-intent`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, currency, customerInfo })
    })

    if (!response.ok) {
      let errorMessage = 'Error creating payment intent'
      try {
        const error = await response.json()
        errorMessage = error.error || errorMessage
      } catch (e) {
        // Si no se puede parsear el error, usar el status
        errorMessage = `Error ${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating payment intent:', error)
    // Si es un error de red, agregar más contexto
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      throw new Error(`No se pudo conectar con el backend en ${BACKEND_URL}. Verifica que el servidor esté corriendo.`)
    }
    throw error
  }
}

// Confirmar PaymentIntent con PaymentMethod (nuevo endpoint)
export const confirmPayment = async (paymentIntentId, paymentMethodId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/confirm-payment`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentIntentId, paymentMethodId })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error confirming payment')
    }

    return await response.json()
  } catch (error) {
    console.error('Error confirming payment:', error)
    throw error
  }
}

// Verificar disponibilidad de una clase
export const checkAvailability = async (className, date, time) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/bookings/availability/${encodeURIComponent(className)}/${date}/${time}`)
    
    if (!response.ok) {
      // No confundir "error al verificar" con "clase llena"
      return { available: false, verificationFailed: true, currentCount: 0, maxBookings: 9, remainingSpots: 0 }
    }
    
    return await response.json()
  } catch (error) {
    console.warn('Error checking availability:', error)
    return { available: false, verificationFailed: true, currentCount: 0, maxBookings: 9, remainingSpots: 0 }
  }
}

// Obtener paquetes activos de un usuario
export const getUserPackages = async (email) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/packages/user/${encodeURIComponent(email)}`)
    if (response.ok) {
      return await response.json()
    }
    return { packages: [], totalClassesRemaining: 0, hasActivePackages: false }
  } catch (error) {
    console.warn('Error getting user packages:', error)
    return { packages: [], totalClassesRemaining: 0, hasActivePackages: false }
  }
}

const EMPTY_PACKAGES_ALL = {
  activePackages: [],
  historyPackages: [],
  allPackages: [],
  totalClassesRemaining: 0,
  hasActivePackages: false,
  hasPurchasedPackages: false,
}

function packagesAllFromActiveOnly(activeData) {
  const packages = activeData?.packages ?? []
  const totalClassesRemaining =
    typeof activeData?.totalClassesRemaining === 'number'
      ? activeData.totalClassesRemaining
      : packages.reduce((sum, p) => sum + (Number(p.classesRemaining) || 0), 0)
  return {
    activePackages: packages,
    historyPackages: [],
    allPackages: packages,
    totalClassesRemaining,
    hasActivePackages: Boolean(activeData?.hasActivePackages) || packages.length > 0,
    hasPurchasedPackages: packages.length > 0,
  }
}

/** Paquetes activos + historial de compras (fallback a activos si /all no existe aún) */
export const getUserPackagesAll = async (email) => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/packages/user/${encodeURIComponent(email)}/all`,
    )
    if (response.ok) {
      return await response.json()
    }
    if (response.status === 404 || response.status === 501) {
      const active = await getUserPackages(email)
      return packagesAllFromActiveOnly(active)
    }
    return { ...EMPTY_PACKAGES_ALL }
  } catch (error) {
    console.warn('Error getting user packages (all):', error)
    try {
      const active = await getUserPackages(email)
      return packagesAllFromActiveOnly(active)
    } catch {
      return { ...EMPTY_PACKAGES_ALL }
    }
  }
}

// Confirmar reserva después del pago exitoso
export const confirmBooking = async (paymentIntentId, bookingData) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/confirm-booking`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentIntentId, bookingData })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error confirming booking')
    }

    return await response.json()
  } catch (error) {
    console.error('Error confirming booking:', error)
    throw error
  }
}
