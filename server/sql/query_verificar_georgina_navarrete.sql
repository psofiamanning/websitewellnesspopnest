-- Verificar créditos otorgados a Georgina Navarrete
-- Supabase → SQL Editor → Run
--
-- Correo de referencia en el proyecto: giny.nag@gmail.com
-- (No confundir con Georgina González → g.glez.2@gmail.com)

-- =============================================================================
-- 1) Perfil (debe existir 1 fila)
-- =============================================================================
SELECT
  p.id AS profile_id,
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
  p.email,
  p.phone,
  p.auth_id IS NOT NULL AS tiene_login,
  p.created_at AT TIME ZONE 'America/Mexico_City' AS alta_cdmx
FROM public.profiles p
WHERE lower(p.email) = lower('giny.nag@gmail.com');

-- =============================================================================
-- 2) Créditos otorgados por admin (lo que guarda el panel)
--    Paquete catálogo: «Clases otorgadas — Administración»
-- =============================================================================
SELECT
  cp.id AS id_compra,
  pkg.name AS paquete,
  cp.admin_granted,
  cp.admin_grant_note AS nota_admin,
  cp.classes_total,
  cp.classes_remaining AS clases_disponibles,
  (cp.classes_total - cp.classes_remaining) AS clases_usadas,
  cp.payment_status,
  cp.amount_paid,
  cp.created_at AT TIME ZONE 'America/Mexico_City' AS otorgado_cdmx,
  cp.expires_at AT TIME ZONE 'America/Mexico_City' AS vigente_hasta_cdmx,
  CASE
    WHEN cp.payment_status IS DISTINCT FROM 'succeeded' THEN 'NO visible en app'
    WHEN cp.classes_remaining <= 0 THEN 'agotado'
    WHEN cp.expires_at IS NOT NULL AND cp.expires_at <= now() THEN 'vencido'
    ELSE 'ACTIVO — la app debe mostrar estas clases al reservar'
  END AS estado_en_app
FROM public.customer_packages cp
JOIN public.profiles p ON p.id = cp.customer_id
JOIN public.packages pkg ON pkg.id = cp.package_id
WHERE lower(p.email) = lower('giny.nag@gmail.com')
  AND (
    cp.admin_granted = true
    OR pkg.name = 'Clases otorgadas — Administración'
  )
ORDER BY cp.created_at DESC;

-- =============================================================================
-- 3) Resumen como lo ve la API (suma de clases activas)
-- =============================================================================
SELECT
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
  p.email,
  sum(cp.classes_remaining) FILTER (
    WHERE cp.payment_status = 'succeeded'
      AND cp.classes_remaining > 0
      AND (cp.expires_at IS NULL OR cp.expires_at > now())
  ) AS total_clases_disponibles_activas,
  count(*) FILTER (
    WHERE cp.payment_status = 'succeeded'
      AND cp.classes_remaining > 0
      AND (cp.expires_at IS NULL OR cp.expires_at > now())
  ) AS filas_paquete_activas
FROM public.profiles p
LEFT JOIN public.customer_packages cp ON cp.customer_id = p.id
WHERE lower(p.email) = lower('giny.nag@gmail.com')
GROUP BY p.id, p.first_name, p.last_name, p.email;

-- =============================================================================
-- 4) TODOS sus paquetes (Stripe + admin) por si hay más de uno
-- =============================================================================
SELECT
  pkg.name AS paquete,
  cp.admin_granted,
  cp.classes_remaining,
  cp.classes_total,
  cp.payment_status,
  cp.expires_at AT TIME ZONE 'America/Mexico_City' AS vigente_hasta_cdmx,
  cp.created_at AT TIME ZONE 'America/Mexico_City' AS creado_cdmx,
  cp.id AS id_compra
FROM public.customer_packages cp
JOIN public.profiles p ON p.id = cp.customer_id
JOIN public.packages pkg ON pkg.id = cp.package_id
WHERE lower(p.email) = lower('giny.nag@gmail.com')
ORDER BY cp.created_at DESC;

-- =============================================================================
-- 5) ¿Aparece en el listado global de paquetes activos del estudio?
-- =============================================================================
SELECT *
FROM (
  SELECT
    p.email AS correo,
    trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
    pkg.name AS paquete,
    cp.classes_remaining AS clases_disponibles,
    cp.admin_granted,
    cp.id AS id_compra_paquete
  FROM public.customer_packages cp
  INNER JOIN public.profiles p ON p.id = cp.customer_id
  INNER JOIN public.packages pkg ON pkg.id = cp.package_id
  WHERE cp.payment_status = 'succeeded'
    AND cp.classes_remaining > 0
    AND (cp.expires_at IS NULL OR cp.expires_at > now())
) activos
WHERE lower(correo) = lower('giny.nag@gmail.com');
