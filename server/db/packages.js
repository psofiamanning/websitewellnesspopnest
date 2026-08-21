/**
 * Package purchases (customer_packages + packages). Legacy JSON shape for admin / frontend.
 */

import { getSupabaseAdmin } from './supabaseClient.js'
import { upsertProfileFromCustomer, getProfileByEmail, upsertProfileForAuthUser } from './users.js'
import { countBookingsByCustomerPackageIds } from './bookings.js'

const PAQUETE_20_NOMBRE = 'Paquete de 20 Clases'
// Paquete ilimitado: NO descuenta clases; vale por tiempo (su vigencia).
// Se detecta por nombre (mismo patrón que el Paquete de 20), sin columnas nuevas.
export const PAQUETE_ILIMITADO_NOMBRE = 'Ilimitado Mensual'
/** Catálogo interno: créditos sin Stripe; el cliente elige fecha al reservar. */
export const ADMIN_GRANT_PACKAGE_NAME = 'Clases otorgadas — Administración'

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
  const adminGranted =
    row.admin_granted === true || pkg?.name === ADMIN_GRANT_PACKAGE_NAME
  const isUnlimited = pkg?.name === PAQUETE_ILIMITADO_NOMBRE
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
    packageName: adminGranted ? ADMIN_GRANT_PACKAGE_NAME : pkg?.name || '',
    adminGranted: !!adminGranted,
    adminGrantNote: row.admin_grant_note || null,
    classes: total,
    customer: {
      firstName: prof?.first_name || '',
      lastName: prof?.last_name || '',
      email: prof?.email || '',
      phone: prof?.phone || '',
      fullName: [prof?.first_name, prof?.last_name].filter(Boolean).join(' ').trim(),
    },
    payment: adminGranted
      ? {
          method: 'Otorgado por el estudio',
          amount: 0,
          currency: 'MXN',
          status: 'succeeded',
        }
      : {
          method: 'Tarjeta de Crédito/Débito',
          amount: row.amount_paid ?? 0,
          currency: 'MXN',
          status: row.payment_status || 'pending',
        },
    stripeInfo:
      adminGranted || !row.stripe_payment_intent_id
        ? null
        : { paymentIntentId: row.stripe_payment_intent_id },
    purchaseDate: row.created_at,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    status: row.payment_status === 'succeeded' ? 'confirmed' : 'pending',
    classesRemaining: rem,
    classesUsed: used,
    isUnlimited,
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
  // Sin `.gt('classes_remaining', 0)` en la consulta: filtramos en JS para poder
  // incluir el paquete ilimitado (que no se rige por cupo, sino por vigencia).
  const { data, error } = await supabase
    .from('customer_packages')
    .select(CUSTOMER_PACKAGE_SELECT)
    .eq('customer_id', customerId)
    .eq('payment_status', 'succeeded')
  if (error) {
    console.error('fetchActivePackagesForCustomerId:', error.message)
    return []
  }
  const now = new Date()
  const enriched = await mapPackagesWithBookingCounts(data || [])
  return enriched.filter(
    (p) =>
      p &&
      (!p.expiresAt || new Date(p.expiresAt) > now) &&
      (p.isUnlimited || Number(p.classesRemaining) > 0),
  )
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
  if (pkg.expiresAt && new Date(pkg.expiresAt) <= now) return false
  // Ilimitado: activo mientras no venza, sin importar el cupo.
  if (pkg.isUnlimited) return true
  const remaining = Number(pkg.classesRemaining ?? 0)
  if (remaining <= 0) return false
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
  referredBy = null,
}) {
  const supabase = getSupabaseAdmin()

  // Idempotencia: si este Payment Intent ya se registró (p. ej. el navegador ya lo
  // guardó, o el webhook llegó primero), devolver la fila existente en vez de duplicar.
  if (stripePaymentIntentId) {
    const { data: existing } = await supabase
      .from('customer_packages')
      .select(CUSTOMER_PACKAGE_SELECT)
      .eq('stripe_payment_intent_id', stripePaymentIntentId)
      .maybeSingle()
    if (existing) {
      const dupMap = await countBookingsByCustomerPackageIds([existing.id])
      const dupCnt = dupMap.get(existing.id) ?? dupMap.get(Number(existing.id)) ?? 0
      return { ...adaptCustomerPackageRow(existing, { confirmedCount: dupCnt }), _isNewPayment: false }
    }
  }

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

  const cleanReferredBy = String(referredBy || '').trim().slice(0, 120) || null
  const insertRow = {
    customer_id: profileId,
    package_id: pkg.id,
    classes_remaining: classesRemaining,
    classes_total: classesTotal,
    payment_status: payOk ? 'succeeded' : 'pending',
    amount_paid: amountPaid,
    stripe_payment_intent_id: stripePaymentIntentId,
    expires_at: expiresAt,
    referred_by: cleanReferredBy,
  }
  let { data: inserted, error: iErr } = await supabase
    .from('customer_packages')
    .insert(insertRow)
    .select(CUSTOMER_PACKAGE_SELECT)
    .single()
  // Si la columna referred_by aún no existe en Supabase, reintenta sin ella.
  if (iErr && `${iErr.message || ''} ${iErr.details || ''}`.toLowerCase().includes('referred_by')) {
    console.warn(
      'customer_packages.referred_by no existe; ejecuta server/sql/add_package_referred_by.sql en Supabase.'
    )
    const { referred_by: _omit, ...fallbackRow } = insertRow
    const retry = await supabase
      .from('customer_packages')
      .insert(fallbackRow)
      .select(CUSTOMER_PACKAGE_SELECT)
      .single()
    inserted = retry.data
    iErr = retry.error
  }
  if (iErr) throw iErr
  const map = await countBookingsByCustomerPackageIds([inserted.id])
  const cnt = map.get(inserted.id) ?? map.get(Number(inserted.id)) ?? 0
  return { ...adaptCustomerPackageRow(inserted, { confirmedCount: cnt }), _isNewPayment: true }
}

