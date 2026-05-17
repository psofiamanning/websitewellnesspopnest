import { format } from 'date-fns'
import { es } from 'date-fns/locale'

function firstEmbed(value) {
  if (value == null) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

/**
 * Maps a bookings_new row (+ nested relations) to the flat API shape used by routes, Stripe hooks, and MailerSend.
 */
export function adaptBookingRow(row) {
  if (!row) return null
  const payment = firstEmbed(row.payments_new)
  const customerPackage = firstEmbed(row.customer_packages)
  const pkgTemplate = customerPackage?.packages
  const schedules = row.schedules
  const classes = schedules?.classes
  const teachers = schedules?.teachers
  const profiles = row.profiles

  const flat = {
    id: String(row.id),
    status: row.status,
    type: row.type,
    paymentMethod: row.payment_method,
    date: schedules?.scheduled_date ?? null,
    time: schedules?.scheduled_time ?? null,
    className: classes?.name ?? null,
    teacherName: teachers?.full_name ?? null,
    customer: {
      email: profiles?.email ?? '',
      firstName: profiles?.first_name ?? '',
      lastName: profiles?.last_name ?? '',
      phone: profiles?.phone ?? '',
      fullName: [profiles?.first_name, profiles?.last_name].filter(Boolean).join(' ').trim(),
    },
    payment: {
      amount: payment?.amount ?? 0,
      currency: (payment?.currency || 'MXN').toString().toUpperCase(),
      status:
        payment?.status ??
        (row.payment_method === 'package' ||
        row.payment_method === 'manual' ||
        row.payment_method === 'discount_code'
          ? 'succeeded'
          : 'pending'),
      method: payment?.method ?? row.payment_method ?? '',
      cardLastFour: payment?.card_last_four ?? null,
    },
    packageInfo:
      customerPackage && pkgTemplate
        ? {
            packageId: String(customerPackage.id),
            packageName: pkgTemplate.name,
            classesRemaining: customerPackage.classes_remaining,
          }
        : null,
  }

  const dateStr = flat.date
  flat.formattedDate = dateStr
    ? format(new Date(`${dateStr}T12:00:00`), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
    : ''
  flat.createdAt = row.created_at ?? null
  const pi = payment?.stripe_payment_intent_id ?? null
  flat.paymentIntentId = pi
  flat.stripeInfo = pi ? { paymentIntentId: pi } : null
  flat.paymentStatus =
    payment?.status ??
    (row.payment_method === 'package' || row.payment_method === 'discount_code'
      ? 'succeeded'
      : flat.payment.status)
  if (flat.packageInfo) {
    flat.packageId = flat.packageInfo.packageId
  }

  return flat
}
