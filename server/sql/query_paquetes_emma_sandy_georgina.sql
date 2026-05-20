-- Estado actual de paquetes: Emma García, Sandy Barrera, Georgina Navarrete
-- Supabase → SQL Editor → Run

-- =============================================================================
-- A) RESUMEN DE PAQUETES (compra, vigencia, saldo, estado)
-- =============================================================================
SELECT
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
  p.email AS correo,
  pkg.name AS paquete,
  cp.created_at AT TIME ZONE 'America/Mexico_City' AS fecha_compra,
  cp.expires_at AT TIME ZONE 'America/Mexico_City' AS vigente_hasta,
  cp.classes_total AS clases_paquete,
  cp.classes_remaining AS clases_disponibles,
  (cp.classes_total - cp.classes_remaining) AS clases_usadas_en_saldo,
  cp.payment_status AS estado_pago,
  cp.amount_paid AS monto_pagado,
  CASE
    WHEN cp.payment_status IS DISTINCT FROM 'succeeded' THEN 'pago no confirmado'
    WHEN cp.classes_remaining <= 0 THEN 'agotado'
    WHEN cp.expires_at IS NOT NULL AND cp.expires_at <= now() THEN 'vencido'
    ELSE 'activo (puede reservar con paquete)'
  END AS estado_paquete,
  cp.id AS id_compra_paquete
FROM public.customer_packages cp
JOIN public.profiles p ON p.id = cp.customer_id
JOIN public.packages pkg ON pkg.id = cp.package_id
WHERE lower(p.email) IN (
  'mitorecagz@hotmail.com',   -- Emma García
  'sandyapatrick@gmail.com',  -- Sandy Barrera
  'giny.nag@gmail.com'        -- Georgina Navarrete
)
ORDER BY p.last_name, cp.created_at DESC;

-- =============================================================================
-- B) RESERVAS CON PAQUETE (días que usaron clases)
-- =============================================================================
SELECT
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
  p.email,
  cp.id AS id_paquete,
  s.scheduled_date AS dia_clase,
  s.scheduled_time AS hora,
  c.name AS clase,
  b.status,
  b.payment_method,
  b.package_credit_deducted
FROM public.bookings_new b
JOIN public.profiles p ON p.id = b.customer_id
LEFT JOIN public.customer_packages cp ON cp.id = b.customer_package_id
LEFT JOIN public.schedules s ON s.id = b.schedule_id
LEFT JOIN public.classes c ON c.id = s.class_id
WHERE lower(p.email) IN (
  'mitorecagz@hotmail.com',
  'sandyapatrick@gmail.com',
  'giny.nag@gmail.com'
)
  AND b.status IS DISTINCT FROM 'cancelled'
  AND (b.payment_method = 'package' OR b.customer_package_id IS NOT NULL)
ORDER BY p.email, s.scheduled_date, s.scheduled_time;

-- =============================================================================
-- C) CONTEO: reservas con paquete vs saldo (detectar descuadres)
-- =============================================================================
SELECT
  p.email,
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
  cp.id AS id_paquete,
  cp.classes_remaining AS disponibles_bd,
  count(b.id) FILTER (
    WHERE b.status IS DISTINCT FROM 'cancelled'
      AND b.customer_package_id = cp.id
  ) AS reservas_ligadas_al_paquete,
  cp.classes_total - cp.classes_remaining AS usadas_según_saldo
FROM public.customer_packages cp
JOIN public.profiles p ON p.id = cp.customer_id
LEFT JOIN public.bookings_new b ON b.customer_package_id = cp.id
WHERE lower(p.email) IN (
  'mitorecagz@hotmail.com',
  'sandyapatrick@gmail.com',
  'giny.nag@gmail.com'
)
GROUP BY p.email, p.first_name, p.last_name, cp.id, cp.classes_remaining, cp.classes_total
ORDER BY p.email;
