import { createClient } from '@supabase/supabase-js'

let supabase = null
let inited = false
let configured = false

export function initSupabaseFromEnv() {
  if (inited) return
  inited = true
  const url = (process.env.SUPABASE_URL || '').trim()
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  configured = !!(url && key)
  if (configured) {
    supabase = createClient(url, key)
  }
}

/** Service-role client (DB + auth admin APIs). */
export function getSupabaseAdmin() {
  initSupabaseFromEnv()
  if (!configured || !supabase) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }
  return supabase
}

export function isSupabaseConfigured() {
  initSupabaseFromEnv()
  return configured
}

/** Anon key client (password auth from Node when mirroring legacy routes). */
export function getSupabaseAnon() {
  initSupabaseFromEnv()
  const url = (process.env.SUPABASE_URL || '').trim()
  const anon = (process.env.SUPABASE_ANON_KEY || '').trim()
  if (!url || !anon) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required for auth routes')
  }
  return createClient(url, anon)
}
