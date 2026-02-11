import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Cargar Stripe con la clave pública
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null

// Componente interno que maneja el formulario de tarjeta
function CardForm({ onCardReady, cardholderName, setCardholderName }) {
  // Los hooks deben llamarse siempre en el mismo orden
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState(null)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (onCardReady) {
      onCardReady({ stripe, elements, isComplete, error })
    }
  }, [stripe, elements, isComplete, error, onCardReady])

  const handleChange = (event) => {
    setError(event.error)
    setIsComplete(event.complete)
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1F2937',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        '::placeholder': {
          color: '#9CA3AF',
        },
      },
      invalid: {
        color: '#EF4444',
        iconColor: '#EF4444',
      },
    },
    hidePostalCode: true,
  }

  // Mostrar mensaje si Stripe no está listo
  if (!stripe || !elements) {
    return (
      <div className="text-gray-600 p-4 border-2 border-gray-300 rounded-lg">
        <p className="text-sm">Cargando formulario de pago...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <label className="block text-body font-body font-medium mb-2">
          Nombre del titular
        </label>
        <input
          type="text"
          placeholder="Nombre como aparece en la tarjeta"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
          className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-body text-body transition-all duration-300"
          style={{ 
            borderColor: '#DED5D5',
            backgroundColor: '#FFFFFF'
          }}
          onFocus={(e) => e.target.style.borderColor = '#B73D37'}
          onBlur={(e) => e.target.style.borderColor = '#DED5D5'}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-body font-body font-medium mb-2">
          Información de la tarjeta
        </label>
        <div 
          className="px-4 py-3 rounded-lg border-2 transition-all duration-300"
          style={{ 
            borderColor: '#DED5D5',
            backgroundColor: '#FFFFFF'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#B73D37'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#DED5D5'}
        >
          <CardElement
            options={cardElementOptions}
            onChange={handleChange}
          />
        </div>
        {error && (
          <p className="text-red-600 text-sm mt-2">{error.message}</p>
        )}
      </div>
    </div>
  )
}

// Componente principal que envuelve con Elements
export default function StripeCardElement({ onCardReady, cardholderName, setCardholderName }) {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

  if (!publishableKey) {
    return (
      <div className="text-red-600 p-4 border-2 border-red-300 rounded-lg">
        ⚠️ Stripe Publishable Key no configurada
      </div>
    )
  }

  if (!stripePromise) {
    return (
      <div className="text-red-600 p-4 border-2 border-red-300 rounded-lg">
        ⚠️ Error al inicializar Stripe
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <CardForm 
        onCardReady={onCardReady}
        cardholderName={cardholderName}
        setCardholderName={setCardholderName}
      />
    </Elements>
  )
}
