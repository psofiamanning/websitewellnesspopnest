/**
 * Crea una cuenta de OPERADOR del panel /admin directamente en Supabase (tabla admin_accounts).
 * La contraseña se pide en la terminal (no se muestra ni queda en el historial) y se guarda con scrypt.
 * Ejecutar desde server/: node scripts/add-operator.js correo@estudiopopnest.com "Nombre"
 */
import dotenv from 'dotenv'
import readline from 'node:readline'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { insertAdminAccount, listAdminAccounts } from '../db/adminAccounts.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env') })

const email = (process.argv[2] || '').trim().toLowerCase()
const name = (process.argv[3] || 'Operador').trim()

if (!email || !email.includes('@')) {
  console.error('Uso: node scripts/add-operator.js correo@estudiopopnest.com "Nombre"')
  process.exit(1)
}

/** Lee una línea sin mostrar lo que se escribe. */
function askHidden(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl._writeToOutput = s => { if (s.includes(question)) rl.output.write(s) }
    rl.question(question, answer => {
      rl.close()
      process.stdout.write('\n')
      resolve(answer.trim())
    })
  })
}

async function main() {
  const existing = await listAdminAccounts()
  if (existing.some(a => a.email === email)) {
    console.error(`Ya existe una cuenta con ${email}. No se cambió nada.`)
    process.exit(1)
  }

  const password = await askHidden('Contraseña para el operador (mín. 6 caracteres): ')
  const confirm = await askHidden('Repite la contraseña: ')
  if (password.length < 6) {
    console.error('La contraseña debe tener al menos 6 caracteres.')
    process.exit(1)
  }
  if (password !== confirm) {
    console.error('Las contraseñas no coinciden. No se cambió nada.')
    process.exit(1)
  }

  const admin = await insertAdminAccount({
    id: 'admin-' + Date.now(),
    email,
    password,
    name,
    role: 'operator'
  })
  console.log(`✅ Operador creado en Supabase: ${admin.email} (${admin.name}) — rol: ${admin.role}`)
}

main().catch(err => {
  console.error('❌ Error:', err.message || err)
  process.exit(1)
})
