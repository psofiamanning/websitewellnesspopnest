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
 * Fecha límite para canjear un código con vigencia (validDays) para este correo,
 * contada desde que dejó su correo en el popup. null = sin límite (el código no
 * tiene vigencia o el correo no está en lead_emails).
 */
async function getPromoDeadline(email, def) {
  if (!def.validDays || !def.leadOffer) return null
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('lead_emails')
    .select('created_at')
    .eq('email', email)
    .eq('offer', def.leadOffer)
    .maybeSingle()
  if (error) throw error
  if (!data?.created_at) return null
  const registeredAt = new Date(data.created_at).getTime()
  let deadline = registeredAt + def.validDays * 24 * 60 * 60 * 1000
  if (def.graceFrom && def.graceUntil && registeredAt >= new Date(def.graceFrom).getTime()) {
    deadline = Math.max(deadline, new Date(def.graceUntil).getTime())
  }
  return new Date(deadline)
}

/**
 * Estado de la clase gratis de la promo para un correo que ya estaba en lead_emails:
 * 'redeemed' (ya la usó), 'expired' (se le pasó el plazo) o 'active'.
 */
export async function getFreeClassPromoStatus(email, code = 'POPNEST') {
  const normalizedEmail = normalizeEmail(email)
  const def = findDiscountCode(code)
  if (!normalizedEmail || !def) return { status: 'active', deadline: null }
  if (await hasCustomerRedeemedCode(normalizedEmail, def.code)) {
    return { status: 'redeemed', deadline: null }
  }
  const deadline = await getPromoDeadline(normalizedEmail, def)
  if (deadline && Date.now() > deadline.getTime()) {
    return { status: 'expired', deadline: deadline.toISOString() }
  }
  return { status: 'active', deadline: deadline ? deadline.toISOString() : null }
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

  const deadline = await getPromoDeadline(normalizedEmail, def)
  if (deadline && Date.now() > deadline.getTime()) {
    return {
      valid: false,
      error: `Tu clase gratis venció: tenías ${def.validDays} días para reservarla desde que te registraste en la promoción.`,
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
