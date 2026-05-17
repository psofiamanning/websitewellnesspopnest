import { getSupabaseAdmin } from './supabaseClient.js'
import { findDiscountCode, normalizeDiscountCode } from '../config/discountCodes.js'

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export async function hasCustomerRedeemedCode(email, code) {
  const supabase = getSupabaseAdmin()
  const normalizedEmail = normalizeEmail(email)
  const normalizedCode = normalizeDiscountCode(code)
  if (!normalizedEmail || !normalizedCode) return false

  const { data, error } = await supabase
    .from('discount_code_redemptions')
    .select('id')
    .eq('customer_email', normalizedEmail)
    .eq('discount_code', normalizedCode)
    .maybeSingle()

  if (error) {
    if (error.code === '42P01') {
      throw new Error(
        'La tabla discount_code_redemptions no existe. Ejecuta server/sql/add_discount_code_redemptions.sql en Supabase.'
      )
    }
    throw error
  }
  return !!data
}

/**
 * Valida código para un correo (sin canjear).
 */
export async function validateDiscountCodeForCustomer(email, code) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) {
    return { valid: false, error: 'Ingresa tu correo electrónico para aplicar un código.' }
  }

  const def = findDiscountCode(code)
  if (!def) {
    return { valid: false, error: 'Código de descuento inválido o no disponible.' }
  }

  const normalizedCode = normalizeDiscountCode(def.code)
  const alreadyUsed = await hasCustomerRedeemedCode(normalizedEmail, normalizedCode)
  if (alreadyUsed) {
    return {
      valid: false,
      error: 'Ya utilizaste este código de descuento con este correo.',
    }
  }

  return {
    valid: true,
    code: normalizedCode,
    label: def.label,
  }
}

/**
 * Registra el canje tras crear la reserva (único por email + código).
 */
export async function recordDiscountRedemption({ email, code, profileId, bookingId }) {
  const supabase = getSupabaseAdmin()
  const normalizedEmail = normalizeEmail(email)
  const normalizedCode = normalizeDiscountCode(code)

  const { error } = await supabase.from('discount_code_redemptions').insert({
    discount_code: normalizedCode,
    customer_email: normalizedEmail,
    profile_id: profileId || null,
    booking_id: bookingId != null ? Number(bookingId) : null,
  })

  if (error) {
    if (error.code === '23505') {
      throw new Error('Ya utilizaste este código de descuento con este correo.')
    }
    if (error.code === '42P01') {
      throw new Error(
        'La tabla discount_code_redemptions no existe. Ejecuta server/sql/add_discount_code_redemptions.sql en Supabase.'
      )
    }
    throw error
  }
}

/**
 * Valida de nuevo en el servidor antes de guardar la reserva.
 */
export async function assertDiscountEligible(email, code) {
  const result = await validateDiscountCodeForCustomer(email, code)
  if (!result.valid) {
    throw new Error(result.error || 'Código de descuento no válido.')
  }
  return result
}
