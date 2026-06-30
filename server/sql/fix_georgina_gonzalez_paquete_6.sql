-- Georgina González · g.glez.2@gmail.com · customer_packages.id = 6
-- Ejecutar en Supabase → SQL Editor (revisar el SELECT antes del UPDATE)

-- 1) Estado actual
SELECT
  p.email,
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
  cp.id AS paquete_cliente_id,
  pkg.name AS paquete,
  cp.created_at AT TIME ZONE 'America/Mexico_City' AS compra,
  cp.expires_at AT TIME ZONE 'America/Mexico_City' AS vigente_hasta,
  cp.classes_total,
  cp.classes_remaining,
  cp.payment_status,
  cp.amount_paid
FROM public.customer_packages cp
JOIN public.profiles p ON p.id = cp.customer_id
JOIN public.packages pkg ON pkg.id = cp.package_id
WHERE cp.id = 6;

-- 2) Extender vigencia 30 días desde hoy
UPDATE public.customer_packages
SET
  expires_at = now() + interval '30 days',
  payment_status = 'succeeded'
WHERE id = 6
  AND customer_id = (
    SELECT id FROM public.profiles WHERE lower(email) = lower('g.glez.2@gmail.com') LIMIT 1
  );

-- 3) Marcar que las 5 reservas sí descontaron crédito (cancelaciones devuelven clase)
UPDATE public.bookings_new
SET package_credit_deducted = true
WHERE customer_package_id = 6
  AND payment_method = 'package'
  AND status IS DISTINCT FROM 'cancelled'
  AND coalesce(package_credit_deducted, false) = false;

-- 4) Verificación final
SELECT
  cp.expires_at AT TIME ZONE 'America/Mexico_City' AS vigente_hasta_nueva,
  cp.classes_remaining AS clases_disponibles,
  CASE
    WHEN cp.payment_status = 'succeeded'
      AND cp.classes_remaining > 0
      AND (cp.expires_at IS NULL OR cp.expires_at > now())
    THEN 'activo (puede reservar en la app)'
    ELSE 'revisar'
  END AS estado_app
FROM public.customer_packages cp
WHERE cp.id = 6;
