-- Buscar paquetes de clientes por nombre (Supabase → SQL Editor)
-- Ajusta los nombres en la lista del WHERE si hace falta.

-- 1) Perfiles que coinciden (por si el nombre está escrito distinto)
SELECT
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.phone,
  p.created_at
FROM public.profiles p
WHERE
  lower(trim(p.first_name)) LIKE '%emma%'
  AND lower(trim(p.last_name)) LIKE '%garcia%'
  OR (
    lower(trim(p.first_name)) LIKE '%georg%'
    AND lower(trim(p.last_name)) LIKE '%navarr%'
  )
  OR lower(trim(concat_ws(' ', p.first_name, p.last_name))) LIKE '%emma%garcia%'
  OR lower(trim(concat_ws(' ', p.first_name, p.last_name))) LIKE '%georg%navarr%'
ORDER BY p.email;

-- 2) TODOS sus paquetes (activos, agotados, vencidos) + reservas ligadas
SELECT
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
  p.email AS correo,
  pkg.name AS paquete,
  cp.created_at AT TIME ZONE 'America/Mexico_City' AS fecha_compra_cdmx,
  cp.expires_at AT TIME ZONE 'America/Mexico_City' AS vigente_hasta_cdmx,
  cp.classes_total AS clases_del_paquete,
  cp.classes_remaining AS clases_disponibles,
  (cp.classes_total - cp.classes_remaining) AS clases_usadas,
  cp.payment_status AS estado_pago,
  CASE
    WHEN cp.payment_status IS DISTINCT FROM 'succeeded' THEN 'pago no confirmado'
    WHEN cp.classes_remaining <= 0 THEN 'agotado'
    WHEN cp.expires_at IS NOT NULL AND cp.expires_at <= now() THEN 'vencido'
    ELSE 'activo (app)'
  END AS estado_paquete,
  cp.amount_paid AS monto_pagado,
  cp.stripe_payment_intent_id,
  cp.id AS id_compra_paquete,
  (
    SELECT count(*)
    FROM public.bookings_new b
    WHERE b.customer_package_id = cp.id
      AND b.status IS DISTINCT FROM 'cancelled'
  ) AS reservas_no_canceladas
FROM public.customer_packages cp
INNER JOIN public.profiles p ON p.id = cp.customer_id
INNER JOIN public.packages pkg ON pkg.id = cp.package_id
WHERE
  (
    lower(trim(p.first_name)) LIKE '%emma%'
    AND lower(trim(p.last_name)) LIKE '%garcia%'
  )
  OR (
    lower(trim(p.first_name)) LIKE '%georg%'
    AND lower(trim(p.last_name)) LIKE '%navarr%'
  )
ORDER BY p.email, cp.created_at DESC;

-- 3) Reservas recientes de esas personas (para ver si descontó paquete)
SELECT
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
  p.email,
  b.id AS reserva_id,
  b.status,
  b.created_at AT TIME ZONE 'America/Mexico_City' AS reserva_creada_cdmx,
  c.name AS clase,
  b.customer_package_id,
  b.package_credit_deducted,
  pay.payment_method,
  pay.amount
FROM public.bookings_new b
JOIN public.profiles p ON p.id = b.customer_id
LEFT JOIN public.schedules s ON s.id = b.schedule_id
LEFT JOIN public.classes c ON c.id = s.class_id
LEFT JOIN public.payments_new pay ON pay.booking_id = b.id
WHERE
  (
    lower(trim(p.first_name)) LIKE '%emma%'
    AND lower(trim(p.last_name)) LIKE '%garcia%'
  )
  OR (
    lower(trim(p.first_name)) LIKE '%georg%'
    AND lower(trim(p.last_name)) LIKE '%navarr%'
  )
ORDER BY b.created_at DESC
LIMIT 50;
