-- EMAILS únicos de todas las personas que reservaron en AGOSTO, SEPTIEMBRE y OCTUBRE 2026
-- (clases, talleres, renta de salón)
-- + los correos que dejaron en la promo de clase gratis (popup). Por fecha en que se hizo la reserva, hora CDMX.
-- Supabase → SQL Editor → Run. Exportable a CSV para MailerLite.
WITH reservas AS (
  -- Clases (incluye reservas con paquete, código o manuales; excluye canceladas)
  SELECT lower(trim(p.email)) AS email,
         trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
         p.phone AS telefono,
         'Clase'::text AS tipo,
         b.created_at AS fecha
  FROM public.bookings_new b
  JOIN public.profiles p ON p.id = b.customer_id
  WHERE b.status <> 'cancelled'

  UNION ALL

  -- Talleres pagados
  SELECT lower(trim(tb.customer_email)), tb.customer_name, tb.customer_phone, 'Taller', tb.created_at
  FROM public.taller_bookings tb
  WHERE tb.payment_status IN ('succeeded', 'paid')

  UNION ALL

  -- Renta de salón pagada
  SELECT lower(trim(sb.customer_email)), sb.customer_name, sb.customer_phone, 'Renta de salón',
         coalesce(sb.paid_at, sb.created_at)
  FROM public.salon_bookings sb
  WHERE sb.status = 'paid'

  UNION ALL

  -- Promo "clase gratis" (correos del popup, aunque no hayan reservado)
  SELECT lower(trim(le.email)), NULL, NULL, 'Promo clase gratis', le.created_at
  FROM public.lead_emails le
)
SELECT
  email,
  max(nombre)                                   AS nombre,
  max(telefono)                                 AS telefono,
  string_agg(DISTINCT tipo, ', ')               AS reservo,
  count(*)                                      AS num_reservas,
  to_char(min(fecha) AT TIME ZONE 'America/Mexico_City', 'YYYY-MM-DD') AS primera_reserva,
  to_char(max(fecha) AT TIME ZONE 'America/Mexico_City', 'YYYY-MM-DD') AS ultima_reserva
FROM reservas
WHERE email IS NOT NULL AND email <> ''
  AND fecha >= timestamptz '2026-08-01 00:00 America/Mexico_City'
  AND fecha <  timestamptz '2026-11-01 00:00 America/Mexico_City'
GROUP BY email
ORDER BY num_reservas DESC, email;
