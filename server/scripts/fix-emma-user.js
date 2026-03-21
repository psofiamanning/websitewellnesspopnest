/**
 * One-off: Corregir teléfono de un perfil en Supabase.
 * Ejecutar desde server/: node scripts/fix-emma-user.js
 */
import dotenv from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { updateUser, getProfileByEmail } from '../db/users.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env') })

const EMAIL = 'mitorecagz@hotmail.com'
const CORRECT_PHONE = '5554048423'

async function main() {
  const profile = await getProfileByEmail(EMAIL)
  if (!profile) {
    console.error('Perfil no encontrado:', EMAIL)
    process.exit(1)
  }

  await updateUser(profile.id, { phone: CORRECT_PHONE })
  console.log('✅ Teléfono actualizado a', CORRECT_PHONE, 'para', EMAIL)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
