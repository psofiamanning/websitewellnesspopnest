/**
 * Customer profiles (Supabase) + JWT verification via Supabase Auth.
 * Passwords are never stored in app tables.
 */

import { getSupabaseAdmin } from './supabaseClient.js'

export async function upsertProfileFromCustomer(customer) {
  const supabase = getSupabaseAdmin()
  const email = (customer.email || '').trim().toLowerCase()
  if (!email) throw new Error('Customer email is required')

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        email,
        first_name: customer.firstName || '',
        last_name: customer.lastName || '',
        phone: customer.phone != null ? String(customer.phone) : '',
      },
      { onConflict: 'email' }
    )
    .select('id, email, first_name, last_name, phone, auth_id')
    .single()

  if (error) throw error
  return data
}

export async function getProfileByEmail(email) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, phone, auth_id')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle()
  if (error) return null
  return data
}

export function profileToApiUser(p) {
  if (!p) return null
  return {
    id: p.id,
    email: p.email,
    firstName: p.first_name || '',
    lastName: p.last_name || '',
    phone: p.phone != null ? String(p.phone) : '',
  }
}

/** Verify Supabase Auth JWT (access token). */
export async function verifyAuthJwt(accessToken) {
  if (!accessToken) return null
  const supabase = getSupabaseAdmin()
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  if (error || !user) return null
  return user
}

export async function getProfileForAuthUser(user) {
  if (!user?.id) return null
  const supabase = getSupabaseAdmin()
  const { data: byAuth } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, phone, auth_id')
    .eq('auth_id', user.id)
    .maybeSingle()
  if (byAuth) return byAuth
  if (!user.email) return null
  const { data: byEmail } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, phone, auth_id')
    .eq('email', user.email.trim().toLowerCase())
    .maybeSingle()
  return byEmail
}

export async function upsertProfileForAuthUser(user, extra = {}) {
  const supabase = getSupabaseAdmin()
  const email = (user.email || '').trim().toLowerCase()
  const firstName = extra.first_name ?? user.user_metadata?.first_name ?? ''
  const lastName = extra.last_name ?? user.user_metadata?.last_name ?? ''
  const phone =
    extra.phone != null
      ? String(extra.phone)
      : user.user_metadata?.phone != null
        ? String(user.user_metadata.phone)
        : ''

  // Reutiliza el perfil existente por correo (p. ej. creado antes por una reserva de
  // invitado, con un `id` distinto al del usuario de Auth) en vez de insertar uno
  // nuevo con `id: user.id` — ese insert choca con la restricción única de `email` y
  // deja auth_id sin vincular, provocando el mismo error en cada intento posterior.
  if (email) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    if (existing) {
      const patch = { email, auth_id: user.id }
      // No pisar nombre/teléfono ya guardados con vacíos si esta llamada (p. ej. un
      // login) no trae datos nuevos — el metadata de Auth suele no tenerlos.
      if (firstName) patch.first_name = firstName
      if (lastName) patch.last_name = lastName
      if (phone) patch.phone = phone
      const { data, error } = await supabase
        .from('profiles')
        .update(patch)
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      return data
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: user.id, auth_id: user.id, email, first_name: firstName, last_name: lastName, phone })
    .select()
    .single()
  if (error) throw error
  return data
}

/** @deprecated List profiles — only for legacy scripts. */
export async function getUsers() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('profiles').select('id, email, first_name, last_name, phone, auth_id')
  if (error) return []
  return (data || []).map(profileToApiUser)
}

export async function updateUser(userId, updates) {
  const supabase = getSupabaseAdmin()
  const patch = {}
  if (updates.phone !== undefined) patch.phone = String(updates.phone)
  if (updates.firstName !== undefined) patch.first_name = updates.firstName
  if (updates.lastName !== undefined) patch.last_name = updates.lastName
  if (updates.email !== undefined) patch.email = String(updates.email).trim().toLowerCase()
  if (!Object.keys(patch).length) return profileToApiUser(await getProfileById(userId))
  const { data, error } = await supabase.from('profiles').update(patch).eq('id', userId).select().single()
  if (error) return null
  return profileToApiUser(data)
}

async function getProfileById(id) {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
  return data
}

export async function saveUser() {
  throw new Error('saveUser removed: register with Supabase Auth')
}

export function isUsingSupabaseForUsers() {
  try {
    getSupabaseAdmin()
    return true
  } catch {
    return false
  }
}
