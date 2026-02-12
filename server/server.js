import express from 'express'
import cors from 'cors'
import Stripe from 'stripe'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import crypto from 'node:crypto'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.raw({ type: 'application/json' }))

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

// Email: transporter solo si hay credenciales (Gmail/Google Workspace con App Password)
const mailUser = (process.env.SMTP_MAIL_USER || '').trim()
const mailAppPassword = (process.env.SMTP_MAIL_APP_PASSWORD || '').trim().replace(/\s/g, '') // quitar espacios del App Password
// Puerto 465 (SSL) suele funcionar mejor desde la nube; 587 a veces da timeout en Railway
const mailTransporter = (mailUser && mailAppPassword)
  ? nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: mailUser, pass: mailAppPassword },
      connectionTimeout: 15000
    })
  : null

// Verificar SMTP al arrancar (solo log; no bloquea)
if (mailTransporter) {
  mailTransporter.verify().then(() => {
    console.log('✅ SMTP listo (correo desde:', mailUser + ')')
  }).catch((err) => {
    console.error('❌ SMTP no pudo conectar/autenticar:', err.message)
    if (err.response) console.error('   Respuesta:', err.response)
  })
} else {
  console.warn('⚠️ SMTP no configurado: faltan SMTP_MAIL_USER o SMTP_MAIL_APP_PASSWORD. No se enviarán correos.')
}

async function sendWelcomeEmail(user) {
  if (!user?.email) return
  if (!mailTransporter) {
    console.warn('⚠️ Email de bienvenida no enviado (SMTP no configurado):', user.email)
    return
  }
  try {
    await mailTransporter.sendMail({
      from: `"Estudio Popnest Wellness" <${mailUser}>`,
      to: user.email,
      subject: 'Bienvenido a Estudio Popnest Wellness',
      text: `Hola ${user.firstName || ''},\n\nGracias por registrarte en Estudio Popnest Wellness. Ya puedes reservar clases y disfrutar de nuestro estudio.\n\nSaludos,\nEl equipo de Estudio Popnest Wellness`,
      html: `
        <p>Hola <strong>${user.firstName || ''}</strong>,</p>
        <p>Gracias por registrarte en <strong>Estudio Popnest Wellness</strong>. Ya puedes reservar clases y disfrutar de nuestro estudio.</p>
        <p>Saludos,<br>El equipo de Estudio Popnest Wellness</p>
      `
    })
    console.log('✅ Email de bienvenida enviado a:', user.email)
  } catch (err) {
    console.error('❌ Error enviando email de bienvenida a', user.email, ':', err.message)
    if (err.response) console.error('   Respuesta SMTP:', err.response)
  }
}

// Tokens de restablecimiento de contraseña
const getResetTokens = () => {
  try {
    if (fs.existsSync(RESET_TOKENS_FILE)) {
      return JSON.parse(fs.readFileSync(RESET_TOKENS_FILE, 'utf8'))
    }
    return []
  } catch (e) {
    return []
  }
}
const saveResetToken = (token, email) => {
  const tokens = getResetTokens().filter(t => t.email !== email)
  tokens.push({ token, email, expiresAt: Date.now() + RESET_TOKEN_EXPIRY_MS })
  fs.writeFileSync(RESET_TOKENS_FILE, JSON.stringify(tokens, null, 2))
}
const consumeResetToken = (token) => {
  const tokens = getResetTokens()
  const now = Date.now()
  const valid = tokens.find(t => t.token === token && t.expiresAt > now)
  if (!valid) return null
  const rest = tokens.filter(t => t.token !== token)
  fs.writeFileSync(RESET_TOKENS_FILE, JSON.stringify(rest, null, 2))
  return valid.email
}

