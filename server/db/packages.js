/**
 * Package purchases (customer_packages + packages). Legacy JSON shape for admin / frontend.
 */

import { getSupabaseAdmin } from './supabaseClient.js'
import { upsertProfileFromCustomer, getProfileByEmail } from './users.js'

const CUSTOMER_PACKAGE_SELECT = `
  *,
  packages (id, name, total_classes, price, validity_days),
  profiles (email, first_name, last_name, phone)
`

function adaptCustomerPackageRow(row) {
  if (!row) return null
  const pkg = row.packages
  const prof = row.profiles
  const total = row.classes_total ?? pkg?.total_classes ?? 0
  const rem = row.classes_remaining ?? 0
  return {
    id: String(row.id),
    type: 'package',
    packageId: pkg ? String(pkg.id) : String(row.package_id),
    packageName: pkg?.name || '',
    classes: total,
    customer: {
      firstName: prof?.first_name || '',
      lastName: prof?.last_name || '',
      email: prof?.email || '',
      phone: prof?.phone || '',
      fullName: [prof?.first_name, prof?.last_name].filter(Boolean).join(' ').trim(),
    },
    payment: {
      method: 'Tarjeta de Crédito/Débito',
      amount: row.amount_paid ?? 0,
      currency: 'MXN',
      status: row.payment_status || 'pending',
    },
    stripeInfo: row.stripe_payment_intent_id
      ? { paymentIntentId: row.stripe_payment_intent_id }
      : null,
    purchaseDate: row.created_at,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    status: row.payment_status === 'succeeded' ? 'confirmed' : 'pending',
    classesRemaining: rem,
    classesUsed: Math.max(0, total - rem),
    userId: row.customer_id,
  }
}

export async function listAllPackagePurchases() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('customer_packages')
    .select(CUSTOMER_PACKAGE_SELECT)
    .order('id', { ascending: true })
  if (error) {
    console.error('listAllPackagePurchases:', error.message)
    return []
  }
  return (data || []).map(adaptCustomerPackageRow).filter(Boolean)
}

export async function getUserActivePackagesByEmail(email) {
  const profile = await getProfileByEmail(email)
  if (!profile) return []
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('customer_packages')
    .select(CUSTOMER_PACKAGE_SELECT)
    .eq('customer_id', profile.id)
    .eq('payment_status', 'succeeded')
    .gt('classes_remaining', 0)
  if (error) {
    console.error('getUserActivePackagesByEmail:', error.message)
    return []
  }
  const now = new Date()
  return (data || [])
    .map(adaptCustomerPackageRow)
    .filter((p) => p && (!p.expiresAt || new Date(p.expiresAt) > now))
}

/**
 * Insert customer_packages after Stripe (Stripe calls stay in server.js).
 */
export async function insertCustomerPackageAfterPayment({
  profileId,
  packageName,
  amountPaid,
  stripePaymentIntentId,
  paymentStatus = 'succeeded',
}) {
  const supabase = getSupabaseAdmin()
  const { data: candidates, error: pErr } = await supabase
    .from('packages')
    .select('*')
    .eq('name', packageName)
  if (pErr) throw pErr
  const list = candidates || []
  const pkg =
    list.find((p) => p.is_active === true) ||
    list.find((p) => p.is_active == null) ||
    list[0]
  if (!pkg) throw new Error('Paquete no encontrado en la base de datos.')

  const expiresAt = pkg.validity_days
    ? new Date(Date.now() + Number(pkg.validity_days) * 86400000).toISOString()
    : null

  const payOk = paymentStatus === 'succeeded'
  const { data: inserted, error: iErr } = await supabase
    .from('customer_packages')
    .insert({
      customer_id: profileId,
      package_id: pkg.id,
      classes_remaining: pkg.total_classes,
      classes_total: pkg.total_classes,
      payment_status: payOk ? 'succeeded' : 'pending',
      amount_paid: amountPaid,
      stripe_payment_intent_id: stripePaymentIntentId,
      expires_at: expiresAt,
    })
    .select(CUSTOMER_PACKAGE_SELECT)
    .single()
  if (iErr) throw iErr
  return adaptCustomerPackageRow(inserted)
}

export async function resolveProfileIdForPackagePurchase(purchaseData, authUser) {
  if (authUser?.id) {
    const supabase = getSupabaseAdmin()
    const { data } = await supabase.from('profiles').select('id').eq('auth_id', authUser.id).maybeSingle()
    if (data?.id) return data.id
    const { data: created } = await supabase
      .from('profiles')
      .upsert(
        {
          id: authUser.id,
          auth_id: authUser.id,
          email: authUser.email,
          first_name: purchaseData.customer?.firstName || '',
          last_name: purchaseData.customer?.lastName || '',
          phone: purchaseData.customer?.phone != null ? String(purchaseData.customer.phone) : '',
        },
        { onConflict: 'id' }
      )
      .select('id')
      .single()
    return created?.id
  }
  const c = purchaseData.customer || {}
  const profile = await upsertProfileFromCustomer(c)
  return profile.id
}
