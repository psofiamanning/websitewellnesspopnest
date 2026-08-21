import express from 'express'
import cors from 'cors'
import Stripe from 'stripe'
import nodemailer from 'nodemailer'
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import crypto from 'node:crypto'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  getBookings,
  getBookingById,
  saveBooking,
  updateBooking,
  isUsingSupabase,
  findBookingByStripePaymentIntentId,
  getAvailabilityForSlot,
} from './db/bookings.js'
import {
  listActiveTalleres,
  listAllTalleres,
  getTallerById,
  createTaller,
  updateTaller,
  deleteTaller,
  decrementTallerSpot,
  createTallerBooking,
  listTallerBookings,
  uploadTallerImage,
} from './db/talleres.js'
import { isTalleresAiConfigured, generateTallerFromPrompt } from './talleresAi.js'
import {
  isUsingSupabaseForUsers,
  getProfileByEmail,
  profileToApiUser,
  verifyAuthJwt,
  getProfileForAuthUser,
  upsertProfileForAuthUser,
} from './db/users.js'
import {
  listAllPackagePurchases,
  getUserActivePackagesByEmail,
  getUserAllPackagesByEmail,
  getUserActivePackagesByProfileId,
  insertCustomerPackageAfterPayment,
  grantCustomerPackageManual,
  grantAdminClassCredits,
  addClassesToCustomerPackage,
  listCustomerPackagesByEmail,
  resolveProfileIdForPackagePurchase,
} from './db/packages.js'
import { getSupabaseAnon } from './db/supabaseClient.js'
import { validateDiscountCodeForCustomer } from './db/discountCodes.js'
import { findPackageDiscountCode, normalizePackageDiscountCode } from './config/packageDiscountCodes.js'
import { saveLeadEmail } from './db/leads.js'
import { isMailerLiteConfigured, upsertMailerLiteSubscriber } from './mailerlite.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// Cargar .env desde la carpeta server/ (no depende del directorio de trabajo)
const envPath = join(__dirname, '.env')
const envExists = fs.existsSync(envPath)
const dotenvResult = dotenv.config({ path: envPath })
if (!envExists) {
  console.error('❌ server/.env no encontrado en:', envPath)
} else if (dotenvResult.error) {
  console.error('❌ Error leyendo server/.env:', dotenvResult.error.message)
} else {
  const keys = dotenvResult.parsed ? Object.keys(dotenvResult.parsed) : []
  const hasSupabase = keys.some(k => k.startsWith('SUPABASE_'))
  if (!hasSupabase) {
    console.warn('⚠️ server/.env cargado pero no hay variables SUPABASE_* (nombres:', keys.join(', ') || 'ninguno', ')')
  }
  // Verificar que process.env las tenga (por si hay caracteres raros en los nombres)
  const urlRightAfter = process.env.SUPABASE_URL
  const keyRightAfter = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!urlRightAfter || !keyRightAfter) {
    console.warn('⚠️ Justo después de cargar .env: SUPABASE_URL=', urlRightAfter ? 'ok' : 'undefined', 'SUPABASE_SERVICE_ROLE_KEY=', keyRightAfter ? 'ok' : 'undefined')
  }
}

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
// Webhook de Stripe debe recibir el body RAW (sin parsear) para verificar la firma.
// Por eso se declara ANTES de express.json().
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event
  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
    } else {
      event = JSON.parse(req.body.toString())
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        console.log('PaymentIntent succeeded:', paymentIntent.id)
        const booking = await findBookingByStripePaymentIntentId(paymentIntent.id)
        if (booking) {
          await updateBooking(booking.id, { paymentStatus: 'succeeded', status: 'confirmed' })
          const updated = await getBookingById(booking.id)
          if (updated?.customer?.email) sendBookingConfirmationEmail(updated).catch(() => {})
        } else if (paymentIntent.metadata?.purchase_type === 'package') {
          // Respaldo: si el pago de un paquete se cobró pero el navegador no logró
          // registrarlo (sesión caída, red, etc.), lo registramos aquí desde el servidor.
          // insertCustomerPackageAfterPayment es idempotente por Payment Intent.
          try {
            const email = (paymentIntent.metadata.customer_email || '').trim().toLowerCase()
            const packageName = paymentIntent.metadata.package_name || ''
            if (!email || !packageName) {
              console.error('⚠️ [webhook] Pago de paquete sin email/nombre en metadata:', paymentIntent.id)
            } else {
              const profile = await getProfileByEmail(email)
              if (!profile?.id) {
                console.error(`⚠️ [webhook] Paquete pagado (${paymentIntent.id}) pero SIN perfil para ${email}. Requiere alta manual.`)
              } else {
                const backupPurchase = await insertCustomerPackageAfterPayment({
                  profileId: profile.id,
                  packageName,
                  amountPaid: paymentIntent.amount, // centavos, igual que el flujo del navegador
                  stripePaymentIntentId: paymentIntent.id,
                  paymentStatus: 'succeeded',
                  referredBy: paymentIntent.metadata.referred_by || null,
                })
                console.log('✅ [webhook] Paquete registrado como respaldo:', paymentIntent.id, email, packageName)
                if (backupPurchase._isNewPayment) {
                  sendPackageConfirmationEmail(backupPurchase).catch(() => {})
                }
              }
            }
          } catch (pkgErr) {
            console.error('⚠️ [webhook] Error en respaldo de paquete:', paymentIntent.id, pkgErr.message)
          }
        }
        break
      }
      case 'payment_intent.payment_failed': {
        const failedPayment = event.data.object
        console.log('PaymentIntent failed:', failedPayment.id)
        const failedBooking = await findBookingByStripePaymentIntentId(failedPayment.id)
        if (failedBooking) await updateBooking(failedBooking.id, { paymentStatus: 'failed', status: 'pending' })
        break
      }
      default:
        console.log(`Unhandled event type ${event.type}`)
    }
    res.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    res.status(500).json({ error: err.message })
  }
})
app.use(express.json({ limit: '15mb' })) // límite alto: subida de imágenes de talleres en base64

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

// --- Email: MailerSend (recomendado, ecosistema MailerLite) o SMTP Gmail ---
const MAILERSEND_API_KEY = (process.env.MAILERSEND_API_KEY || '').trim()
const MAILERSEND_FROM_EMAIL = (process.env.MAILERSEND_FROM_EMAIL || process.env.SMTP_MAIL_USER || 'info@estudiopopnest.com').trim()
const MAILERSEND_FROM_NAME = process.env.MAILERSEND_FROM_NAME || 'Estudio Popnest Wellness'

const mailerSend = MAILERSEND_API_KEY
  ? new MailerSend({ apiKey: MAILERSEND_API_KEY })
  : null

const mailUser = (process.env.SMTP_MAIL_USER || '').trim()
const mailAppPassword = (process.env.SMTP_MAIL_APP_PASSWORD || '').trim().replace(/\s/g, '')
const mailTransporter = (!mailerSend && mailUser && mailAppPassword)
  ? nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: mailUser, pass: mailAppPassword },
      connectionTimeout: 15000
    })
  : null

if (mailerSend) {
  console.log('✅ Correo vía MailerSend (MailerLite) desde:', MAILERSEND_FROM_EMAIL)
} else if (mailTransporter) {
  mailTransporter.verify().then(() => {
    console.log('✅ SMTP listo (correo desde:', mailUser + ')')
  }).catch((err) => {
    console.error('❌ SMTP no pudo conectar/autenticar:', err.message)
  })
} else {
  console.warn('⚠️ Correo no configurado: usa MAILERSEND_API_KEY (recomendado) o SMTP_MAIL_USER + SMTP_MAIL_APP_PASSWORD.')
}

