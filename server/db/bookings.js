/**
 * Bookings storage: Supabase (persistent) or JSON file (fallback).
 * Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to use Supabase and keep data across deploys.
 */

import { createClient } from '@supabase/supabase-js'
import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BOOKINGS_FILE = join(__dirname, '..', 'bookings.json')

const supabaseUrl = (process.env.SUPABASE_URL || '').trim()
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
const useSupabase = supabaseUrl && supabaseKey

let supabase = null
if (useSupabase) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

/**
 * @returns {Promise<Array>} All bookings
 */
export async function getBookings() {
  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase.from('bookings').select('data').order('created_at', { ascending: true })
      if (error) {
        console.error('Supabase getBookings error:', error.message)
        return []
      }
      return (data || []).map((row) => row.data).filter(Boolean)
    } catch (e) {
      console.error('Supabase getBookings exception:', e.message)
      return []
    }
  }
  try {
    if (existsSync(BOOKINGS_FILE)) {
      const raw = await readFile(BOOKINGS_FILE, 'utf8')
      return JSON.parse(raw)
    }
    return []
  } catch (e) {
    console.error('File getBookings error:', e.message)
    return []
  }
}

/**
 * @param {object} booking Full booking object (must have .id)
 * @returns {Promise<object>} The saved booking
 */
export async function saveBooking(booking) {
  if (useSupabase && supabase) {
    try {
      const { error } = await supabase.from('bookings').insert({
        id: booking.id,
        data: booking,
        created_at: booking.createdAt || new Date().toISOString()
      })
      if (error) {
        console.error('Supabase saveBooking error:', error.message)
        throw error
      }
      return booking
    } catch (e) {
      console.error('Supabase saveBooking exception:', e.message)
      throw e
    }
  }
  const bookings = await getBookings()
  bookings.push(booking)
  await writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2))
  return booking
}

/**
 * @param {string} bookingId
 * @param {object} updates Fields to merge into the booking
 * @returns {Promise<object|null>} Updated booking or null
 */
export async function updateBooking(bookingId, updates) {
  if (useSupabase && supabase) {
    try {
      const { data: rows, error: fetchErr } = await supabase.from('bookings').select('data').eq('id', bookingId).limit(1)
      if (fetchErr || !rows?.length) return null
      const current = rows[0].data
      const merged = { ...current, ...updates }
      const { error: updateErr } = await supabase.from('bookings').update({ data: merged }).eq('id', bookingId)
      if (updateErr) {
        console.error('Supabase updateBooking error:', updateErr.message)
        return null
      }
      return merged
    } catch (e) {
      console.error('Supabase updateBooking exception:', e.message)
      return null
    }
  }
  const bookings = await getBookings()
  const index = bookings.findIndex((b) => b.id === bookingId)
  if (index === -1) return null
  bookings[index] = { ...bookings[index], ...updates }
  await writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2))
  return bookings[index]
}

export function isUsingSupabase() {
  return useSupabase
}
