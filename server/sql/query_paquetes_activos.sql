-- Paquetes ACTIVOS por cliente (mismo criterio que la app / Railway)
-- Supabase → SQL Editor → Run
--
-- Activo = pago succeeded, classes_remaining > 0, no vencido (expires_at null o futuro)

SELECT
  p.email AS correo,
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
  p.phone AS telefono,
  pkg.name AS paquete,
  cp.created_at AT TIME ZONE 'America/Mexico_City' AS fecha_compra_cdmx,
  cp.expires_at AT TIME ZONE 'America/Mexico_City' AS vigente_hasta_cdmx,
  cp.classes_total AS clases_del_paquete,
  cp.classes_remaining AS clases_disponibles,
  (cp.classes_total - cp.classes_remaining) AS clases_usadas,
  cp.amount_paid AS monto_pagado,
  cp.payment_status AS estado_pago,
  cp.id AS id_compra_paquete
FROM public.customer_packages cp
INNER JOIN public.profiles p ON p.id = cp.customer_id
INNER JOIN public.packages pkg ON pkg.id = cp.package_id
WHERE cp.payment_status = 'succeeded'
  AND cp.classes_remaining > 0
  AND (cp.expires_at IS NULL OR cp.expires_at > now())
ORDER BY
  p.email,
  cp.created_at DESC;

-- Opcional: incluir conteo de reservas no canceladas ligadas a cada paquete
/*
SELECT
  p.email AS correo,
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
  pkg.name AS paquete,
  cp.created_at AT TIME ZONE 'America/Mexico_City' AS fecha_compra_cdmx,
  cp.classes_remaining AS clases_disponibles,
  cp.classes_total AS clases_del_paquete,
  COUNT(b.id) FILTER (WHERE b.status IS DISTINCT FROM 'cancelled') AS reservas_con_este_paquete
FROM public.customer_packages cp
INNER JOIN public.profiles p ON p.id = cp.customer_id
INNER JOIN public.packages pkg ON pkg.id = cp.package_id
LEFT JOIN public.bookings_new b ON b.customer_package_id = cp.id
WHERE cp.payment_status = 'succeeded'
  AND cp.classes_remaining > 0
  AND (cp.expires_at IS NULL OR cp.expires_at > now())
GROUP BY
  p.email, p.first_name, p.last_name, pkg.name,
  cp.created_at, cp.classes_remaining, cp.classes_total, cp.id
ORDER BY p.email, cp.created_at DESC;
*/

-- Ver TODOS los paquetes (activos + agotados + vencidos) de un correo:
-- WHERE lower(p.email) = lower('cliente@ejemplo.com')