/** Envía un correo usando MailerSend o, si no, Nodemailer (SMTP). */
async function sendEmail({ to, toName = '', subject, text, html }) {
  if (mailerSend) {
    const sentFrom = new Sender(MAILERSEND_FROM_EMAIL, MAILERSEND_FROM_NAME)
    const recipients = [new Recipient(to, toName || to)]
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(subject)
      .setHtml(html || text)
      .setText(text)
    try {
      await mailerSend.email.send(emailParams)
    } catch (err) {
      // El SDK de MailerSend NO pone el motivo en err.message (queda undefined).
      // El detalle real viene en err.statusCode + err.body (p. ej. dominio no
      // verificado, cuenta trial, o remitente no permitido). Lo exponemos aquí.
      const status = err?.statusCode ?? err?.response?.status
      const body = err?.body ?? err?.response?.data
      const detail = body ? JSON.stringify(body) : (err?.message || String(err))
      throw new Error(`MailerSend falló (HTTP ${status ?? '??'}): ${detail}`)
    }
    return
  }
  if (mailTransporter) {
    await mailTransporter.sendMail({
      from: `"${MAILERSEND_FROM_NAME}" <${mailUser}>`,
      to,
      subject,
      text,
      html: html || text
    })
    return
  }
  throw new Error('No hay proveedor de correo configurado')
}

async function sendWelcomeEmail(user) {
  if (!user?.email) return
  if (!mailerSend && !mailTransporter) {
    console.warn('⚠️ Email de bienvenida no enviado (correo no configurado):', user.email)
    return
  }
  const subject = 'Bienvenido a Estudio Popnest Wellness'
  const text = `Hola ${user.firstName || ''},\n\nGracias por registrarte en Estudio Popnest Wellness. Ya puedes reservar clases y disfrutar de nuestro estudio.\n\nSaludos,\nEl equipo de Estudio Popnest Wellness`
  const html = `<p>Hola <strong>${user.firstName || ''}</strong>,</p><p>Gracias por registrarte en <strong>Estudio Popnest Wellness</strong>. Ya puedes reservar clases y disfrutar de nuestro estudio.</p><p>Saludos,<br>El equipo de Estudio Popnest Wellness</p>`
  try {
    await sendEmail({ to: user.email, toName: user.firstName, subject, text, html })
    console.log('✅ Email de bienvenida enviado a:', user.email)
  } catch (err) {
    console.error('❌ Error enviando email de bienvenida a', user.email, ':', err.message)
  }
}

async function sendAdminPasswordResetEmail(email, resetToken) {
  if (!email) return
  if (!mailerSend && !mailTransporter) {
    console.warn('⚠️ Correo no configurado: no se envía enlace de restablecimiento de administrador a', email, '- Configura MAILERSEND_API_KEY o SMTP_MAIL_USER + SMTP_MAIL_APP_PASSWORD en server/.env')
    return
  }
  const resetLink = `${FRONTEND_URL}/admin/reset-password?token=${encodeURIComponent(resetToken)}`
  const subject = 'Restablecer contraseña de administrador - Estudio Popnest Wellness'
  const text = `Hola,\n\nRecibimos una solicitud para restablecer la contraseña del panel de administración. Haz clic en el siguiente enlace (válido 1 hora):\n\n${resetLink}\n\nSi no solicitaste esto, ignora este correo.\n\nSaludos,\nEstudio Popnest Wellness`
  const html = `<p>Hola,</p><p>Recibimos una solicitud para restablecer la contraseña del <strong>panel de administración</strong>.</p><p><a href="${resetLink}" style="color:#B73D37;font-weight:bold;">Restablecer contraseña de administrador</a></p><p>Este enlace es válido por 1 hora. Si no solicitaste esto, ignora este correo.</p><p>Saludos,<br>Estudio Popnest Wellness</p>`
  try {
    await sendEmail({ to: email, subject, text, html })
    console.log('✅ Email de restablecimiento (admin) enviado a:', email)
  } catch (err) {
    console.error('❌ Error enviando email de restablecimiento admin:', err.message)
  }
}

/** Envía el correo automático de bienvenida al capturar un lead de clase gratis. */
async function sendFreeClassEmail(email) {
  if (!email) return
  if (!mailerSend && !mailTransporter) {
    console.warn('⚠️ Email de clase gratis no enviado (correo no configurado):', email)
    return
  }
  const subject = '🎁 Tu clase gratis en Estudio Popnest Wellness'
  const text = `¡Hola!\n\nGracias por tu interés en Estudio Popnest Wellness. Aquí tienes tu clase de regalo.\n\nPara reservarla, entra a ${FRONTEND_URL}, elige el horario que prefieras y menciona este correo en recepción.\n\nTe esperamos,\nEl equipo de Estudio Popnest Wellness`
  const html = `<p>¡Hola!</p><p>Gracias por tu interés en <strong>Estudio Popnest Wellness</strong>. Aquí tienes tu <strong>clase de regalo</strong> 🎁</p><p>Para reservarla, entra a <a href="${FRONTEND_URL}" style="color:#B73D37;font-weight:bold;">nuestra web</a>, elige el horario que prefieras y menciona este correo en recepción.</p><p>Te esperamos,<br>El equipo de Estudio Popnest Wellness</p>`
  try {
    await sendEmail({ to: email, subject, text, html })
    console.log('✅ Email de clase gratis enviado a:', email)
  } catch (err) {
    console.error('❌ Error enviando email de clase gratis a', email, ':', err.message)
  }
}

/** Envía correo de confirmación de reserva al cliente. */
async function sendBookingConfirmationEmail(booking) {
  const email = booking?.customer?.email
  if (!email || (!mailerSend && !mailTransporter)) {
    if (!email) console.warn('⚠️ Reserva sin email, no se envía confirmación:', booking?.id)
    return
  }
  const name = booking.customer?.firstName || booking.customer?.name || ''
  const className = booking.className || 'Clase'
  const dateStr = booking.formattedDate || booking.date || ''
  const timeStr = booking.time || ''
  const dateTimeLine = [dateStr, timeStr].filter(Boolean).join(' · ')
  const subject = 'Reserva confirmada - Estudio Popnest Wellness'
  const text = `Hola ${name ? name + ',' : ''}\n\nTu reserva ha sido confirmada.\n\nClase: ${className}\nFecha y hora: ${dateTimeLine || 'Ver detalles en tu panel'}\n\nPuedes ver y gestionar tus reservas en "Mis reservas" en nuestra web.\n\nTe esperamos,\nEl equipo de Estudio Popnest Wellness`
  const html = `<p>Hola ${name ? `<strong>${name}</strong>,` : ''}</p><p>Tu reserva ha sido <strong>confirmada</strong>.</p><p><strong>Clase:</strong> ${className}<br><strong>Fecha y hora:</strong> ${dateTimeLine || 'Ver detalles en tu panel'}</p><p>Puedes ver y gestionar tus reservas en <strong>Mis reservas</strong> en nuestra web.</p><p>Te esperamos,<br>El equipo de Estudio Popnest Wellness</p>`
  try {
    await sendEmail({ to: email, toName: name, subject, text, html })
    console.log('✅ Email de confirmación de reserva enviado a:', email)
  } catch (err) {
    console.error('❌ Error enviando email de confirmación de reserva:', err.message)
  }
}