async function ensureAdminGrantCatalogPackage() {
  const supabase = getSupabaseAdmin()
  const { data: rows, error: qErr } = await supabase
    .from('packages')
    .select('*')
    .eq('name', ADMIN_GRANT_PACKAGE_NAME)
    .limit(5)
  if (qErr) throw qErr
  const found = (rows || []).find((p) => p.is_active === true) || (rows || [])[0]
  if (found) return found

  const { data: inserted, error: iErr } = await supabase
    .from('packages')
    .insert({
      name: ADMIN_GRANT_PACKAGE_NAME,
      total_classes: 1,
      price: 0,
      validity_days: 365,
      is_active: true,
    })
    .select()
    .single()
  if (iErr) throw iErr
  return inserted
}

function isAdminGrantRowOpen(row) {
  if (!row) return false
  const rem = Number(row.classes_remaining) || 0
  if (rem <= 0) return false
  if (row.expires_at && new Date(row.expires_at) <= new Date()) return false
  return true
}

/**
 * Otorgar créditos de clase (admin): sin fecha, sin Stripe. El cliente reserva día/hora en la web.
 * Suma al saldo activo de «Clases otorgadas — Administración» o crea un registro nuevo.
 */
export async function grantAdminClassCredits({
  email,
  profileId,
  classes,
  validityDays = 60,
  note = null,
}) {
  const add = Math.max(0, Number(classes) || 0)
  if (add <= 0) throw new Error('Indica cuántas clases otorgar (mínimo 1).')

  const supabase = getSupabaseAdmin()
  let customerId = profileId
  if (!customerId && email) {
    const profile = await getProfileByEmail(email)
    if (!profile?.id) throw new Error('Cliente no encontrado con ese correo.')
    customerId = profile.id
  }
  if (!customerId) throw new Error('Se requiere el correo del cliente.')

  const catalog = await ensureAdminGrantCatalogPackage()
  const { data: existingRows, error: lErr } = await supabase
    .from('customer_packages')
    .select('id, classes_remaining, expires_at, admin_granted')
    .eq('customer_id', customerId)
    .eq('package_id', catalog.id)
    .eq('payment_status', 'succeeded')
    .order('created_at', { ascending: false })
  if (lErr) throw lErr

  const open = (existingRows || []).find(isAdminGrantRowOpen)
  if (open?.id) {
    const updated = await addClassesToCustomerPackage(open.id, {
      addClasses: add,
      extendValidityDays: validityDays,
    })
    if (note?.trim()) {
      await supabase
        .from('customer_packages')
        .update({ admin_grant_note: String(note).trim() })
        .eq('id', open.id)
    }
    return updated
  }

  const expiresAtIso =
    validityDays != null && Number(validityDays) > 0
      ? new Date(Date.now() + Number(validityDays) * 86400000).toISOString()
      : null

  const insertPayload = {
    customer_id: customerId,
    package_id: catalog.id,
    classes_remaining: add,
    classes_total: add,
    payment_status: 'succeeded',
    amount_paid: 0,
    stripe_payment_intent_id: null,
    expires_at: expiresAtIso,
    admin_granted: true,
    admin_grant_note: note?.trim() || null,
  }

  let inserted
  let iErr
  ;({ data: inserted, error: iErr } = await supabase
    .from('customer_packages')
    .insert(insertPayload)
    .select(CUSTOMER_PACKAGE_SELECT)
    .single())

  if (iErr && (iErr.message?.includes('admin_granted') || iErr.code === '42703')) {
    const { admin_granted: _a, admin_grant_note: _n, ...fallback } = insertPayload
    ;({ data: inserted, error: iErr } = await supabase
      .from('customer_packages')
      .insert(fallback)
      .select(CUSTOMER_PACKAGE_SELECT)
      .single())
  }
  if (iErr) throw iErr

  const map = await countBookingsByCustomerPackageIds([inserted.id])
  const cnt = map.get(inserted.id) ?? map.get(Number(inserted.id)) ?? 0
  return adaptCustomerPackageRow(inserted, { confirmedCount: cnt })
}

