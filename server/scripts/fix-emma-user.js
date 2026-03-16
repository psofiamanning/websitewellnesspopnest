/**
 * One-off: Corregir teléfono de Emma García Zambrano y asegurar que tenga el paquete.
 * Ejecutar desde server/: node scripts/fix-emma-user.js
 */
import dotenv from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { getUsers, updateUser } from '../db/users.js'
import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env') })

const EMAIL = 'mitorecagz@hotmail.com'
const CORRECT_PHONE = '5554048423'

async function main() {
  const users = await getUsers()
  const user = users.find(u => u.email === EMAIL)
  if (!user) {
    console.error('Usuario no encontrado:', EMAIL)
    process.exit(1)
  }

  await updateUser(user.id, { phone: CORRECT_PHONE })
  console.log('✅ Teléfono actualizado a', CORRECT_PHONE, 'para', EMAIL)

  const PACKAGES_FILE = join(__dirname, '..', 'packages.json')
  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setMonth(expiresAt.getMonth() + 2)

  const purchase = {
    id: Date.now().toString(),
    type: 'package',
    packageId: 'package-10-classes',
    packageName: 'Paquete de 10 Clases',
    classes: 10,
    customer: {
      firstName: 'EMMA',
      lastName: 'GARCÍA ZAMBRANO',
      email: EMAIL,
      phone: CORRECT_PHONE,
      fullName: 'EMMA GARCÍA ZAMBRANO'
    },
    payment: {
      status: 'succeeded',
      amount: 180000,
      currency: 'MXN',
      method: 'Tarjeta de Crédito/Débito',
      cardLastFour: '****'
    },
    status: 'confirmed',
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    classesRemaining: 10,
    classesUsed: 0,
    userId: user.id
  }

  let purchases = []
  if (fs.existsSync(PACKAGES_FILE)) {
    purchases = JSON.parse(fs.readFileSync(PACKAGES_FILE, 'utf8'))
  }
  purchases.push(purchase)
  fs.writeFileSync(PACKAGES_FILE, JSON.stringify(purchases, null, 2))
  console.log('✅ Paquete de 10 Clases registrado para', EMAIL)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