/** Envía correo de confirmación al comprar un paquete de clases. */
async function sendPackageConfirmationEmail(purchase) {
  const email = purchase?.customer?.email
  if (!email || (!mailerSend && !mailTransporter)) {
    if (!email) console.warn('⚠️ Compra de paquete sin email, no se envía confirmación:', purchase?.id)
    return
  }
  const name = purchase.customer?.firstName || ''
  const packageName = purchase.packageName || 'Paquete de clases'
  const classes = purchase.classes || 0
  const amount = ((purchase.payment?.amount || 0) / 100).toFixed(2)
  const currency = purchase.payment?.currency || 'MXN'
  const subject = 'Pago confirmado - Estudio Popnest Wellness'
  const text = `Hola ${name ? name + ',' : ''}\n\nTu pago fue confirmado.\n\nPaquete: ${packageName}\nClases: ${classes}\nMonto: $${amount} ${currency}\n\nYa puedes reservar tus clases en "Mis reservas" en nuestra web.\n\nGracias,\nEl equipo de Estudio Popnest Wellness`
  const html = `<p>Hola ${name ? `<strong>${name}</strong>,` : ''}</p><p>Tu pago fue <strong>confirmado</strong>.</p><p><strong>Paquete:</strong> ${packageName}<br><strong>Clases:</strong> ${classes}<br><strong>Monto:</strong> $${amount} ${currency}</p><p>Ya puedes reservar tus clases en <strong>Mis reservas</strong> en nuestra web.</p><p>Gracias,<br>El equipo de Estudio Popnest Wellness</p>`
  try {
    await sendEmail({ to: email, toName: name, subject, text, html })
    console.log('✅ Email de confirmación de paquete enviado a:', email)
  } catch (err) {
    console.error('❌ Error enviando email de confirmación de paquete:', err.message)
  }
}

// Archivos para guardar datos (admins, maestras, etc.)
const ADMINS_FILE = join(__dirname, 'admins.json')
const ADMIN_RESET_TOKENS_FILE = join(__dirname, 'admin-password-reset-tokens.json')
const TEACHERS_FILE = join(__dirname, 'teachers.json')
const MARKETING_ASSETS_DIR = join(__dirname, 'marketing-assets')
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const ADMIN_RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000 // 1 hora

async function assertSlotAvailable(className, date, time) {
  const slot = await getAvailabilityForSlot(className, date, time)
  if (!slot.schedule) {
    return {
      ok: false,
      message: 'No hay un horario activo para esa clase, fecha y hora.',
    }
  }
  if (!slot.available) {
    return {
      ok: false,
      message: `Lo sentimos, esta clase ya no tiene lugares disponibles para esta fecha y hora. Por favor selecciona otra fecha u hora.`,
    }
  }
  return { ok: true, slot }
}

// Endpoint: Crear Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'mxn', customerInfo, metadata: extraMetadata } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount is required and must be greater than 0' })
    }

    // Metadata extra (p. ej. tipo de compra y paquete). Stripe exige valores string.
    const safeExtra = {}
    if (extraMetadata && typeof extraMetadata === 'object') {
      for (const [k, v] of Object.entries(extraMetadata)) {
        if (v != null && v !== '') safeExtra[String(k)] = String(v)
      }
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
        ...safeExtra,
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

    // Si es reserva con paquete o código de descuento, no requiere paymentIntentId
    if (
      !paymentIntentId &&
      bookingData.paymentMethod !== 'package' &&
      bookingData.paymentMethod !== 'discount_code'
    ) {
      return res.status(400).json({ error: 'Payment Intent ID is required' })
    }

    if (bookingData.className && bookingData.date && bookingData.time) {
      const cap = await assertSlotAvailable(bookingData.className, bookingData.date, bookingData.time)
      if (!cap.ok) {
        return res.status(400).json({ error: cap.message, code: 'CLASS_FULL' })
      }
    }

    // Paquete o código de descuento: sin Stripe (saveBooking valida cupo y canje)
    if (
      (bookingData.paymentMethod === 'package' &&
        bookingData.packageId &&
        bookingData.customer?.email) ||
      (bookingData.paymentMethod === 'discount_code' &&
        bookingData.discountCode &&
        bookingData.customer?.email)
    ) {
      const booking = {
        ...bookingData,
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        paymentStatus: 'succeeded',
      }
      const savedBooking = await saveBooking(booking)
      sendBookingConfirmationEmail(savedBooking).catch(() => {})
      return res.json({
        success: true,
        booking: savedBooking,
      })
    }

    // Si no es paquete, requiere paymentIntentId
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment Intent ID is required for card payments' })
    }

    // Verificar el estado del Payment Intent. Si Stripe no lo confirma, no se
    // asume que el pago se hizo — hacerlo permitiría reservar gratis con un
    // paymentIntentId inventado.
    let paymentIntent
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    } catch (stripeError) {
      console.error(`⚠️ No se pudo verificar el PaymentIntent ${paymentIntentId}:`, stripeError.message)
      return res.status(400).json({ error: 'No se pudo verificar el pago. Intenta de nuevo.' })
    }

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        error: 'Payment not completed',
        status: paymentIntent.status,
      })
    }

    if (bookingData.className && bookingData.date && bookingData.time) {
      const cap = await assertSlotAvailable(bookingData.className, bookingData.date, bookingData.time)
      if (!cap.ok) {
        return res.status(400).json({ error: cap.message, code: 'CLASS_FULL' })
      }
    }

    const booking = {
      ...bookingData,
      paymentIntentId: paymentIntentId,
      paymentStatus: paymentIntent.status,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    }

    const savedBooking = await saveBooking(booking)
    sendBookingConfirmationEmail(savedBooking).catch(() => {})

    res.json({
      success: true,
      booking: savedBooking,
    })
  } catch (error) {
    console.error('Error confirming booking:', error)
    res.status(500).json({ error: error.message })
  }
})

// Validar código de descuento (un uso por correo y por código)
app.post('/api/discount-codes/validate', async (req, res) => {
  try {
    const { email, code } = req.body || {}
    const result = await validateDiscountCodeForCustomer(email, code)
    if (!result.valid) {
      return res.status(400).json(result)
    }
    res.json(result)
  } catch (error) {
    console.error('Error validating discount code:', error)
    res.status(500).json({ valid: false, error: error.message })
  }
})

// Endpoint: Validar código de descuento porcentual para PAQUETES.
app.post('/api/package-discounts/validate', async (req, res) => {
  try {
    const { code } = req.body || {}
    const def = findPackageDiscountCode(code)
    if (!def) {
      return res.status(400).json({ valid: false, error: 'Código de descuento inválido o no disponible.' })
    }
    res.json({
      valid: true,
      code: normalizePackageDiscountCode(def.code),
      percent: def.percent,
      label: def.label,
    })
  } catch (error) {
    console.error('Error validating package discount code:', error)
    res.status(500).json({ valid: false, error: error.message })
  }
})

// Endpoint: Captura de correo del popup de clase gratis (cuenta regresiva)
app.post('/api/leads', async (req, res) => {
  try {
    const { email, source, offer } = req.body || {}
    const result = await saveLeadEmail({ email, source, offer })
    if (!result.ok) {
      return res.status(400).json(result)
    }
    // Solo actuar la primera vez (no en correos ya registrados).
    if (!result.alreadyRegistered) {
      // Fire-and-forget: no bloquea la respuesta al usuario.
      if (isMailerLiteConfigured()) {
        // Preferido: alta en MailerLite → su automatización manda la clase gratis
        // y desde ahí puedes enviar promociones. (Marketing.)
        upsertMailerLiteSubscriber({ email, fields: { source: source || 'popup_clase_gratis' } })
          .then(() => console.log('✅ Suscriptor agregado a MailerLite:', email))
          .catch((err) => console.error('❌ Error agregando a MailerLite', email, ':', err.message))
      } else {
        // Respaldo mientras MailerLite no esté configurado: envío directo actual.
        sendFreeClassEmail(email)
      }
    }
    res.json(result)
  } catch (error) {
    console.error('Error saving lead email:', error)
    res.status(500).json({ ok: false, error: error.message })
  }
})

