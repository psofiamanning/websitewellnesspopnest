/**
 * Package purchases (customer_packages + packages). Legacy JSON shape for admin / frontend.
 */

import { getSupabaseAdmin } from './supabaseClient.js'
import { upsertProfileFromCustomer, getProfileByEmail } from './users.js'
import { countBookingsByCustomerPackageIds } from './bookings.js'

const PAQUETE_20_NOMBRE = 'Paquete de 20 Clases'

const CUSTOMER_PACKAGE_SELECT = `
  *,
  packages (id, name, total_classes, price, validity_days),
  profiles (email, first_name, last_name, phone)
`

function adaptCustomerPackageRow(row, options = {}) {
  if (!row) return null
  const pkg = row.packages
  const prof = row.profiles
  const total = row.classes_total ?? pkg?.total_classes ?? 0
  const confirmedCount = options.confirmedCount
  let rem
  let used
  if (confirmedCount != null && Number.isFinite(Number(confirmedCount))) {
    const n = Number(confirmedCount)
    used = n
    rem = Math.max(0, total - n)
  } else {
    rem = row.classes_remaining ?? 0
    used = Math.max(0, total - rem)
  }
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
    classesUsed: used,
    userId: row.customer_id,
  }
}

async function mapPackagesWithBookingCounts(rows) {
  const list = rows || []
  const ids = list.map((r) => r.id).filter((id) => id != null)
  const countMap = await countBookingsByCustomerPackageIds(ids)
  const getCount = (id) =>
    countMap.get(id) ?? countMap.get(Number(id)) ?? countMap.get(String(id)) ?? 0

  return list.map((row) => adaptCustomerPackageRow(row, { confirmedCount: getCount(row.id) }))
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
  const rows = data || []
  return (await mapPackagesWithBookingCounts(rows)).filter(Boolean)
}

async function fetchActivePackagesForCustomerId(customerId) {
  if (!customerId) return []
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('customer_packages')
    .select(CUSTOMER_PACKAGE_SELECT)
    .eq('customer_id', customerId)
    .eq('payment_status', 'succeeded')
    .gt('classes_remaining', 0)
  if (error) {
    console.error('fetchActivePackagesForCustomerId:', error.message)
    return []
  }
  const now = new Date()
  const enriched = await mapPackagesWithBookingCounts(data || [])
  return enriched.filter((p) => p && (!p.expiresAt || new Date(p.expiresAt) > now))
}

/** Paquetes activos por id de perfil (mismo criterio que por email). */
export async function getUserActivePackagesByProfileId(profileId) {
  return fetchActivePackagesForCustomerId(profileId)
}

export async function getUserActivePackagesByEmail(email) {
  const profile = await getProfileByEmail(email)
  if (!profile) return []
  return fetchActivePackagesForCustomerId(profile.id)
}

async function fetchAllPurchasedPackagesForCustomerId(customerId) {
  if (!customerId) return []
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('customer_packages')
    .select(CUSTOMER_PACKAGE_SELECT)
    .eq('customer_id', customerId)
    .eq('payment_status', 'succeeded')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('fetchAllPurchasedPackagesForCustomerId:', error.message)
    return []
  }
  return mapPackagesWithBookingCounts(data || [])
}

function isPackageActive(pkg, now = new Date()) {
  if (!pkg) return false
  const remaining = Number(pkg.classesRemaining ?? 0)
  if (remaining <= 0) return false
  if (pkg.expiresAt && new Date(pkg.expiresAt) <= now) return false
  return true
}

/** Todos los paquetes comprados del usuario, separados en activos e historial. */
export async function getUserAllPackagesByEmail(email) {
  const profile = await getProfileByEmail(email)
  if (!profile) {
    return {
      activePackages: [],
      historyPackages: [],
      allPackages: [],
      totalClassesRemaining: 0,
      hasActivePackages: false,
      hasPurchasedPackages: false,
    }
  }
  const all = (await fetchAllPurchasedPackagesForCustomerId(profile.id)).filter(Boolean)
  const now = new Date()
  const activePackages = all.filter((p) => isPackageActive(p, now))
  const historyPackages = all.filter((p) => !isPackageActive(p, now))
  const totalClassesRemaining = activePackages.reduce(
    (sum, pkg) => sum + (Number(pkg.classesRemaining) || 0),
    0,
  )
  return {
    activePackages,
    historyPackages,
    allPackages: all,
    totalClassesRemaining,
    hasActivePackages: activePackages.length > 0,
    hasPurchasedPackages: all.length > 0,
  }
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
  let classesTotal = pkg.total_classes
  let classesRemaining = pkg.total_classes
  if (pkg.name === PAQUETE_20_NOMBRE && classesTotal > 0) {
    classesRemaining = Math.max(0, classesTotal - 2)
  }

  const { data: inserted, error: iErr } = await supabase
    .from('customer_packages')
    .insert({
      customer_id: profileId,
      package_id: pkg.id,
      classes_remaining: classesRemaining,
      classes_total: classesTotal,
      payment_status: payOk ? 'succeeded' : 'pending',
      amount_paid: amountPaid,
      stripe_payment_intent_id: stripePaymentIntentId,
      expires_at: expiresAt,
    })
    .select(CUSTOMER_PACKAGE_SELECT)
    .single()
  if (iErr) throw iErr
  const map = await countBookingsByCustomerPackageIds([inserted.id])
  const cnt = map.get(inserted.id) ?? map.get(Number(inserted.id)) ?? 0
  return adaptCustomerPackageRow(inserted, { confirmedCount: cnt })
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