/**
 * Otorgar un paquete nuevo al cliente (admin). Siempre INSERT — no modifica compras ni reservas anteriores.
 * Requiere quitar índice único customer_packages_unique_active en Supabase (ver drop_customer_packages_one_per_catalog.sql).
 */
export async function grantCustomerPackageManual({
  email,
  profileId,
  packageName = 'Paquete de 10 Clases',
  classesRemaining,
  classesTotal,
  validityDays,
  expiresAt,
  amountPaid = 0,
  stripePaymentIntentId = null,
}) {
  const supabase = getSupabaseAdmin()
  let customerId = profileId
  if (!customerId && email) {
    const profile = await getProfileByEmail(email)
    if (!profile?.id) throw new Error('Cliente no encontrado con ese correo.')
    customerId = profile.id
  }
  if (!customerId) throw new Error('Se requiere email o profileId del cliente.')

  if (stripePaymentIntentId) {
    const { data: existingPi } = await supabase
      .from('customer_packages')
      .select('id')
      .eq('stripe_payment_intent_id', stripePaymentIntentId)
      .maybeSingle()
    if (existingPi?.id) {
      throw new Error(`Ya existe un paquete con ese Payment Intent (id ${existingPi.id}).`)
    }
  }

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
  if (!pkg) throw new Error('Paquete no encontrado en catálogo.')

  const total = classesTotal != null ? Number(classesTotal) : Number(pkg.total_classes) || 10
  let remaining =
    classesRemaining != null ? Number(classesRemaining) : total
  if (pkg.name === PAQUETE_20_NOMBRE && classesRemaining == null) {
    remaining = Math.max(0, total - 2)
  }

  let expiresAtIso = expiresAt || null
  if (!expiresAtIso && validityDays != null && Number(validityDays) > 0) {
    expiresAtIso = new Date(Date.now() + Number(validityDays) * 86400000).toISOString()
  } else if (!expiresAtIso && pkg.validity_days) {
    expiresAtIso = new Date(Date.now() + Number(pkg.validity_days) * 86400000).toISOString()
  }

  const { data: inserted, error: iErr } = await supabase
    .from('customer_packages')
    .insert({
      customer_id: customerId,
      package_id: pkg.id,
      classes_remaining: remaining,
      classes_total: total,
      payment_status: 'succeeded',
      amount_paid: amountPaid != null ? Number(amountPaid) : 0,
      stripe_payment_intent_id: stripePaymentIntentId || null,
      expires_at: expiresAtIso,
    })
    .select(CUSTOMER_PACKAGE_SELECT)
    .single()

  if (iErr) {
    if (iErr.code === '23505') {
      throw new Error(
        'No se pudo crear un segundo paquete del mismo tipo. Ejecuta server/sql/drop_customer_packages_one_per_catalog.sql en Supabase.',
      )
    }
    throw iErr
  }

  const map = await countBookingsByCustomerPackageIds([inserted.id])
  const cnt = map.get(inserted.id) ?? map.get(Number(inserted.id)) ?? 0
  return adaptCustomerPackageRow(inserted, { confirmedCount: cnt })
}