// Endpoint: Guardar reserva directamente (sin confirmar PaymentIntent)
app.post('/api/bookings', async (req, res) => {
  try {
    const bookingData = req.body

    if (bookingData.className && bookingData.date && bookingData.time) {
      const cap = await assertSlotAvailable(bookingData.className, bookingData.date, bookingData.time)
      if (!cap.ok) {
        return res.status(400).json({
          error: cap.message,
          code: 'CLASS_FULL',
        })
      }
    }

    // El pago con tarjeta se confirma solo si Stripe lo dice, no porque el navegador
    // lo afirme — sin esto, una petición forjada podía reservar gratis.
    let cardConfirmed = false
    const claimsCardSuccess =
      bookingData.payment?.status === 'succeeded' &&
      bookingData.paymentMethod !== 'package' &&
      bookingData.paymentMethod !== 'discount_code'
    if (claimsCardSuccess) {
      const paymentIntentId = bookingData.stripeInfo?.paymentIntentId
      if (paymentIntentId) {
        try {
          const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
          cardConfirmed = pi.status === 'succeeded'
        } catch (e) {
          console.error('⚠️ No se pudo verificar el PaymentIntent en /api/bookings:', e.message)
        }
      }
    }

    const booking = {
      ...bookingData,
      createdAt: new Date().toISOString(),
      status:
        cardConfirmed ||
        bookingData.paymentMethod === 'package' ||
        bookingData.paymentMethod === 'discount_code'
          ? 'confirmed'
          : 'pending',
    }

    const savedBooking = await saveBooking(booking)
    if (savedBooking.status === 'confirmed') {
      sendBookingConfirmationEmail(savedBooking).catch(() => {})
    }
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
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await getBookings()
    res.json(bookings)
  } catch (error) {
    console.error('Error getting bookings:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint: Obtener reservas de un usuario por email (debe ir antes de /:id)
app.get('/api/bookings/user/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email)
    const bookings = await getBookings()
    const userBookings = bookings.filter(
      b => b.customer?.email?.toLowerCase() === email.toLowerCase() && b.status === 'confirmed'
    )
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

// --- Maestras: cuentas y token ---
const DEFAULT_TEACHERS = [
  { id: 'teacher-1', email: 'blanca@estudiopopnest.com', password: 'Blanca2026', name: 'Blanca Bear', teacherId: 1 },
  { id: 'teacher-2', email: 'brenda@estudiopopnest.com', password: 'Brenda2026', name: 'Brenda Granados Segovia', teacherId: 2 },
  { id: 'teacher-3', email: 'maderogiv@gmail.com', password: 'Madeline2026', name: 'Madeline Rojas Givaudan', teacherId: 3 }
]
const getTeachers = () => {
  try {
    if (fs.existsSync(TEACHERS_FILE)) {
      let list = JSON.parse(fs.readFileSync(TEACHERS_FILE, 'utf8'))
      // Migración: actualizar correo de Madeline si sigue el antiguo
      const madelineOld = 'madeline@estudiopopnest.com'
      const madelineNew = 'maderogiv@gmail.com'
      const idx = list.findIndex(t => t.id === 'teacher-3' && (t.email || '').toLowerCase() === madelineOld)
      if (idx !== -1) {
        list[idx] = { ...list[idx], email: madelineNew }
        fs.writeFileSync(TEACHERS_FILE, JSON.stringify(list, null, 2))
        console.log('✅ Correo de Madeline actualizado a', madelineNew, 'en teachers.json')
      }
      return list
    }
    fs.writeFileSync(TEACHERS_FILE, JSON.stringify(DEFAULT_TEACHERS, null, 2))
    return [...DEFAULT_TEACHERS]
  } catch (e) {
    console.error('Error reading teachers:', e)
    return [...DEFAULT_TEACHERS]
  }
}
const generateTeacherToken = (teacher) => {
  const payload = {
    teacherId: teacher.teacherId,
    id: teacher.id,
    email: teacher.email,
    name: teacher.name,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000)
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}
const parseTeacherToken = (req) => {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.body?.token
    if (!token) return null
    const payload = JSON.parse(Buffer.from(token, 'base64').toString())
    if (payload.exp && Date.now() > payload.exp) return null
    return payload
  } catch (e) {
    return null
  }
}

// Endpoint: Reservas próximas para el coach (solo las clases que imparte)
app.get('/api/bookings/teacher/upcoming', async (req, res) => {
  try {
    const payload = parseTeacherToken(req)
    if (!payload || !payload.name) {
      return res.status(401).json({ error: 'Debes iniciar sesión como coach' })
    }
    const teacherName = payload.name.trim()
    const bookings = await getBookings()
    const today = format(new Date(), 'yyyy-MM-dd')
    const upcoming = bookings.filter(b => {
      if (b.status !== 'confirmed') return false
      if ((b.teacherName || '').trim() !== teacherName) return false
      return b.date >= today
    })
    upcoming.sort((a, b) => {
      const da = new Date(`${a.date}T${a.time}`)
      const db = new Date(`${b.date}T${b.time}`)
      return da - db
    })
    res.json(upcoming)
  } catch (error) {
    console.error('Error getting teacher upcoming bookings:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint: Obtener reserva por ID
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const bookings = await getBookings()
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
app.patch('/api/bookings/:id/reschedule', async (req, res) => {
  try {
    const { id } = req.params
    const { newDate, newTime, userEmail } = req.body

    if (!newDate || !newTime) {
      return res.status(400).json({ error: 'Debes indicar la nueva fecha y hora (newDate, newTime).' })
    }

    const bookings = await getBookings()
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

    const cap = await assertSlotAvailable(booking.className, newDate, newTime)
    if (!cap.ok) {
      return res.status(400).json({
        error: 'No hay lugares disponibles en esa fecha y hora. Elige otra opción.',
      })
    }

    const newFormattedDate = format(new Date(newDate), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
    const updated = await updateBooking(id, {
      date: newDate,
      time: newTime,
      formattedDate: newFormattedDate,
    })
    if (!updated) {
      return res.status(400).json({
        error: 'No se pudo reagendar. Verifica que el horario exista y tenga cupo.',
      })
    }
    res.json({ success: true, booking: updated })
  } catch (error) {
    console.error('Error rescheduling booking:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint: Verificar disponibilidad de una clase
app.get('/api/bookings/availability/:className/:date/:time', async (req, res) => {
  try {
    const { className, date, time } = req.params
    const slot = await getAvailabilityForSlot(
      decodeURIComponent(className),
      decodeURIComponent(date),
      decodeURIComponent(time)
    )
    res.json({
      available: slot.available,
      currentCount: slot.currentCount,
      maxBookings: slot.maxBookings,
      remainingSpots: slot.remainingSpots,
    })
  } catch (error) {
    console.error('Error checking availability:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint: Obtener usuario por email
app.get('/api/users/email/:email', async (req, res) => {
  try {
    const { email } = req.params
    const profile = await getProfileByEmail(decodeURIComponent(email))
    if (!profile) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    res.json(profileToApiUser(profile))
  } catch (error) {
    console.error('Error getting user by email:', error)
    res.status(500).json({ error: error.message })
  }
})

// Función helper para generar token de administrador
// role: 'super_admin' = visibilidad completa (ingresos, todo) | 'operator' = operativo (reservas, paquetes, sin ingresos)
const generateAdminToken = (admin) => {
  const role = admin.role === 'operator' ? 'operator' : 'super_admin'
  const payload = {
    adminId: admin.id,
    email: admin.email,
    role,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

// Operador wellness: se asegura que exista en cada servidor (Railway, etc.)
const WELLNESS_OPERATOR_EMAIL = 'wellness@estudiopopnest.com'
const WELLNESS_OPERATOR_PASSWORD = 'W3lln3ss#Popn3st2026'

// Lista inicial de administradores (se copia a admins.json la primera vez)
const DEFAULT_ADMINS = [
  {
    id: 'admin-1',
    email: 'info@estudiopopnest.com',
    password: 'Wq8#nK2$pL5mR9xV',
    name: 'Administrador Principal',
    role: 'super_admin'
  },
  {
    id: 'admin-wellness',
    email: WELLNESS_OPERATOR_EMAIL,
    password: WELLNESS_OPERATOR_PASSWORD,
    name: 'Wellness',
    role: 'operator'
  }
]

const getAdmins = () => {
  try {
    let list
    if (fs.existsSync(ADMINS_FILE)) {
      list = JSON.parse(fs.readFileSync(ADMINS_FILE, 'utf8'))
      list = list.map(a => ({ ...a, role: a.role === 'operator' ? 'operator' : 'super_admin' }))
      // Asegurar que el operador wellness exista (migración para Railway/Vercel)
      const hasWellness = list.some(a => a.email && a.email.toLowerCase() === WELLNESS_OPERATOR_EMAIL)
      if (!hasWellness) {
        list.push({
          id: 'admin-wellness',
          email: WELLNESS_OPERATOR_EMAIL,
          password: WELLNESS_OPERATOR_PASSWORD,
          name: 'Wellness',
          role: 'operator'
        })
        fs.writeFileSync(ADMINS_FILE, JSON.stringify(list, null, 2))
      }
    } else {
      list = [...DEFAULT_ADMINS]
      fs.writeFileSync(ADMINS_FILE, JSON.stringify(list, null, 2))
    }
    return list
  } catch (e) {
    console.error('Error reading admins:', e)
    return [...DEFAULT_ADMINS]
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
  tokens.push({ token, email, expiresAt: Date.now() + ADMIN_RESET_TOKEN_EXPIRY_MS })
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

    const normalizedEmail = String(email).trim().toLowerCase()
    const passwordTrimmed = String(password).trim()
    const admins = getAdmins()
    const admin = admins.find(a => a.email && a.email.trim().toLowerCase() === normalizedEmail && a.password === passwordTrimmed)

    if (!admin) {
      return res.status(401).json({ 
        success: false,
        error: 'Credenciales inválidas' 
      })
    }

    const token = generateAdminToken(admin)
    const role = admin.role === 'operator' ? 'operator' : 'super_admin'
    const { password: _, ...adminWithoutPassword } = admin

    res.json({
      success: true,
      admin: { ...adminWithoutPassword, role },
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

// Endpoint: Login de coach (para ver sus próximas clases reservadas)
app.post('/api/auth/teacher/login', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json')
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email y contraseña son requeridos' })
    }
    const normalizedEmail = String(email).trim().toLowerCase()
    const passwordTrimmed = String(password).trim()
    let teachers = getTeachers()
    let teacher = teachers.find(
      t => t.email && t.email.trim().toLowerCase() === normalizedEmail && t.password === passwordTrimmed
    )
    // Respaldo: si Madeline entra con maderogiv@gmail.com pero en el archivo sigue el correo antiguo, actualizar y permitir login
    if (!teacher && normalizedEmail === 'maderogiv@gmail.com') {
      const idx = teachers.findIndex(t => t.id === 'teacher-3' && (t.email || '').toLowerCase() === 'madeline@estudiopopnest.com' && t.password === passwordTrimmed)
      if (idx !== -1) {
        teachers[idx] = { ...teachers[idx], email: 'maderogiv@gmail.com' }
        try {
          fs.writeFileSync(TEACHERS_FILE, JSON.stringify(teachers, null, 2))
          console.log('✅ Correo de Madeline actualizado a maderogiv@gmail.com en login')
        } catch (e) { console.error('Error guardando teachers.json:', e.message) }
        teacher = teachers[idx]
      }
    }
    if (!teacher) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' })
    }
    const token = generateTeacherToken(teacher)
    const { password: _, ...teacherWithoutPassword } = teacher
    res.json({
      success: true,
      teacher: teacherWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Error in teacher login:', error)
    res.status(500).json({ success: false, error: error.message || 'Error interno del servidor' })
  }
})

// Endpoint protegido: servir imágenes de marketing desde server/marketing-assets
// Uso recomendado: /api/marketing/image/banner-news.png?key=EL_MISMO_VALOR_DE_MARKETING_ASSETS_KEY
app.get('/api/marketing/image/:name', (req, res) => {
  try {
    const secret = (process.env.MARKETING_ASSETS_KEY || '').trim()
    if (!secret) {
      return res.status(503).json({ error: 'Assets de marketing no configurados. Falta MARKETING_ASSETS_KEY.' })
    }
    const provided = String(req.query.key || '').trim()
    if (provided !== secret) {
      return res.status(403).json({ error: 'Acceso no autorizado.' })
    }

    // Evitar directory traversal: permitir solo nombres simples o subcarpetas seguras
    const rawName = String(req.params.name || '')
    if (!rawName || rawName.includes('..')) {
      return res.status(400).json({ error: 'Nombre de archivo inválido.' })
    }

    const filePath = join(MARKETING_ASSETS_DIR, rawName)
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado.' })
    }

    res.sendFile(filePath)
  } catch (error) {
    console.error('Error serving marketing asset:', error)
    res.status(500).json({ error: error.message || 'Error interno del servidor' })
  }
})

// Verificar token de admin y devolver payload (o null si inválido/expirado)
const parseAdminToken = (req) => {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.body?.token
    if (!token) return null
    const payload = JSON.parse(Buffer.from(token, 'base64').toString())
    if (payload.exp && Date.now() > payload.exp) return null
    return payload
  } catch (e) {
    return null
  }
}

// Endpoint: Añadir operador (solo super_admin). Útil cuando el servidor está desplegado y no puedes editar admins.json
app.post('/api/auth/admin/add-operator', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json')
    const payload = parseAdminToken(req)
    if (!payload || payload.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Solo un administrador con visibilidad completa puede añadir operadores.' })
    }
    const { email, password, name } = req.body
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, error: 'El correo es requerido.' })
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres.' })
    }
    const normalizedEmail = email.trim().toLowerCase()
    const admins = getAdmins()
    if (admins.some(a => a.email && a.email.trim().toLowerCase() === normalizedEmail)) {
      return res.status(400).json({ success: false, error: 'Ya existe un administrador u operador con ese correo.' })
    }
    const passwordToSave = String(password).trim()
    if (passwordToSave.length < 6) {
      return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres (sin espacios extra).' })
    }
    const newId = 'admin-' + Date.now()
    admins.push({
      id: newId,
      email: normalizedEmail,
      password: passwordToSave,
      name: (name && String(name).trim()) || 'Operador',
      role: 'operator'
    })
    fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2))
    res.json({ success: true, message: 'Operador añadido. Ya puede iniciar sesión en /admin/login con ' + normalizedEmail + ' y la contraseña que ingresaste.' })
  } catch (error) {
    console.error('Error in add-operator:', error)
    res.status(500).json({ success: false, error: error.message || 'Error interno del servidor' })
  }
})

// Endpoint: Listar paquetes de un cliente por email (solo super_admin)
app.get('/api/admin/customer-packages', async (req, res) => {
  try {
    const payload = parseAdminToken(req)
    if (!payload) {
      return res.status(401).json({ success: false, error: 'Debes iniciar sesión como administrador.' })
    }
    if (payload.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Solo un administrador principal puede otorgar paquetes o clases.' })
    }
    const email = String(req.query.email || '').trim().toLowerCase()
    if (!email) {
      return res.status(400).json({ success: false, error: 'Query email es requerido.' })
    }
    const list = await listCustomerPackagesByEmail(email)
    res.json({ success: true, email, packages: list })
  } catch (error) {
    console.error('Error listing customer packages:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Endpoint: Otorgar créditos de clase (admin, sin fecha ni Stripe) — el cliente reserva después
app.post('/api/admin/customer-packages/grant-credits', async (req, res) => {
  try {
    const payload = parseAdminToken(req)
    if (!payload) {
      return res.status(401).json({ success: false, error: 'Debes iniciar sesión como administrador.' })
    }
    if (payload.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Solo un administrador principal puede otorgar clases.' })
    }
    const { email, classes, validityDays, note } = req.body || {}
    if (!email?.trim()) {
      return res.status(400).json({ success: false, error: 'El correo del cliente es requerido.' })
    }
    const purchase = await grantAdminClassCredits({
      email,
      classes,
      validityDays,
      note,
    })
    console.log(
      '✅ Créditos admin otorgados:',
      purchase.id,
      purchase.customer?.email,
      purchase.classesRemaining,
      'disponibles',
    )
    res.json({ success: true, purchase })
  } catch (error) {
    console.error('Error granting admin class credits:', error)
    res.status(400).json({ success: false, error: error.message })
  }
})

// Endpoint: Otorgar un paquete NUEVO al cliente (solo super_admin; no altera reservas ni paquetes anteriores)
app.post('/api/admin/customer-packages/grant', async (req, res) => {
  try {
    const payload = parseAdminToken(req)
    if (!payload) {
      return res.status(401).json({ success: false, error: 'Debes iniciar sesión como administrador.' })
    }
    if (payload.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Solo un administrador principal puede otorgar paquetes o clases.' })
    }
    const {
      email,
      profileId,
      packageName,
      classesRemaining,
      classesTotal,
      validityDays,
      expiresAt,
      amountPaid,
      stripePaymentIntentId,
    } = req.body || {}

    const purchase = await grantCustomerPackageManual({
      email,
      profileId,
      packageName,
      classesRemaining,
      classesTotal,
      validityDays,
      expiresAt,
      amountPaid,
      stripePaymentIntentId: stripePaymentIntentId || null,
    })

    console.log('✅ Paquete otorgado por admin:', purchase.id, purchase.packageName, purchase.customer?.email)
    res.json({ success: true, purchase })
  } catch (error) {
    console.error('Error granting package:', error)
    res.status(400).json({ success: false, error: error.message })
  }
})

// Endpoint: Añadir clases al saldo de un paquete existente (solo super_admin)
app.post('/api/admin/customer-packages/add-classes', async (req, res) => {
  try {
    const payload = parseAdminToken(req)
    if (!payload) {
      return res.status(401).json({ success: false, error: 'Debes iniciar sesión como administrador.' })
    }
    if (payload.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Solo un administrador principal puede otorgar paquetes o clases.' })
    }
    const { customerPackageId, addClasses, extendValidityDays } = req.body || {}
    if (!customerPackageId) {
      return res.status(400).json({ success: false, error: 'customerPackageId es requerido.' })
    }
    const purchase = await addClassesToCustomerPackage(customerPackageId, {
      addClasses,
      extendValidityDays,
    })
    console.log('✅ Clases añadidas al paquete', customerPackageId, '→', purchase.classesRemaining, 'disponibles')
    res.json({ success: true, purchase })
  } catch (error) {
    console.error('Error adding classes to package:', error)
    res.status(400).json({ success: false, error: error.message })
  }
})

// Endpoint: Crear reserva manual (admin/operador). Para ver reservas en producción sin depender de bookings.json en repo.
app.post('/api/admin/bookings', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json')
    const payload = parseAdminToken(req)
    if (!payload) {
      return res.status(401).json({ success: false, error: 'Debes iniciar sesión como administrador.' })
    }
    const { date, time, className, teacherName, customer } = req.body
    const fullName = (customer && customer.fullName) || (customer && [customer.firstName, customer.lastName].filter(Boolean).join(' ')) || ''
    const email = (customer && customer.email) || ''
    const phone = (customer && customer.phone) || ''
    if (!date || !time || !className || !fullName.trim()) {
      return res.status(400).json({ success: false, error: 'Faltan datos: fecha, hora, clase y nombre del cliente son obligatorios.' })
    }
    const booking = {
      id: 'booking-' + Date.now(),
      date: String(date).trim(),
      time: String(time).trim(),
      className: String(className).trim(),
      teacherName: (teacherName && String(teacherName).trim()) || '',
      type: 'class',
      status: 'confirmed',
      customer: {
        fullName: fullName.trim(),
        firstName: (fullName.trim().split(/\s+/)[0] || '').trim(),
        lastName: (fullName.trim().split(/\s+/).slice(1).join(' ') || '').trim(),
        email: String(email).trim(),
        phone: String(phone).trim()
      },
      paymentMethod: 'manual',
      payment: { status: 'succeeded', amount: 0, currency: 'mxn', method: 'manual' },
      createdAt: new Date().toISOString(),
      formattedDate: new Date(date + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    }
    const saved = await saveBooking(booking)
    console.log('✅ Reserva manual creada por admin:', saved.id, saved.className, saved.customer?.fullName)
    res.json({ success: true, booking: saved })
  } catch (error) {
    console.error('Error creating admin booking:', error)
    res.status(500).json({ success: false, error: error.message || 'Error interno del servidor' })
  }
})

// Endpoint: Listar cuentas de admin/operador (solo super_admin, para verificar que se guardaron)
app.get('/api/auth/admin/list', (req, res) => {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.query?.token
    if (!token) {
      return res.status(401).json({ success: false, error: 'Token requerido' })
    }
    const payload = parseAdminToken({ headers: { authorization: 'Bearer ' + token }, body: {} })
    if (!payload || payload.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Solo super admin puede listar cuentas' })
    }
    const admins = getAdmins()
    const list = admins.map(a => ({ email: a.email, name: a.name, role: a.role === 'operator' ? 'operator' : 'super_admin' }))
    res.json({ success: true, admins: list })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
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

// Endpoint: Restablecer contraseña de administrador SIN correo (solo si ADMIN_RESET_SECRET está configurado)
// Uso: POST /api/auth/admin/force-reset-password { "email": "info@estudiopopnest.com", "newPassword": "tuNuevaContraseña", "secret": "el valor de ADMIN_RESET_SECRET" }
app.post('/api/auth/admin/force-reset-password', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json')
    const expectedSecret = (process.env.ADMIN_RESET_SECRET || '').trim()
    if (!expectedSecret) {
      return res.status(503).json({ success: false, error: 'Recuperación sin correo no está configurada. Añade ADMIN_RESET_SECRET en server/.env' })
    }
    const { email, newPassword, secret } = req.body
    if (!email || !newPassword || secret !== expectedSecret) {
      return res.status(400).json({ success: false, error: 'Email, nueva contraseña y secret correctos son requeridos' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres' })
    }
    const updated = updateAdminPassword(email.trim(), newPassword)
    if (!updated) {
      return res.status(404).json({ success: false, error: 'No existe un administrador con ese correo' })
    }
    console.log('✅ Contraseña de administrador actualizada (force-reset) para:', email.trim())
    res.json({ success: true, message: 'Contraseña actualizada. Ya puedes iniciar sesión en el panel de administración.' })
  } catch (error) {
    console.error('Error in admin force-reset-password:', error)
    res.status(500).json({ success: false, error: error.message || 'Error interno del servidor' })
  }
})

// Endpoint: Registro de usuario (Supabase Auth + profiles)
app.post('/api/auth/signup', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json')

    const { firstName, lastName, email, phone, password } = req.body

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos',
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres',
      })
    }

    const anon = getSupabaseAnon()
    const { data, error } = await anon.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, phone: phone.trim() },
      },
    })

    if (error) {
      return res.status(400).json({ success: false, error: error.message })
    }

    if (data.user) {
      try {
        await upsertProfileForAuthUser(data.user, {
          first_name: firstName,
          last_name: lastName,
          phone: phone.trim(),
        })
      } catch (e) {
        console.error('Profile upsert after signup:', e.message)
      }
    }

    const profile = data.user ? await getProfileForAuthUser(data.user) : null
    const userOut =
      profileToApiUser(profile) ||
      ({
        id: data.user?.id,
        email: data.user?.email || email.trim(),
        firstName,
        lastName,
        phone: phone.trim(),
      })

    sendWelcomeEmail(userOut).catch(() => {})

    const token = data.session?.access_token || null
    if (!token) {
      return res.json({
        success: true,
        user: userOut,
        token: null,
        message:
          'Si tu proyecto requiere confirmar el correo, revisa tu bandeja; después podrás iniciar sesión.',
      })
    }

    res.json({ success: true, user: userOut, token })
  } catch (error) {
    console.error('Error in signup:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    })
  }
})

// Endpoint: Establecer contraseña (legacy; las cuentas usan Supabase Auth)
app.post('/api/auth/set-password', async (req, res) => {
  res.status(400).json({
    error:
      'Usa «Olvidé mi contraseña» para recibir un enlace de Supabase o regístrate de nuevo con el flujo actual.',
  })
})

// Endpoint: Olvidé mi contraseña (Supabase envía el correo)
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json')
    const { email } = req.body
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, error: 'El correo es requerido' })
    }
    const anon = getSupabaseAnon()
    const { error } = await anon.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${FRONTEND_URL}/reset-password`,
    })
    if (error) {
      console.warn('Supabase resetPasswordForEmail:', error.message)
    }
    res.json({
      success: true,
      message: 'Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.',
    })
  } catch (error) {
    console.error('Error in forgot-password:', error)
    res.status(500).json({ success: false, error: error.message || 'Error interno del servidor' })
  }
})

// Endpoint: Restablecer contraseña (token legacy; el SPA debe usar el hash de sesión de Supabase)
app.post('/api/auth/reset-password', async (req, res) => {
  res.status(400).json({
    success: false,
    error: 'Enlace inválido o expirado. Solicita uno nuevo desde «Olvidé mi contraseña».',
  })
})

// Endpoint: Inicio de sesión (Supabase Auth)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' })
    }
    if (!password) {
      return res.status(400).json({ error: 'Contraseña es requerida' })
    }

    const anon = getSupabaseAnon()
    const { data, error } = await anon.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error || !data.session || !data.user) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    try {
      await upsertProfileForAuthUser(data.user, {
        first_name: data.user.user_metadata?.first_name,
        last_name: data.user.user_metadata?.last_name,
        phone: data.user.user_metadata?.phone,
      })
    } catch (e) {
      console.error('Profile upsert on login:', e.message)
    }

    const profile = await getProfileForAuthUser(data.user)
    const userOut =
      profileToApiUser(profile) ||
      ({
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.user_metadata?.first_name || '',
        lastName: data.user.user_metadata?.last_name || '',
        phone: data.user.user_metadata?.phone || '',
      })

    const emailForPackages = (userOut.email || data.user.email || '').trim().toLowerCase()
    let totalClassesRemaining = 0
    try {
      const activePackages = profile?.id
        ? await getUserActivePackagesByProfileId(profile.id)
        : emailForPackages
          ? await getUserActivePackagesByEmail(emailForPackages)
          : []
      totalClassesRemaining = activePackages.reduce(
        (sum, pkg) => sum + (pkg.classesRemaining || 0),
        0,
      )
    } catch (e) {
      console.error('Login active packages:', e.message)
    }

    res.json({
      success: true,
      user: userOut,
      token: data.session.access_token,
      totalClassesRemaining,
    })
  } catch (error) {
    console.error('Error in login:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint: Comprar paquete
app.post('/api/packages/purchase', async (req, res) => {
  try {
    const purchaseData = req.body

    if (!purchaseData.customer?.email) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere información del cliente',
      })
    }

    const authHeader = req.headers.authorization
    const authUser = await verifyAuthJwt(authHeader?.replace(/^Bearer\s+/i, ''))
    if (!authUser) {
      return res.status(401).json({
        success: false,
        error: 'Debes estar registrado e iniciar sesión para comprar un paquete',
      })
    }

    const customerEmail = purchaseData.customer.email.trim().toLowerCase()
    if (authUser.email && authUser.email.trim().toLowerCase() !== customerEmail) {
      return res.status(403).json({
        success: false,
        error: 'El correo del cliente debe coincidir con tu sesión.',
      })
    }

    const profileId = await resolveProfileIdForPackagePurchase(purchaseData, authUser)
    if (!profileId) {
      return res.status(401).json({
        success: false,
        error: 'No se pudo vincular tu cuenta. Vuelve a iniciar sesión.',
      })
    }

    const savedPurchase = await insertCustomerPackageAfterPayment({
      profileId,
      packageName: purchaseData.packageName,
      amountPaid: purchaseData.payment?.amount ?? 0,
      stripePaymentIntentId: purchaseData.stripeInfo?.paymentIntentId ?? null,
      paymentStatus: purchaseData.payment?.status === 'succeeded' ? 'succeeded' : 'pending',
      referredBy: purchaseData.referredBy ?? null,
    })

    console.log('✅ Compra de paquete guardada:', {
      id: savedPurchase.id,
      packageName: savedPurchase.packageName,
      customer: savedPurchase.customer?.fullName,
      userId: savedPurchase.userId,
      paymentStatus: savedPurchase.payment?.status,
      classesRemaining: savedPurchase.classesRemaining,
    })

    if (savedPurchase.payment?.status === 'succeeded' && !savedPurchase.adminGranted && savedPurchase._isNewPayment) {
      sendPackageConfirmationEmail(savedPurchase).catch(() => {})
    }

    res.json({
      success: true,
      purchase: savedPurchase,
    })
  } catch (error) {
    console.error('Error saving package purchase:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint: Obtener todas las compras de paquetes
app.get('/api/packages', async (req, res) => {
  try {
    const purchases = await listAllPackagePurchases()
    res.json(purchases)
  } catch (error) {
    console.error('Error getting packages:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint: Obtener paquetes activos de un usuario
app.get('/api/packages/user/:email', async (req, res) => {
  try {
    const { email } = req.params
    const activePackages = await getUserActivePackagesByEmail(decodeURIComponent(email))
    const totalClassesRemaining = activePackages.reduce((sum, pkg) => sum + (pkg.classesRemaining || 0), 0)

    res.json({
      packages: activePackages,
      totalClassesRemaining,
      hasActivePackages: activePackages.length > 0,
    })
  } catch (error) {
    console.error('Error getting user packages:', error)
    res.status(500).json({ error: error.message })
  }
})

// Endpoint: Paquetes activos + historial de compras del usuario
app.get('/api/packages/user/:email/all', async (req, res) => {
  try {
    const { email } = req.params
    const data = await getUserAllPackagesByEmail(decodeURIComponent(email))
    res.json(data)
  } catch (error) {
    console.error('Error getting user packages (all):', error)
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

// =====================================================================
//  TALLERES (workshops) — contenido editable desde /admin + reserva/pago
// =====================================================================

/** Public: lista de talleres publicados. */
app.get('/api/talleres', async (req, res) => {
  try {
    const talleres = await listActiveTalleres()
    res.json({ talleres })
  } catch (error) {
    console.error('Error listando talleres:', error)
    res.status(500).json({ error: error.message || 'Error al listar talleres' })
  }
})

/** Public: un taller por id. */
app.get('/api/talleres/:id', async (req, res) => {
  try {
    const taller = await getTallerById(req.params.id)
    if (!taller || !taller.is_active) return res.status(404).json({ error: 'Taller no encontrado' })
    res.json({ taller })
  } catch (error) {
    console.error('Error obteniendo taller:', error)
    res.status(500).json({ error: error.message || 'Error al obtener el taller' })
  }
})

/** Public: registra la reserva tras un pago exitoso con Stripe. */
app.post('/api/talleres/:id/book', async (req, res) => {
  try {
    const tallerId = req.params.id
    const { customer = {}, paymentIntentId } = req.body || {}

    const taller = await getTallerById(tallerId)
    if (!taller || !taller.is_active) return res.status(404).json({ error: 'Taller no disponible.' })
    if ((taller.spots_available ?? 0) <= 0) return res.status(409).json({ error: 'Taller agotado.' })

    // Verificar el pago con Stripe (monto y estado) antes de guardar.
    let amountPaid = null
    if (paymentIntentId) {
      try {
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
        if (pi.status !== 'succeeded') {
          return res.status(402).json({ error: 'El pago no se completó. Intenta de nuevo.' })
        }
        const expected = Math.round(Number(taller.price) * 100)
        if (expected > 0 && pi.amount !== expected) {
          return res.status(400).json({ error: 'El monto pagado no coincide con el precio del taller.' })
        }
        amountPaid = pi.amount / 100
      } catch (e) {
        return res.status(400).json({ error: 'No se pudo verificar el pago.' })
      }
    } else if (Number(taller.price) > 0) {
      return res.status(400).json({ error: 'Falta la referencia del pago.' })
    }

    // Descontar un lugar de forma segura.
    const updated = await decrementTallerSpot(tallerId)
    if (!updated) return res.status(409).json({ error: 'Taller agotado.' })

    const booking = await createTallerBooking({
      tallerId,
      tallerTitle: taller.title,
      customerName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.name || null,
      customerEmail: customer.email || null,
      customerPhone: customer.phone || null,
      amountPaid,
      currency: 'mxn',
      paymentStatus: paymentIntentId ? 'succeeded' : 'free',
      stripePaymentIntentId: paymentIntentId || null,
    })

    // Correo de confirmación (no bloqueante).
    if (customer.email) {
      const fecha = taller.fecha ? ` el ${taller.fecha}` : ''
      const hora = taller.hora ? ` a las ${taller.hora}` : ''
      sendEmail({
        to: customer.email,
        toName: booking.customer_name || '',
        subject: `Reserva confirmada — ${taller.title}`,
        text: `¡Gracias por tu reserva!\n\nTaller: ${taller.title}${fecha}${hora}\nLugar: ${taller.lugar || 'Estudio Popnest Wellness, Coyoacán'}\n\nTe esperamos.`,
      }).catch((e) => console.warn('No se pudo enviar correo de taller:', e.message))
    }

    res.json({ success: true, booking, spotsAvailable: updated.spots_available })
  } catch (error) {
    console.error('Error reservando taller:', error)
    res.status(500).json({ error: error.message || 'Error al reservar el taller' })
  }
})

// ---- Admin (protegido con parseAdminToken) ----

app.get('/api/admin/talleres', async (req, res) => {
  if (!parseAdminToken(req)) return res.status(401).json({ error: 'No autorizado.' })
  try {
    const talleres = await listAllTalleres()
    res.json({ talleres })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error al listar talleres' })
  }
})

app.post('/api/admin/talleres', async (req, res) => {
  if (!parseAdminToken(req)) return res.status(401).json({ error: 'No autorizado.' })
  try {
    const taller = await createTaller(req.body || {})
    res.json({ success: true, taller })
  } catch (error) {
    res.status(400).json({ error: error.message || 'Error al crear el taller' })
  }
})

app.put('/api/admin/talleres/:id', async (req, res) => {
  if (!parseAdminToken(req)) return res.status(401).json({ error: 'No autorizado.' })
  try {
    const taller = await updateTaller(req.params.id, req.body || {})
    res.json({ success: true, taller })
  } catch (error) {
    res.status(400).json({ error: error.message || 'Error al actualizar el taller' })
  }
})

app.delete('/api/admin/talleres/:id', async (req, res) => {
  if (!parseAdminToken(req)) return res.status(401).json({ error: 'No autorizado.' })
  try {
    const result = await deleteTaller(req.params.id)
    res.json({ success: true, ...result })
  } catch (error) {
    res.status(400).json({ error: error.message || 'Error al borrar el taller' })
  }
})

app.post('/api/admin/talleres/image', async (req, res) => {
  if (!parseAdminToken(req)) return res.status(401).json({ error: 'No autorizado.' })
  try {
    const { dataUrl, filename } = req.body || {}
    const url = await uploadTallerImage(dataUrl, filename)
    res.json({ success: true, url })
  } catch (error) {
    res.status(400).json({ error: error.message || 'Error al subir la imagen' })
  }
})

app.get('/api/admin/taller-bookings', async (req, res) => {
  if (!parseAdminToken(req)) return res.status(401).json({ error: 'No autorizado.' })
  try {
    const bookings = await listTallerBookings(req.query.tallerId || null)
    res.json({ bookings })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error al listar reservas' })
  }
})

/** Genera un Payment Link de Stripe para un taller (producto + precio + link). */
app.post('/api/admin/talleres/payment-link', async (req, res) => {
  if (!parseAdminToken(req)) return res.status(401).json({ error: 'No autorizado.' })
  try {
    const { title, price } = req.body || {}
    const name = String(title || '').trim() || 'Taller — Estudio Popnest Wellness'
    const amount = Math.round(Number(price) * 100)
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'El taller debe tener un precio mayor a 0 para generar un link de pago.' })
    }
    const product = await stripe.products.create({ name })
    const priceObj = await stripe.prices.create({
      product: product.id,
      unit_amount: amount,
      currency: 'mxn',
    })
    const link = await stripe.paymentLinks.create({
      line_items: [{ price: priceObj.id, quantity: 1 }],
      allow_promotion_codes: true,
    })
    res.json({ success: true, url: link.url })
  } catch (error) {
    console.error('Error generando payment link de taller:', error)
    res.status(400).json({ error: error.message || 'No se pudo generar el link de pago.' })
  }
})

/** Editor con IA: convierte lenguaje natural en los campos de un taller. */
app.post('/api/admin/talleres/ai', async (req, res) => {
  if (!parseAdminToken(req)) return res.status(401).json({ error: 'No autorizado.' })
  if (!isTalleresAiConfigured()) {
    return res.status(503).json({
      error: 'El editor con IA no está configurado. Agrega ANTHROPIC_API_KEY en el servidor (server/.env y Railway).',
    })
  }
  try {
    const { instruction, current } = req.body || {}
    const today = new Date().toISOString().slice(0, 10)
    const taller = await generateTallerFromPrompt({ instruction, current: current || null, today })
    res.json({ success: true, taller })
  } catch (error) {
    console.error('Error en editor IA de talleres:', error)
    res.status(400).json({ error: error.message || 'Error al generar con IA' })
  }
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
  const hasSupabaseUrl = !!(process.env.SUPABASE_URL || '').trim()
  const hasSupabaseKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  if (!hasSupabaseUrl || !hasSupabaseKey) {
    console.log(`⚠️  Supabase: URL=${hasSupabaseUrl ? 'ok' : 'missing'}, KEY=${hasSupabaseKey ? 'ok' : 'missing'} (check server/.env)`)
  }
  console.log(`📝 Bookings: ${isUsingSupabase() ? 'Supabase (bookings_new)' : 'missing Supabase env'}`)
  console.log(`👥 Profiles: ${isUsingSupabaseForUsers() ? 'Supabase' : 'missing Supabase env'}`)
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️  STRIPE_SECRET_KEY not set. Stripe features will not work.')
  }
})
