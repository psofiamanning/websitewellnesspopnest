/**
 * Users storage: Supabase (persistent) or JSON file (fallback).
 * Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to use Supabase.
 *
 * IMPORTANTE: Este módulo NUNCA borra datos en Supabase. Solo hace:
 * - getUsers: lectura (SELECT)
 * - saveUser: insertar nueva fila (INSERT)
 * - updateUser: actualizar una fila por id fusionando campos (UPDATE). No se sobrescribe todo el JSON, se hace merge.
 * La información existente en la base de datos se conserva siempre.
 */

import { createClient } from '@supabase/supabase-js'
import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const USERS_FILE = join(__dirname, '..', 'users.json')

// Inicializar Supabase de forma diferida (después de dotenv.config() en server.js)
let supabaseUrl = ''
let supabaseKey = ''
let useSupabase = false
let supabase = null
let supabaseInited = false

function initSupabase() {
  if (supabaseInited) return
  supabaseInited = true
  supabaseUrl = (process.env.SUPABASE_URL || '').trim()
  supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  useSupabase = !!(supabaseUrl && supabaseKey)
  if (useSupabase) {
    supabase = createClient(supabaseUrl, supabaseKey)
  }
}

/**
 * @returns {Promise<Array>} All users
 */
export async function getUsers() {
  initSupabase()
  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase.from('users').select('data').order('created_at', { ascending: true })
      if (error) {
        console.error('Supabase getUsers error:', error.message)
        return []
      }
      return (data || []).map((row) => row.data).filter(Boolean)
    } catch (e) {
      console.error('Supabase getUsers exception:', e.message)
      return []
    }
  }
  try {
    if (existsSync(USERS_FILE)) {
      const raw = await readFile(USERS_FILE, 'utf8')
      return JSON.parse(raw)
    }
    return []
  } catch (e) {
    console.error('File getUsers error:', e.message)
    return []
  }
}

/**
 * @param {object} user User object (must have .id)
 * @returns {Promise<object>} The saved user
 */
export async function saveUser(user) {
  initSupabase()
  if (useSupabase && supabase) {
    try {
      const { error } = await supabase.from('users').insert({
        id: user.id,
        data: user,
        created_at: user.createdAt || new Date().toISOString()
      })
      if (error) {
        console.error('Supabase saveUser error:', error.message)
        throw error
      }
      return user
    } catch (e) {
      console.error('Supabase saveUser exception:', e.message)
      throw e
    }
  }
  const users = await getUsers()
  users.push(user)
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2))
  return user
}

/**
 * @param {string} userId
 * @param {object} updates Fields to merge into the user
 * @returns {Promise<object|null>} Updated user or null
 */
export async function updateUser(userId, updates) {
  initSupabase()
  if (useSupabase && supabase) {
    try {
      const { data: rows, error: fetchErr } = await supabase.from('users').select('data').eq('id', userId).limit(1)
      if (fetchErr || !rows?.length) return null
      const current = rows[0].data
      const merged = { ...current, ...updates }
      const { error: updateErr } = await supabase.from('users').update({ data: merged }).eq('id', userId)
      if (updateErr) {
        console.error('Supabase updateUser error:', updateErr.message)
        return null
      }
      return merged
    } catch (e) {
      console.error('Supabase updateUser exception:', e.message)
      return null
    }
  }
  const users = await getUsers()
  const index = users.findIndex((u) => u.id === userId)
  if (index === -1) return null
  users[index] = { ...users[index], ...updates }
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2))
  return users[index]
}

export function isUsingSupabaseForUsers() {
  initSupabase()
  return useSupabase
}
