// Carga el taller "Verano & Yoga" y genera su link de pago de Stripe.
// Uso: (desde server/)  node scripts/load_taller_verano_yoga.mjs
// Requiere: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY en server/.env
// y que la tabla public.talleres ya exista (server/sql/add_talleres.sql).
import 'dotenv/config'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '../db/supabaseClient.js'

const TALLER = {
  title: 'Verano & Yoga · Clase Especial',
  tema: 'Pranayama — respiración y emociones',
  descripcion:
    'Un viaje a través de la respiración y las emociones. A través del pranayama aprenderemos a sostener y controlar la respiración, habitando las posturas donde el calor y la fortaleza se unen. Descubrirás cómo calmar y soltar las emociones que guardamos en todo el cuerpo, escuchando lo que tu cuerpo te comunica para armonizar tu estado emocional.',
  comida: null,
  price: 400,
  image_url: null,
  fecha: '2026-08-08',
  hora: '18:00',
  lugar: 'Estudio Popnest Wellness, Londres 105, Del Carmen, Coyoacán',
  spots_total: 20,
  spots_available: 20,
  is_active: true,
}

function isMissingTable(error) {
  if (!error) return false
  const msg = error.message || ''
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    /could not find the table/i.test(msg) ||
    /schema cache/i.test(msg) ||
    /relation .* does not exist/i.test(msg)
  )
}

async function main() {
  const supabase = getSupabaseAdmin()

  // 1) Verificar que la tabla exista ANTES de crear nada en Stripe.
  const probe = await supabase.from('talleres').select('id').limit(1)
  if (probe.error) {
    if (isMissingTable(probe.error)) {
      console.error('MISSING_TABLE')
      process.exit(2)
    }
    throw probe.error
  }

  // 2) ¿Ya existe este taller? (evita duplicados si se corre dos veces)
  const existing = await supabase
    .from('talleres')
    .select('id, payment_link')
    .eq('title', TALLER.title)
    .maybeSingle()
  if (existing.data) {
    console.log('YA_EXISTE id=' + existing.data.id + ' payment_link=' + (existing.data.payment_link || '(sin link)'))
    process.exit(0)
  }

  // 3) Generar link de pago de Stripe (producto + precio + payment link).
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-11-20.acacia' })
  const product = await stripe.products.create({ name: `${TALLER.title} — Estudio Popnest Wellness` })
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(TALLER.price * 100),
    currency: 'mxn',
  })
  const link = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    allow_promotion_codes: true,
  })

  // 4) Insertar el taller con su link.
  const insert = await supabase
    .from('talleres')
    .insert({ ...TALLER, payment_link: link.url })
    .select('id')
    .single()
  if (insert.error) throw insert.error

  console.log('OK id=' + insert.data.id)
  console.log('PAYMENT_LINK=' + link.url)
}

main().catch((e) => {
  console.error('ERROR:', e.message || e)
  process.exit(1)
})