async function sendPasswordResetEmail(email, resetToken) {
  if (!mailTransporter || !email) return
  const resetLink = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}`
  try {
    await mailTransporter.sendMail({
      from: `"Estudio Popnest Wellness" <${mailUser}>`,
      to: email,
      subject: 'Restablecer tu contraseña - Estudio Popnest Wellness',
      text: `Hola,\n\nRecibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el siguiente enlace (válido 1 hora):\n\n${resetLink}\n\nSi no solicitaste esto, ignora este correo.\n\nSaludos,\nEstudio Popnest Wellness`,
      html: `
        <p>Hola,</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
        <p><a href="${resetLink}" style="color:#B73D37;font-weight:bold;">Restablecer contraseña</a></p>
        <p>Este enlace es válido por 1 hora. Si no solicitaste esto, ignora este correo.</p>
        <p>Saludos,<br>Estudio Popnest Wellness</p>
      `
    })
    console.log('✅ Email de restablecimiento enviado a:', email)
  } catch (err) {
    console.error('❌ Error enviando email de restablecimiento:', err.message)
  }
}

async function sendAdminPasswordResetEmail(email, resetToken) {
  if (!mailTransporter || !email) return
  const resetLink = `${FRONTEND_URL}/admin/reset-password?token=${encodeURIComponent(resetToken)}`
  try {
    await mailTransporter.sendMail({
      from: `"Estudio Popnest Wellness" <${mailUser}>`,
      to: email,
      subject: 'Restablecer contraseña de administrador - Estudio Popnest Wellness',
      text: `Hola,\n\nRecibimos una solicitud para restablecer la contraseña del panel de administración. Haz clic en el siguiente enlace (válido 1 hora):\n\n${resetLink}\n\nSi no solicitaste esto, ignora este correo.\n\nSaludos,\nEstudio Popnest Wellness`,
      html: `
        <p>Hola,</p>
        <p>Recibimos una solicitud para restablecer la contraseña del <strong>panel de administración</strong>.</p>
        <p><a href="${resetLink}" style="color:#B73D37;font-weight:bold;">Restablecer contraseña de administrador</a></p>
        <p>Este enlace es válido por 1 hora. Si no solicitaste esto, ignora este correo.</p>
        <p>Saludos,<br>Estudio Popnest Wellness</p>
      `
    })
    console.log('✅ Email de restablecimiento (admin) enviado a:', email)
  } catch (err) {
    console.error('❌ Error enviando email de restablecimiento admin:', err.message)
  }
}

// Archivos para guardar datos (simulando base de datos)
const BOOKINGS_FILE = join(__dirname, 'bookings.json')
const USERS_FILE = join(__dirname, 'users.json')
const RESET_TOKENS_FILE = join(__dirname, 'password-reset-tokens.json')
const ADMINS_FILE = join(__dirname, 'admins.json')
const ADMIN_RESET_TOKENS_FILE = join(__dirname, 'admin-password-reset-tokens.json')
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000 // 1 hora

// Función helper para leer reservas
const getBookings = () => {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading bookings:', error)
    return []
  }
}

// Función helper para guardar reservas
const saveBooking = (booking) => {
  try {
    const bookings = getBookings()
    bookings.push(booking)
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2))
    return booking
  } catch (error) {
    console.error('Error saving booking:', error)
    throw error
  }
}

// Función helper para actualizar reserva
const updateBooking = (bookingId, updates) => {
  try {
    const bookings = getBookings()
    const index = bookings.findIndex(b => b.id === bookingId)
    if (index !== -1) {
      bookings[index] = { ...bookings[index], ...updates }
      fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2))
      return bookings[index]
    }
    return null
  } catch (error) {
    console.error('Error updating booking:', error)
    throw error
  }
}

// Función helper para contar reservas por clase, fecha y hora
const countBookingsForClass = (className, date, time) => {
  try {
    const bookings = getBookings()
    return bookings.filter(booking => {
      return booking.className === className &&
             booking.date === date &&
             booking.time === time &&
             booking.status === 'confirmed'
    }).length
  } catch (error) {
    console.error('Error counting bookings:', error)
    return 0
  }
}

// Constante para el límite de reservas por clase
const MAX_BOOKINGS_PER_CLASS = 9

// Endpoint: Crear Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'mxn', customerInfo } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount is required and must be greater than 0' })
    }

    // Crear Payment Intent con Stripe
    // IMPORTANTE: No especificamos payment_method aquí porque se adjuntará desde el frontend
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // en centavos
      currency: currency.toLowerCase(),
      payment_method_types: ['card'], // Especificar explícitamente que aceptamos tarjetas
      // No adjuntamos payment_method aquí - se hará desde el frontend con confirmCardPayment
      metadata: {
        customer_name: `${customerInfo?.firstName || ''} ${customerInfo?.lastName || ''}`.trim(),
        customer_email: customerInfo?.email || '',
        customer_phone: customerInfo?.phone || '',
      },
    })
    
    console.log('✅ PaymentIntent creado:', {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    })

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint: Confirmar PaymentIntent con PaymentMethod
app.post('/api/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body

    if (!paymentIntentId || !paymentMethodId) {
      return res.status(400).json({ error: 'Payment Intent ID and Payment Method ID are required' })
    }

    try {
      console.log('🔵 Intentando confirmar PaymentIntent:', {
        paymentIntentId,
        paymentMethodId
      })

      // Primero verificar que el PaymentIntent existe
      let paymentIntent
      try {
        paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
        console.log('✅ PaymentIntent encontrado:', {
          id: paymentIntent.id,
          status: paymentIntent.status
        })
      } catch (retrieveError) {
        console.error('❌ Error al recuperar PaymentIntent:', retrieveError)
        return res.status(400).json({ 
          error: `PaymentIntent no encontrado: ${retrieveError.message}`,
          code: retrieveError.code,
          type: retrieveError.type
        })
      }

      // Verificar que el PaymentMethod existe
      try {
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
        console.log('✅ PaymentMethod encontrado:', {
          id: paymentMethod.id,
          type: paymentMethod.type
        })
      } catch (pmError) {
        console.error('❌ Error al recuperar PaymentMethod:', pmError)
        return res.status(400).json({ 
          error: `PaymentMethod no encontrado: ${pmError.message}`,
          code: pmError.code,
          type: pmError.type
        })
      }

      // Actualizar el PaymentIntent con el PaymentMethod
      const updatedPaymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
        payment_method: paymentMethodId
      })
      console.log('✅ PaymentIntent actualizado con PaymentMethod')

      // Confirmar el PaymentIntent
      const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntentId)
      console.log('✅ PaymentIntent confirmado:', {
        id: confirmedPaymentIntent.id,
        status: confirmedPaymentIntent.status
      })

      res.json({
        success: true,
        paymentIntent: confirmedPaymentIntent,
        status: confirmedPaymentIntent.status
      })
    } catch (stripeError) {
      console.error('❌ Error al confirmar PaymentIntent:', stripeError)
      console.error('   Código:', stripeError.code)
      console.error('   Tipo:', stripeError.type)
      console.error('   Mensaje:', stripeError.message)
      res.status(400).json({ 
        error: stripeError.message || 'Error al confirmar el pago',
        code: stripeError.code,
        type: stripeError.type
      })
    }
  } catch (error) {
    console.error('Error en confirm-payment:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint: Confirmar pago y guardar reserva
app.post('/api/confirm-booking', async (req, res) => {
  try {
    const { paymentIntentId, bookingData } = req.body

    // Si es reserva con paquete, no requiere paymentIntentId
    if (!paymentIntentId && bookingData.paymentMethod !== 'package') {
      return res.status(400).json({ error: 'Payment Intent ID is required' })
    }

    // Verificar disponibilidad antes de procesar el pago
    if (bookingData.className && bookingData.date && bookingData.time) {
      const currentCount = countBookingsForClass(bookingData.className, bookingData.date, bookingData.time)
      if (currentCount >= MAX_BOOKINGS_PER_CLASS) {
        return res.status(400).json({ 
          error: `Lo sentimos, esta clase ya tiene ${MAX_BOOKINGS_PER_CLASS} reservaciones para esta fecha y hora. Por favor selecciona otra fecha u hora.`,
          code: 'CLASS_FULL'
        })
      }
    }

    // Si es reserva con paquete, manejar directamente
    if (bookingData.paymentMethod === 'package' && bookingData.packageId && bookingData.customer?.email) {
      const updatedPackage = usePackageClass(bookingData.packageId, bookingData.customer.email)
      if (!updatedPackage) {
        return res.status(400).json({ 
          error: 'No tienes clases disponibles en este paquete o el paquete no existe.',
          code: 'NO_CLASSES_AVAILABLE'
        })
      }
      
      bookingData.packageInfo = {
        packageId: updatedPackage.id,
        packageName: updatedPackage.packageName,
        classesRemaining: updatedPackage.classesRemaining
      }
      
      const booking = {
        id: Date.now().toString(),
        ...bookingData,
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        paymentStatus: 'succeeded'
      }

      const savedBooking = saveBooking(booking)
      return res.json({
        success: true,
        booking: savedBooking
      })
    }

    // Si no es paquete, requiere paymentIntentId
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment Intent ID is required for card payments' })
    }

    // Verificar el estado del Payment Intent
    let paymentIntent
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    } catch (stripeError) {
      // Si el PaymentIntent no existe, pero tenemos bookingData, verificar disponibilidad antes de guardar
      console.warn(`⚠️ PaymentIntent ${paymentIntentId} no encontrado, pero guardando reserva de todas formas`)
      
      // Verificar disponibilidad nuevamente antes de guardar
      if (bookingData.className && bookingData.date && bookingData.time) {
        const currentCount = countBookingsForClass(bookingData.className, bookingData.date, bookingData.time)
        if (currentCount >= MAX_BOOKINGS_PER_CLASS) {
          return res.status(400).json({ 
            error: `Lo sentimos, esta clase ya tiene ${MAX_BOOKINGS_PER_CLASS} reservaciones para esta fecha y hora. Por favor selecciona otra fecha u hora.`,
            code: 'CLASS_FULL'
          })
        }
      }
      
      // Guardar la reserva sin verificar el PaymentIntent
      const booking = {
        id: Date.now().toString(),
        ...bookingData,
        paymentIntentId: paymentIntentId,
        paymentStatus: 'succeeded', // Asumir succeeded si el frontend lo confirma
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        note: 'PaymentIntent no encontrado en Stripe, pero pago confirmado en frontend'
      }

      const savedBooking = saveBooking(booking)

      return res.json({
        success: true,
        booking: savedBooking,
        warning: 'PaymentIntent no encontrado en Stripe, pero reserva guardada'
      })
    }

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        error: 'Payment not completed',
        status: paymentIntent.status 
      })
    }

    // Verificar disponibilidad una vez más antes de guardar (por si acaso cambió entre la primera verificación y ahora)
    if (bookingData.className && bookingData.date && bookingData.time) {
      const currentCount = countBookingsForClass(bookingData.className, bookingData.date, bookingData.time)
      if (currentCount >= MAX_BOOKINGS_PER_CLASS) {
        return res.status(400).json({ 
          error: `Lo sentimos, esta clase ya tiene ${MAX_BOOKINGS_PER_CLASS} reservaciones para esta fecha y hora. Por favor selecciona otra fecha u hora.`,
          code: 'CLASS_FULL'
        })
      }
    }

    // Si es reserva con paquete, verificar y usar una clase del paquete
    if (bookingData.paymentMethod === 'package' && bookingData.packageId && bookingData.customer?.email) {
      const updatedPackage = usePackageClass(bookingData.packageId, bookingData.customer.email)
      if (!updatedPackage) {
        return res.status(400).json({ 
          error: 'No tienes clases disponibles en este paquete o el paquete no existe.',
          code: 'NO_CLASSES_AVAILABLE'
        })
      }
      bookingData.packageInfo = {
        packageId: updatedPackage.id,
        packageName: updatedPackage.packageName,
        classesRemaining: updatedPackage.classesRemaining
      }
    }

    // Guardar la reserva
    const booking = {
      id: Date.now().toString(),
      ...bookingData,
      paymentIntentId: paymentIntentId,
      paymentStatus: paymentIntent.status,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    }

    const savedBooking = saveBooking(booking)

    res.json({
      success: true,
      booking: savedBooking,
    })
  } catch (error) {
    console.error('Error confirming booking:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint: Guardar reserva directamente (sin confirmar PaymentIntent)
app.post('/api/bookings', (req, res) => {
  try {
    const bookingData = req.body
    
    // Verificar disponibilidad antes de guardar
    if (bookingData.className && bookingData.date && bookingData.time) {
      const currentCount = countBookingsForClass(bookingData.className, bookingData.date, bookingData.time)
      if (currentCount >= MAX_BOOKINGS_PER_CLASS) {
        return res.status(400).json({ 
          error: `Lo sentimos, esta clase ya tiene ${MAX_BOOKINGS_PER_CLASS} reservaciones para esta fecha y hora. Por favor selecciona otra fecha u hora.`,
          code: 'CLASS_FULL'
        })
      }
    }
    
    // Si es reserva con paquete, verificar y usar una clase del paquete
    if (bookingData.paymentMethod === 'package' && bookingData.packageId && bookingData.customer?.email) {
      const updatedPackage = usePackageClass(bookingData.packageId, bookingData.customer.email)
      if (!updatedPackage) {
        return res.status(400).json({ 
          error: 'No tienes clases disponibles en este paquete o el paquete no existe.',
          code: 'NO_CLASSES_AVAILABLE'
        })
      }
      bookingData.packageInfo = {
        packageId: updatedPackage.id,
        packageName: updatedPackage.packageName,
        classesRemaining: updatedPackage.classesRemaining
      }
    }
    
    const booking = {
      id: Date.now().toString(),
      ...bookingData,
      createdAt: new Date().toISOString(),
      status: bookingData.payment?.status === 'succeeded' || bookingData.paymentMethod === 'package' ? 'confirmed' : 'pending'
    }

    const savedBooking = saveBooking(booking)
    console.log('✅ Reserva guardada:', {
      id: savedBooking.id,
      className: savedBooking.className,
      customer: savedBooking.customer?.fullName,
      paymentStatus: savedBooking.payment?.status,
      paymentMethod: savedBooking.paymentMethod
    })

    res.json({
      success: true,
      booking: savedBooking
    })
  } catch (error) {
    console.error('Error saving booking:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint: Obtener todas las reservas
app.get('/api/bookings', (req, res) => {
  try {
    const bookings = getBookings()
    res.json(bookings)
  } catch (error) {
    console.error('Error getting bookings:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint: Obtener reservas de un usuario por email (debe ir antes de /:id)
app.get('/api/bookings/user/:email', (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email)
    const bookings = getBookings()
    const userBookings = bookings.filter(
      b => b.customer?.email?.toLowerCase() === email.toLowerCase() && b.status === 'confirmed'
    )
    // Ordenar por fecha y hora (más próximas primero)
    userBookings.sort((a, b) => {
      const da = new Date(`${a.date}T${a.time}`)
      const db = new Date(`${b.date}T${b.time}`)
      return da - db
    })
    res.json(userBookings)
  } catch (error) {
    console.error('Error getting user bookings:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint: Obtener reserva por ID
app.get('/api/bookings/:id', (req, res) => {
  try {
    const bookings = getBookings()
    const booking = bookings.find(b => b.id === req.params.id)
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }
    
    res.json(booking)
  } catch (error) {
    console.error('Error getting booking:', error)
    res.status(500).json({ error: error.message })
  }
})

// Anticipación mínima para reagendar (48 horas)
const RESCHEDULE_MIN_HOURS = 48

// Endpoint: Reagendar una reserva (solo si queda al menos 48 h para la clase)
app.patch('/api/bookings/:id/reschedule', (req, res) => {
  try {
    const { id } = req.params
    const { newDate, newTime, userEmail } = req.body

    if (!newDate || !newTime) {
      return res.status(400).json({ error: 'Debes indicar la nueva fecha y hora (newDate, newTime).' })
    }

    const bookings = getBookings()
    const booking = bookings.find(b => b.id === id)
    if (!booking) {
      return res.status(404).json({ error: 'Reserva no encontrada.' })
    }

    const ownerEmail = booking.customer?.email?.toLowerCase()
    if (!ownerEmail || (userEmail && userEmail.toLowerCase() !== ownerEmail)) {
      return res.status(403).json({ error: 'No puedes reagendar esta reserva.' })
    }

    const bookingDateTime = new Date(`${booking.date}T${booking.time}`)
    const now = new Date()
    const hoursUntil = (bookingDateTime - now) / (1000 * 60 * 60)
    if (hoursUntil < RESCHEDULE_MIN_HOURS) {
      return res.status(400).json({
        error: `Solo puedes reagendar con al menos ${RESCHEDULE_MIN_HOURS} horas de anticipación a la clase. Esta clase es en menos de ${RESCHEDULE_MIN_HOURS} horas.`
      })
    }

    if (booking.date === newDate && booking.time === newTime) {
      return res.status(400).json({ error: 'La nueva fecha y hora son iguales a la actual. Elige otra opción.' })
    }

    const newCount = countBookingsForClass(booking.className, newDate, newTime)
    if (newCount >= MAX_BOOKINGS_PER_CLASS) {
      return res.status(400).json({
        error: 'No hay lugares disponibles en esa fecha y hora. Elige otra opción.'
      })
    }

    const newFormattedDate = format(new Date(newDate), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
    const updated = updateBooking(id, {
      date: newDate,
      time: newTime,
      formattedDate: newFormattedDate
    })
    res.json({ success: true, booking: updated })
  } catch (error) {
    console.error('Error rescheduling booking:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint: Verificar disponibilidad de una clase
app.get('/api/bookings/availability/:className/:date/:time', (req, res) => {
  try {
    const { className, date, time } = req.params
    const currentCount = countBookingsForClass(className, date, time)
    const isAvailable = currentCount < MAX_BOOKINGS_PER_CLASS
    const remainingSpots = Math.max(0, MAX_BOOKINGS_PER_CLASS - currentCount)
    
    res.json({
      available: isAvailable,
      currentCount,
      maxBookings: MAX_BOOKINGS_PER_CLASS,
      remainingSpots
    })
  } catch (error) {
    console.error('Error checking availability:', error)
    res.status(500).json({ error: error.message })
  }
})

// Webhook de Stripe para eventos de pago
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
    } else {
      // En desarrollo, parsear el evento directamente
      event = JSON.parse(req.body.toString())
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Manejar diferentes tipos de eventos
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object
      console.log('PaymentIntent succeeded:', paymentIntent.id)
      
      // Actualizar reserva si existe
      const bookings = getBookings()
      const booking = bookings.find(b => b.paymentIntentId === paymentIntent.id)
      if (booking) {
        updateBooking(booking.id, {
          paymentStatus: 'succeeded',
          status: 'confirmed',
        })
      }
      break

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object
      console.log('PaymentIntent failed:', failedPayment.id)
      
      const failedBookings = getBookings()
      const failedBooking = failedBookings.find(b => b.paymentIntentId === failedPayment.id)
      if (failedBooking) {
        updateBooking(failedBooking.id, {
          paymentStatus: 'failed',
          status: 'pending',
        })
      }
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  res.json({ received: true })
})

// Función helper para leer usuarios
const getUsers = () => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading users:', error)
    return []
  }
}

// Endpoint: Obtener usuario por email
app.get('/api/users/email/:email', (req, res) => {
  try {
    const { email } = req.params
    const users = getUsers()
    const user = users.find(u => u.email === email)
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    
    // No devolver la contraseña
    const { password: _, ...userWithoutPassword } = user
    
    res.json(userWithoutPassword)
  } catch (error) {
    console.error('Error getting user by email:', error)
    res.status(500).json({ error: error.message })
  }
})

// Función helper para guardar usuarios
const saveUser = (user) => {
  try {
    const users = getUsers()
    users.push(user)
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
    return user
  } catch (error) {
    console.error('Error saving user:', error)
    throw error
  }
}

// Función helper para generar token simple (en producción usar JWT real)
const generateToken = (user) => {
  // Asegurar que el teléfono esté presente (puede ser string vacío pero debe existir)
  const userPhone = user.phone !== undefined && user.phone !== null ? String(user.phone) : ''
  
  const payload = {
    userId: user.id,
    email: user.email,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: userPhone // Incluir teléfono en el token (siempre como string)
    },
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 días
  }
  
  console.log('🔑 Generando token con payload:', {
    email: payload.email,
    firstName: payload.user.firstName,
    lastName: payload.user.lastName,
    phone: payload.user.phone,
    phoneType: typeof payload.user.phone,
    phoneLength: payload.user.phone?.length || 0
  })
  
  const token = Buffer.from(JSON.stringify(payload)).toString('base64')
  
  // Verificar que el token se puede decodificar correctamente
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
    if (!decoded.user.phone && user.phone) {
      console.error('❌ ERROR: El teléfono no se incluyó en el token aunque estaba presente en el usuario')
    }
  } catch (e) {
    console.error('❌ Error verificando token generado:', e)
  }
  
  return token
}

// Función helper para generar token de administrador
const generateAdminToken = (admin) => {
  const payload = {
    adminId: admin.id,
    email: admin.email,
    role: 'admin',
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

// Lista inicial de administradores (se copia a admins.json la primera vez)
const DEFAULT_ADMINS = [
  {
    id: 'admin-1',
    email: 'info@estudiopopnest.com',
    password: 'admin123',
    name: 'Administrador Principal'
  }
]

const getAdmins = () => {
  try {
    if (fs.existsSync(ADMINS_FILE)) {
      return JSON.parse(fs.readFileSync(ADMINS_FILE, 'utf8'))
    }
    fs.writeFileSync(ADMINS_FILE, JSON.stringify(DEFAULT_ADMINS, null, 2))
    return DEFAULT_ADMINS
  } catch (e) {
    console.error('Error reading admins:', e)
    return DEFAULT_ADMINS
  }
}

const updateAdminPassword = (email, newPassword) => {
  const admins = getAdmins()
  const normalized = email.trim().toLowerCase()
  const idx = admins.findIndex(a => a.email && a.email.toLowerCase() === normalized)
  if (idx === -1) return null
  admins[idx].password = newPassword
  fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2))
  return admins[idx]
}

const getAdminResetTokens = () => {
  try {
    if (fs.existsSync(ADMIN_RESET_TOKENS_FILE)) {
      return JSON.parse(fs.readFileSync(ADMIN_RESET_TOKENS_FILE, 'utf8'))
    }
    return []
  } catch (e) {
    return []
  }
}
const saveAdminResetToken = (token, email) => {
  const tokens = getAdminResetTokens().filter(t => t.email !== email)
  tokens.push({ token, email, expiresAt: Date.now() + RESET_TOKEN_EXPIRY_MS })
  fs.writeFileSync(ADMIN_RESET_TOKENS_FILE, JSON.stringify(tokens, null, 2))
}
const consumeAdminResetToken = (token) => {
  const tokens = getAdminResetTokens()
  const now = Date.now()
  const valid = tokens.find(t => t.token === token && t.expiresAt > now)
  if (!valid) return null
  const rest = tokens.filter(t => t.token !== token)
  fs.writeFileSync(ADMIN_RESET_TOKENS_FILE, JSON.stringify(rest, null, 2))
  return valid.email
}

// Endpoint: Login de administrador
app.post('/api/auth/admin/login', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json')
    
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email y contraseña son requeridos' 
      })
    }

    const admins = getAdmins()
    const admin = admins.find(a => a.email === email && a.password === password)

    if (!admin) {
      return res.status(401).json({ 
        success: false,
        error: 'Credenciales inválidas' 
      })
    }

    const token = generateAdminToken(admin)
    
    // No devolver la contraseña
    const { password: _, ...adminWithoutPassword } = admin

    res.json({
      success: true,
      admin: adminWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Error in admin login:', error)
    res.status(500).json({ 
      success: false,
      error: error.message || 'Error interno del servidor' 
    })
  }
})

// Endpoint: Olvidé mi contraseña (administrador) - envía correo con enlace
app.post('/api/auth/admin/forgot-password', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json')
    const { email } = req.body
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, error: 'El correo es requerido' })
    }
    const normalizedEmail = email.trim().toLowerCase()
    const admins = getAdmins()
    const admin = admins.find(a => a.email && a.email.toLowerCase() === normalizedEmail)
    if (admin) {
      const resetToken = crypto.randomBytes(32).toString('hex')
      saveAdminResetToken(resetToken, normalizedEmail)
      await sendAdminPasswordResetEmail(admin.email, resetToken)
    }
    res.json({ success: true, message: 'Si existe una cuenta de administrador con ese correo, recibirás un enlace para restablecer tu contraseña.' })
  } catch (error) {
    console.error('Error in admin forgot-password:', error)
    res.status(500).json({ success: false, error: error.message || 'Error interno del servidor' })
  }
})

// Endpoint: Restablecer contraseña de administrador con token del correo
app.post('/api/auth/admin/reset-password', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json')
    const { token, newPassword } = req.body
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, error: 'Token y nueva contraseña son requeridos' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres' })
    }
    const email = consumeAdminResetToken(token)
    if (!email) {
      return res.status(400).json({ success: false, error: 'Enlace inválido o expirado. Solicita uno nuevo.' })
    }
    const updated = updateAdminPassword(email, newPassword)
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Administrador no encontrado' })
    }
    res.json({ success: true, message: 'Contraseña actualizada. Ya puedes iniciar sesión en el panel de administración.' })
  } catch (error) {
    console.error('Error in admin reset-password:', error)
    res.status(500).json({ success: false, error: error.message || 'Error interno del servidor' })
  }
})

// Endpoint: Registro de usuario
app.post('/api/auth/signup', (req, res) => {
  try {
    // Asegurar que siempre devolvamos JSON
    res.setHeader('Content-Type', 'application/json')
    
    const { firstName, lastName, email, phone, password } = req.body

    // Validar que todos los campos estén presentes
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Todos los campos son requeridos' 
      })
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres' 
      })
    }

    const users = getUsers()
    
    // Verificar si el email ya existe
    const existingUser = users.find(u => u.email === email)
    if (existingUser) {
      // Si el usuario existe pero fue creado automáticamente (sin contraseña), permitir actualizar
      if (!existingUser.password || existingUser.password.trim() === '') {
        // Actualizar el usuario existente con los nuevos datos
        const updatedUser = updateUser(existingUser.id, {
          firstName,
          lastName,
          phone,
          password,
          autoCreated: false
        })
        const token = generateToken(updatedUser)
        const { password: _, ...userWithoutPassword } = updatedUser
        
        return res.json({
          success: true,
          user: userWithoutPassword,
          token,
          message: 'Tu cuenta ha sido actualizada exitosamente'
        })
      }
      
      return res.status(400).json({ 
        success: false,
        error: 'Este correo electrónico ya está registrado' 
      })
    }

    // Normalizar el teléfono (eliminar espacios extra, pero mantener el formato)
    const normalizedPhone = phone ? phone.trim() : ''
    
    const newUser = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      phone: normalizedPhone,
      password, // En producción, hashear la contraseña con bcrypt
      createdAt: new Date().toISOString(),
      autoCreated: false
    }

    const savedUser = saveUser(newUser)
    console.log('✅ Usuario guardado:', {
      id: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      phone: savedUser.phone,
      phoneLength: savedUser.phone?.length || 0
    })

    // Enviar email de bienvenida (no bloquea la respuesta)
    sendWelcomeEmail(savedUser).catch(() => {})

    // Verificar que el teléfono esté presente antes de generar el token
    if (!savedUser.phone || savedUser.phone.trim() === '') {
      console.warn('⚠️ ADVERTENCIA: Usuario guardado sin teléfono')
    }
    
    const token = generateToken(savedUser)
    console.log('✅ Token generado para usuario:', savedUser.email)
    
    // Verificar que el token incluya el teléfono
    try {
      const tokenPayload = JSON.parse(Buffer.from(token, 'base64').toString())
      console.log('✅ Verificación del token - teléfono incluido:', tokenPayload.user?.phone || 'NO INCLUIDO')
    } catch (e) {
      console.error('❌ Error verificando token:', e)
    }

    // No devolver la contraseña
    const { password: _, ...userWithoutPassword } = savedUser

    res.json({
      success: true,
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Error in signup:', error)
    // Asegurar que siempre devolvamos JSON incluso en errores
    res.status(500).json({ 
      success: false,
      error: error.message || 'Error interno del servidor' 
    })
  }
})

// Función helper para actualizar usuario
const updateUser = (userId, updates) => {
  try {
    const users = getUsers()
    const userIndex = users.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado')
    }
    users[userIndex] = { ...users[userIndex], ...updates }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
    return users[userIndex]
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

// Endpoint: Establecer contraseña para usuarios auto-creados
app.post('/api/auth/set-password', (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
    }

    const users = getUsers()
    const user = users.find(u => u.email === email)

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    // Solo permitir establecer contraseña si no tiene una o está vacía
    if (user.password && user.password.trim() !== '') {
      return res.status(400).json({ error: 'Este usuario ya tiene una contraseña establecida' })
    }

    // Actualizar la contraseña
    const updatedUser = updateUser(user.id, { password })
    const token = generateToken(updatedUser)
    
    // No devolver la contraseña
    const { password: _, ...userWithoutPassword } = updatedUser

    res.json({
      success: true,
      user: userWithoutPassword,
      token,
      message: 'Contraseña establecida exitosamente'
    })
  } catch (error) {
    console.error('Error setting password:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint: Olvidé mi contraseña - envía correo con enlace
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json')
    const { email } = req.body
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, error: 'El correo es requerido' })
    }
    const normalizedEmail = email.trim().toLowerCase()
    const users = getUsers()
    const user = users.find(u => u.email && u.email.toLowerCase() === normalizedEmail)
    // Siempre respondemos igual para no revelar si el correo existe
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex')
      saveResetToken(resetToken, normalizedEmail)
      await sendPasswordResetEmail(user.email, resetToken)
    }
    res.json({ success: true, message: 'Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.' })
  } catch (error) {
    console.error('Error in forgot-password:', error)
    res.status(500).json({ success: false, error: error.message || 'Error interno del servidor' })
  }
})

// Endpoint: Restablecer contraseña con token del correo
app.post('/api/auth/reset-password', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json')
    const { token, newPassword } = req.body
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, error: 'Token y nueva contraseña son requeridos' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres' })
    }
    const email = consumeResetToken(token)
    if (!email) {
      return res.status(400).json({ success: false, error: 'Enlace inválido o expirado. Solicita uno nuevo.' })
    }
    const users = getUsers()
    const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' })
    }
    updateUser(user.id, { password: newPassword })
    res.json({ success: true, message: 'Contraseña actualizada. Ya puedes iniciar sesión.' })
  } catch (error) {
    console.error('Error in reset-password:', error)
    res.status(500).json({ success: false, error: error.message || 'Error interno del servidor' })
  }
})

// Endpoint: Inicio de sesión
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' })
    }

    const users = getUsers()
    const user = users.find(u => u.email === email)

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    // Si el usuario no tiene contraseña o tiene contraseña vacía, indicar que necesita establecerla
    if (!user.password || user.password.trim() === '') {
      return res.status(200).json({
        success: false,
        needsPassword: true,
        message: 'Este usuario fue creado automáticamente. Por favor establece una contraseña para continuar.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      })
    }

    // Si se proporcionó contraseña, validarla
    if (!password) {
      return res.status(400).json({ error: 'Contraseña es requerida' })
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const token = generateToken(user)
    
    // No devolver la contraseña
    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Error in login:', error)
    res.status(500).json({ error: error.message })
  }
})

// Archivo para guardar compras de paquetes
const PACKAGES_FILE = join(__dirname, 'packages.json')

// Función helper para leer compras de paquetes
const getPackages = () => {
  try {
    if (fs.existsSync(PACKAGES_FILE)) {
      const data = fs.readFileSync(PACKAGES_FILE, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading packages:', error)
    return []
  }
}

// Función helper para guardar compra de paquete
const savePackagePurchase = (purchase) => {
  try {
    const purchases = getPackages()
    purchases.push(purchase)
    fs.writeFileSync(PACKAGES_FILE, JSON.stringify(purchases, null, 2))
    return purchase
  } catch (error) {
    console.error('Error saving package purchase:', error)
    throw error
  }
}

// Endpoint: Comprar paquete
app.post('/api/packages/purchase', (req, res) => {
  try {
    const purchaseData = req.body
    
    // Verificar que el usuario esté autenticado (el email debe existir en la base de datos)
    if (!purchaseData.customer?.email) {
      return res.status(400).json({ 
        success: false,
        error: 'Se requiere información del cliente' 
      })
    }

    const users = getUsers()
    const existingUser = users.find(u => u.email === purchaseData.customer.email)
    
    if (!existingUser) {
      return res.status(401).json({ 
        success: false,
        error: 'Debes estar registrado e iniciar sesión para comprar un paquete' 
      })
    }

    // Verificar que el usuario tenga una contraseña establecida (no fue creado automáticamente)
    if (!existingUser.password || existingUser.password.trim() === '') {
      return res.status(401).json({ 
        success: false,
        error: 'Debes completar tu registro estableciendo una contraseña antes de comprar un paquete' 
      })
    }
    
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setMonth(expiresAt.getMonth() + 2) // Expira en 2 meses

    const purchase = {
      id: Date.now().toString(),
      ...purchaseData,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      classesRemaining: purchaseData.classes || 10,
      classesUsed: 0,
      userId: existingUser.id
    }

    const savedPurchase = savePackagePurchase(purchase)
    console.log('✅ Compra de paquete guardada:', {
      id: savedPurchase.id,
      packageName: savedPurchase.packageName,
      customer: savedPurchase.customer?.fullName,
      userId: savedPurchase.userId,
      paymentStatus: savedPurchase.payment?.status,
      classesRemaining: savedPurchase.classesRemaining
    })

    res.json({
      success: true,
      purchase: savedPurchase
    })
  } catch (error) {
    console.error('Error saving package purchase:', error)
    res.status(500).json({ 
      success: false,
      error: error.message 
    })
  }
})

// Función helper para obtener paquetes activos de un usuario (no expirados)
const getUserActivePackages = (email) => {
  try {
    const purchases = getPackages()
    const now = new Date()
    return purchases.filter(p => 
      p.customer?.email === email && 
      p.status === 'confirmed' && 
      (p.classesRemaining || 0) > 0 &&
      (!p.expiresAt || new Date(p.expiresAt) > now)
    )
  } catch (error) {
    console.error('Error getting user packages:', error)
    return []
  }
}

// Función helper para usar una clase de un paquete (solo si no ha expirado)
const usePackageClass = (packageId, email) => {
  try {
    const purchases = getPackages()
    const now = new Date()
    const purchase = purchases.find(p => 
      p.id === packageId && 
      p.customer?.email === email &&
      (p.classesRemaining || 0) > 0 &&
      (!p.expiresAt || new Date(p.expiresAt) > now)
    )
    
    if (!purchase) {
      return null
    }
    
    purchase.classesRemaining = (purchase.classesRemaining || purchase.classes) - 1
    purchase.classesUsed = (purchase.classesUsed || 0) + 1
    purchase.lastUsed = new Date().toISOString()
    
    fs.writeFileSync(PACKAGES_FILE, JSON.stringify(purchases, null, 2))
    return purchase
  } catch (error) {
    console.error('Error using package class:', error)
    return null
  }
}

// Endpoint: Obtener todas las compras de paquetes
app.get('/api/packages', (req, res) => {
  try {
    const purchases = getPackages()
    res.json(purchases)
  } catch (error) {
    console.error('Error getting packages:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint: Obtener paquetes activos de un usuario
app.get('/api/packages/user/:email', (req, res) => {
  try {
    const { email } = req.params
    const activePackages = getUserActivePackages(email)
    const totalClassesRemaining = activePackages.reduce((sum, pkg) => sum + (pkg.classesRemaining || 0), 0)
    
    res.json({
      packages: activePackages,
      totalClassesRemaining,
      hasActivePackages: activePackages.length > 0
    })
  } catch (error) {
    console.error('Error getting user packages:', error)
    res.status(500).json({ error: error.message })
  }
})

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'Estudio Popnest Wellness API Server',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      bookings: '/api/bookings',
      auth: '/api/auth/login, /api/auth/signup',
      packages: '/api/packages'
    },
    timestamp: new Date().toISOString()
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Middleware de manejo de errores - debe ir después de todas las rutas
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// Middleware para rutas no encontradas - debe ir al final
app.use((req, res) => {
  // Solo devolver JSON para rutas que empiezan con /api
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint no encontrado' })
  }
  // Para otras rutas, devolver un mensaje simple (no HTML)
  res.status(404).json({ error: 'Ruta no encontrada' })
})

const HOST = process.env.HOST || '0.0.0.0'
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`)
  console.log(`📝 Bookings file: ${BOOKINGS_FILE}`)
  console.log(`👥 Users file: ${USERS_FILE}`)
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️  STRIPE_SECRET_KEY not set. Stripe features will not work.')
  }
})
