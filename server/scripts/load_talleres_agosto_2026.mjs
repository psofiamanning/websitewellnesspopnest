// Carga los talleres de agosto 2026 (los 7 del calendario de Instagram).
// Uso: (desde server/)  node scripts/load_talleres_agosto_2026.mjs
// Requiere: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY en server/.env
// y que la tabla public.talleres ya exista (server/sql/add_talleres.sql corrido en Supabase).
//
// No genera link de pago de Stripe (payment_link queda vacío): el cobro con tarjeta
// ya funciona directo en /talleres/:id usando el precio, sin necesitarlo.
import 'dotenv/config'
import { getSupabaseAdmin } from '../db/supabaseClient.js'

const LUGAR = 'Estudio Popnest Wellness, Londres 105, Del Carmen, Coyoacán'

const TALLERES = [
  {
    title: 'Verano & Yoga · Clase Especial',
    tema: 'Pranayama — respiración y emociones',
    descripcion:
      'Un viaje a través de la respiración y las emociones. A través del pranayama aprenderemos a sostener y controlar la respiración, habitando las posturas donde el calor y la fortaleza se unen. Descubrirás cómo calmar y soltar las emociones que guardamos en todo el cuerpo, escuchando lo que tu cuerpo te comunica para armonizar tu estado emocional. Con Blanca Bear.',
    comida: null,
    price: 400,
    image_url: null,
    fecha: '2026-08-08',
    hora: '18:00–20:00',
    lugar: LUGAR,
    spots_total: 20,
    spots_available: 20,
    is_active: true,
  },
  {
    title: 'Dios te llama por tu nombre',
    tema: 'Seminario — libertad emocional',
    descripcion:
      'Un espacio para reflexionar quién gobierna tu vida y dar el primer paso hacia la libertad emocional. Con Marcelo Arrabal (Metanoia).',
    comida: null,
    price: 200,
    image_url: null,
    fecha: '2026-08-15',
    hora: '15:00–17:00',
    lugar: LUGAR,
    spots_total: 20,
    spots_available: 20,
    is_active: true,
  },
  {
    title: 'Reverdeciendo mi Montaña',
    tema: 'Bienestar consciente',
    descripcion:
      'Un espacio para alinear mente, corazón y acción, y elegir de forma consciente tu propio bienestar. Con Claudia Ruiz Moguel.',
    comida: null,
    price: 0,
    image_url: null,
    fecha: '2026-08-22',
    hora: '10:00–12:00',
    lugar: LUGAR,
    spots_total: 20,
    spots_available: 20,
    is_active: true,
  },
  {
    title: 'Posturas de Inversión',
    tema: 'Yoga — técnica e inversiones',
    descripcion:
      'Construye paso a paso las posturas de inversión: técnica, confianza y control para invertir el cuerpo con seguridad. Con Miguel Iglesias.',
    comida: null,
    price: 0,
    image_url: null,
    fecha: '2026-08-23',
    hora: '11:00–12:30',
    lugar: LUGAR,
    spots_total: 20,
    spots_available: 20,
    is_active: true,
  },
  {
    title: 'El Cuerpo como Mapa del Alma',
    tema: 'Movimiento consciente',
    descripcion:
      'Un taller de movimiento consciente para escuchar el cuerpo energético y despertar la fuerza que habita en ti. Con Bere Cooper.',
    comida: null,
    price: 0,
    image_url: null,
    fecha: '2026-08-28',
    hora: '11:30–13:00',
    lugar: LUGAR,
    spots_total: 20,
    spots_available: 20,
    is_active: true,
  },
  {
    title: 'Umbral',
    tema: 'Luna llena y eclipse en Piscis',
    descripcion:
      'Una noche para acompañar la energía de la luna llena y el eclipse lunar en Piscis. Con Brenda y Made.',
    comida: null,
    price: 0,
    image_url: null,
    fecha: '2026-08-28',
    hora: '19:30–21:30',
    lugar: LUGAR,
    spots_total: 20,
    spots_available: 20,
    is_active: true,
  },
  {
    title: 'Club de Lectura',
    tema: 'Encuentro literario',
    descripcion:
      'Un encuentro para compartir opiniones, interpretar la historia y disfrutar juntos la experiencia de leer. Con Luis Archila.',
    comida: null,
    price: 0,
    image_url: null,
    fecha: '2026-08-30',
    hora: '12:00–13:00',
    lugar: LUGAR,
    spots_total: 20,
    spots_available: 20,
    is_active: true,
  },
]

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

  const probe = await supabase.from('talleres').select('id').limit(1)
  if (probe.error) {
    if (isMissingTable(probe.error)) {
      console.error('MISSING_TABLE: corre server/sql/add_talleres.sql en Supabase antes de este script.')
      process.exit(2)
    }
    throw probe.error
  }

  for (const taller of TALLERES) {
    const existing = await supabase
      .from('talleres')
      .select('id')
      .eq('title', taller.title)
      .maybeSingle()
    if (existing.data) {
      console.log(`YA_EXISTE "${taller.title}" id=${existing.data.id}`)
      continue
    }
    const insert = await supabase.from('talleres').insert(taller).select('id').single()
    if (insert.error) {
      console.error(`ERROR "${taller.title}":`, insert.error.message)
      continue
    }
    console.log(`OK "${taller.title}" id=${insert.data.id}`)
  }
}

main().catch((e) => {
  console.error('ERROR:', e.message || e)
  process.exit(1)
})