/**
 * Sumar clases al saldo de un paquete existente (cortesía / ajuste). No toca reservas pasadas.
 */
export async function addClassesToCustomerPackage(customerPackageId, { addClasses = 0, extendValidityDays = 0 } = {}) {
  const supabase = getSupabaseAdmin()
  const id = Number(customerPackageId)
  if (!Number.isFinite(id)) throw new Error('ID de paquete inválido.')

  const { data: row, error: gErr } = await supabase
    .from('customer_packages')
    .select('*, packages ( name, total_classes )')
    .eq('id', id)
    .maybeSingle()
  if (gErr || !row) throw new Error('Paquete del cliente no encontrado.')

  const add = Math.max(0, Number(addClasses) || 0)
  if (add <= 0) throw new Error('Indica cuántas clases sumar (mínimo 1).')

  const countMap = await countBookingsByCustomerPackageIds([id])
  const bookingsUsed =
    countMap.get(id) ?? countMap.get(Number(id)) ?? countMap.get(String(id)) ?? 0

  const prevTotal = Number(row.classes_total) || Number(row.packages?.total_classes) || 0
  const nextTotal = prevTotal + add
  const nextRemaining = Math.max(0, nextTotal - Number(bookingsUsed))

  const patch = {
    classes_total: nextTotal,
    classes_remaining: nextRemaining,
    payment_status: 'succeeded',
  }
  if (extendValidityDays > 0) {
    const base = row.expires_at ? new Date(row.expires_at) : new Date()
    const from = base > new Date() ? base : new Date()
    patch.expires_at = new Date(from.getTime() + Number(extendValidityDays) * 86400000).toISOString()
  }

  const { data: updated, error: uErr } = await supabase
    .from('customer_packages')
    .update(patch)
    .eq('id', id)
    .select(CUSTOMER_PACKAGE_SELECT)
    .single()
  if (uErr) throw uErr

  const map = await countBookingsByCustomerPackageIds([updated.id])
  const cnt = map.get(updated.id) ?? map.get(Number(updated.id)) ?? 0
  return adaptCustomerPackageRow(updated, { confirmedCount: cnt })
}

export async function listCustomerPackagesByEmail(email) {
  const profile = await getProfileByEmail(email)
  if (!profile) return []
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('customer_packages')
    .select(CUSTOMER_PACKAGE_SELECT)
    .eq('customer_id', profile.id)
    .order('created_at', { ascending: true })
  if (error) throw error
  const rows = data || []
  return (await mapPackagesWithBookingCounts(rows)).filter(Boolean)
}

export async function resolveProfileIdForPackagePurchase(purchaseData, authUser) {
  if (authUser?.id) {
    const supabase = getSupabaseAdmin()
    const { data } = await supabase.from('profiles').select('id').eq('auth_id', authUser.id).maybeSingle()
    if (data?.id) return data.id
    const created = await upsertProfileForAuthUser(authUser, {
      first_name: purchaseData.customer?.firstName || '',
      last_name: purchaseData.customer?.lastName || '',
      phone: purchaseData.customer?.phone != null ? String(purchaseData.customer.phone) : '',
    })
    return created?.id
  }
  const c = purchaseData.customer || {}
  const profile = await upsertProfileFromCustomer(c)
  return profile.id
}
