// Configuración de Stripe
// IMPORTANTE: Configura tu clave pública en el archivo .env
// Ver STRIPE_SETUP.md para instrucciones

import { BACKEND_URL } from './api.js'

export const stripeConfig = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  backendUrl: BACKEND_URL,
}

// Inicializar Stripe (carga dinámica para evitar errores si no está instalado)
// Esta función se usa directamente en Booking.jsx con import dinámico
export const loadStripe = async () => {
  if (!stripeConfig.publishableKey) {
    console.warn('⚠️ Stripe Publishable Key no configurada. Configura VITE_STRIPE_PUBLISHABLE_KEY en tu archivo .env')
    return null
  }
  
  try {
    // Importación dinámica - solo se ejecuta cuando se llama la función
    const stripeModule = await import('@stripe/stripe-js')
    const { loadStripe: loadStripeJS } = stripeModule
    return await loadStripeJS(stripeConfig.publishableKey)
  } catch (error) {
    // Si el módulo no existe o hay error, retornamos null sin romper la app
    console.warn('⚠️ @stripe/stripe-js no está instalado. Ejecuta: npm install @stripe/stripe-js')
    console.warn('   Continuando en modo simulación...')
    return null
  }
}
