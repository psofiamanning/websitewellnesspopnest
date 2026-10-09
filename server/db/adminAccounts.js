// Cuentas del panel /admin (super_admin y operadores) en Supabase, para que no
// se pierdan cuando Railway redespliega y borra server/admins.json.
// Las contraseñas se guardan con scrypt (nunca en texto plano).
import crypto from 'node:crypto'
import { getSupabaseAdmin } from './supabaseClient.js'

const COLUMNS = 'id, email, password_hash, name, role, created_at, updated_at'

/** La tabla puede no existir todavía (falta correr add_admin_accounts.sql). */
export function isMissingTable(error) {
  if (!error) return false
  const msg = error.message || ''
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    /relation .* does not exist/i.test(msg) ||
    /could not find the table/i.test(msg) ||
    /schema cache/i.test(msg)
  )
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex')
  return `scrypt$${salt}$${hash}`
}

export function verifyPassword(password, stored) {
  const [scheme, salt, hash] = String(stored || '').split('$')
  if (scheme !== 'scrypt' || !salt || !hash) return false
  const expected = Buffer.from(hash, 'hex')
  const actual = crypto.scryptSync(String(password), salt, expected.length)
  return crypto.timingSafeEqual(expected, actual)
}

function toAdmin(row) {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    name: row.name,
    role: row.role === 'operator' ? 'operator' : 'super_admin'
  }
}

/** Todas las cuentas; lanza el error de Supabase (incluido "tabla no existe"). */
export async function listAdminAccounts() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('admin_accounts').select(COLUMNS).order('created_at')
  if (error) throw error
  return (data || []).map(toAdmin)
}

export async function insertAdminAccount({ id, email, password, name, role }) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('admin_accounts')
    .insert({
      id,
      email: email.trim().toLowerCase(),
      password_hash: hashPassword(password),
      name,
      role: role === 'operator' ? 'operator' : 'super_admin'
    })
    .select(COLUMNS)
    .single()
  if (error) throw error
  return toAdmin(data)
}

/** Copia cuentas existentes (p. ej. de admins.json) sin pisar las que ya están. */
export async function seedAdminAccounts(admins) {
  const valid = admins.filter(a => a.email && a.password)
  if (!valid.length) return
  const supabase = getSupabaseAdmin()
  const rows = valid.map(a => ({
    id: a.id,
    email: a.email.trim().toLowerCase(),
    password_hash: hashPassword(a.password),
    name: a.name || null,
    role: a.role === 'operator' ? 'operator' : 'super_admin'
  }))
  const { error } = await supabase
    .from('admin_accounts')
    .upsert(rows, { onConflict: 'email', ignoreDuplicates: true })
  if (error) throw error
}

export async function updateAdminAccountPassword(email, newPassword) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('admin_accounts')
    .update({ password_hash: hashPassword(newPassword), updated_at: new Date().toISOString() })
    .eq('email', email.trim().toLowerCase())
    .select(COLUMNS)
    .maybeSingle()
  if (error) throw error
  return data ? toAdmin(data) : null
}
