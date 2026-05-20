-- Intentos / compras de paquetes en Supabase (no muestra fallos que nunca llegaron a guardarse)
-- Para fallos de tarjeta ANTES de guardar → Stripe Dashboard (ver DEPLOY o guía en comentarios)

-- =============================================================================
-- 1) Todas las compras de paquete (éxito, pendiente, fallido en BD)
-- =============================================================================
SELECT
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
  p.email AS correo,
  pkg.name AS paquete,
  cp.created_at AT TIME ZONE 'America/Mexico_City' AS fecha_intento_compra,
  cp.payment_status AS estado_pago_bd,
  cp.amount_paid AS monto_centavos,
  round(cp.amount_paid::numeric / 100, 2) AS monto_mxn_aprox,
  cp.stripe_payment_intent_id AS stripe_pi,
  cp.classes_remaining AS clases_disponibles,
  cp.classes_total,
  cp.id AS id_compra_paquete
FROM public.customer_packages cp
JOIN public.profiles p ON p.id = cp.customer_id
JOIN public.packages pkg ON pkg.id = cp.package_id
ORDER BY cp.created_at DESC;

-- =============================================================================
-- 2) Solo problemáticas: pago NO succeeded (quedaron pendientes en BD)
-- =============================================================================
SELECT *
FROM (
  SELECT
    p.email,
    trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
    pkg.name AS paquete,
    cp.created_at AT TIME ZONE 'America/Mexico_City' AS fecha,
    cp.payment_status,
    cp.stripe_payment_intent_id,
    cp.classes_remaining,
    cp.id
  FROM public.customer_packages cp
  JOIN public.profiles p ON p.id = cp.customer_id
  JOIN public.packages pkg ON pkg.id = cp.package_id
) t
WHERE payment_status IS DISTINCT FROM 'succeeded'
ORDER BY fecha DESC;

-- =============================================================================
-- 3) Emma, Sandy, Georgina Navarrete — historial de compras de paquete
-- =============================================================================
SELECT
  p.email,
  pkg.name AS paquete,
  cp.created_at AT TIME ZONE 'America/Mexico_City' AS fecha_compra,
  cp.payment_status,
  cp.stripe_payment_intent_id,
  cp.classes_remaining,
  cp.expires_at AT TIME ZONE 'America/Mexico_City' AS vigente_hasta
FROM public.customer_packages cp
JOIN public.profiles p ON p.id = cp.customer_id
JOIN public.packages pkg ON pkg.id = cp.package_id
WHERE lower(p.email) IN (
  'mitorecagz@hotmail.com',
  'sandyapatrick@gmail.com',
  'giny.nag@gmail.com'
)
ORDER BY p.email, cp.created_at DESC;

-- =============================================================================
-- 4) Clientes con paquete AGOTADO que podrían estar intentando comprar otro
-- =============================================================================
SELECT
  p.email,
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
  count(*) FILTER (WHERE cp.payment_status = 'succeeded') AS compras_exitosas,
  count(*) FILTER (WHERE cp.payment_status IS DISTINCT FROM 'succeeded') AS compras_pendientes_fallidas_bd,
  sum(cp.classes_remaining) FILTER (WHERE cp.payment_status = 'succeeded') AS clases_disponibles_total
FROM public.customer_packages cp
JOIN public.profiles p ON p.id = cp.customer_id
WHERE lower(p.email) IN (
  'mitorecagz@hotmail.com',
  'sandyapatrick@gmail.com',
  'giny.nag@gmail.com'
)
GROUP BY p.email, p.first_name, p.last_name;
