-- Listado de TODOS los clientes (profiles) + resumen de paquetes y reservas
-- Supabase → SQL Editor → Run (sección por sección o todo el archivo)
--
-- Nota: hay al menos 2 personas distintas llamadas Georgina:
--   · Georgina Navarrete  → giny.nag@gmail.com
--   · Georgina González   → g.glez.2@gmail.com
-- (mismo nombre de pila, distinto apellido y correo → perfiles UUID distintos)

-- =============================================================================
-- 1) TODOS LOS CLIENTES (orden alfabético por nombre)
-- =============================================================================
SELECT
  p.id AS profile_id,
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre_completo,
  p.first_name,
  p.last_name,
  p.email,
  p.phone,
  p.auth_id IS NOT NULL AS tiene_cuenta_auth,
  p.created_at AT TIME ZONE 'America/Mexico_City' AS alta_perfil_cdmx,
  (
    SELECT count(*)
    FROM public.customer_packages cp
    WHERE cp.customer_id = p.id
  ) AS total_compras_paquete,
  (
    SELECT count(*)
    FROM public.bookings_new b
    WHERE b.customer_id = p.id
      AND b.status IS DISTINCT FROM 'cancelled'
  ) AS reservas_activas
FROM public.profiles p
ORDER BY
  lower(coalesce(p.last_name, '')),
  lower(coalesce(p.first_name, '')),
  lower(p.email);

-- =============================================================================
-- 2) SOLO GEORGINA (cualquier variante de nombre o correo)
-- =============================================================================
SELECT
  p.id AS profile_id,
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre_completo,
  p.email,
  p.phone,
  p.created_at AT TIME ZONE 'America/Mexico_City' AS alta_perfil_cdmx,
  CASE
    WHEN lower(p.email) = 'giny.nag@gmail.com' THEN 'Georgina Navarrete (referencia proyecto)'
    WHEN lower(p.email) = 'g.glez.2@gmail.com' THEN 'Georgina González (referencia proyecto)'
    ELSE 'otra coincidencia — revisar'
  END AS nota
FROM public.profiles p
WHERE
  lower(coalesce(p.first_name, '')) LIKE '%georg%'
  OR lower(coalesce(p.last_name, '')) LIKE '%georg%'
  OR lower(coalesce(p.first_name, '')) LIKE '%gina%'
  OR lower(trim(concat_ws(' ', p.first_name, p.last_name))) LIKE '%georgina%'
  OR lower(p.email) LIKE '%georg%'
  OR lower(p.email) LIKE '%giny%'
  OR lower(p.email) LIKE '%g.glez%'
ORDER BY p.email;

-- =============================================================================
-- 3) PAQUETES POR CLIENTE (todas las compras, no solo activos)
-- =============================================================================
SELECT
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
  p.email,
  p.id AS profile_id,
  pkg.name AS paquete,
  cp.id AS id_compra_paquete,
  cp.created_at AT TIME ZONE 'America/Mexico_City' AS fecha_compra_cdmx,
  cp.expires_at AT TIME ZONE 'America/Mexico_City' AS vigente_hasta_cdmx,
  cp.classes_total,
  cp.classes_remaining,
  cp.payment_status,
  cp.amount_paid,
  CASE
    WHEN cp.payment_status IS DISTINCT FROM 'succeeded' THEN 'pago no confirmado'
    WHEN cp.classes_remaining <= 0 THEN 'agotado'
    WHEN cp.expires_at IS NOT NULL AND cp.expires_at <= now() THEN 'vencido'
    ELSE 'activo'
  END AS estado_paquete
FROM public.customer_packages cp
JOIN public.profiles p ON p.id = cp.customer_id
JOIN public.packages pkg ON pkg.id = cp.package_id
ORDER BY p.last_name, p.first_name, cp.created_at DESC;

-- =============================================================================
-- 4) GEORGINAS — detalle de paquetes + reservas (para no mezclar personas)
-- =============================================================================
SELECT
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
  p.email,
  p.id AS profile_id,
  pkg.name AS paquete,
  cp.id AS id_compra_paquete,
  cp.classes_remaining,
  cp.classes_total,
  cp.payment_status,
  cp.expires_at AT TIME ZONE 'America/Mexico_City' AS vigente_hasta_cdmx
FROM public.customer_packages cp
JOIN public.profiles p ON p.id = cp.customer_id
JOIN public.packages pkg ON pkg.id = cp.package_id
WHERE lower(coalesce(p.first_name, '')) LIKE '%georg%'
   OR lower(p.email) IN ('giny.nag@gmail.com', 'g.glez.2@gmail.com')
ORDER BY p.email, cp.created_at DESC;

SELECT
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
  p.email,
  b.id AS reserva_id,
  b.status,
  b.payment_method,
  b.customer_package_id,
  b.package_credit_deducted,
  s.scheduled_date AS dia,
  s.scheduled_time AS hora,
  c.name AS clase,
  b.created_at AT TIME ZONE 'America/Mexico_City' AS reserva_creada_cdmx
FROM public.bookings_new b
JOIN public.profiles p ON p.id = b.customer_id
LEFT JOIN public.schedules s ON s.id = b.schedule_id
LEFT JOIN public.classes c ON c.id = s.class_id
WHERE lower(coalesce(p.first_name, '')) LIKE '%georg%'
   OR lower(p.email) IN ('giny.nag@gmail.com', 'g.glez.2@gmail.com')
ORDER BY p.email, s.scheduled_date DESC NULLS LAST, b.created_at DESC
LIMIT 100;

-- =============================================================================
-- 5) DUPLICADOS SOSPECHOSOS (mismo correo o mismo nombre completo)
-- =============================================================================
-- Mismo email en más de un perfil (no debería pasar)
SELECT
  lower(trim(p.email)) AS email_normalizado,
  count(*) AS perfiles_con_ese_email,
  array_agg(p.id ORDER BY p.created_at) AS profile_ids,
  array_agg(trim(concat_ws(' ', p.first_name, p.last_name)) ORDER BY p.created_at) AS nombres
FROM public.profiles p
WHERE p.email IS NOT NULL AND trim(p.email) <> ''
GROUP BY lower(trim(p.email))
HAVING count(*) > 1;

-- Mismo nombre (apellido + nombre) con correos distintos — revisar a mano
SELECT
  lower(trim(concat_ws(' ', p.first_name, p.last_name))) AS nombre_normalizado,
  count(DISTINCT lower(trim(p.email))) AS correos_distintos,
  count(*) AS perfiles,
  array_agg(DISTINCT p.email) AS emails,
  array_agg(p.id) AS profile_ids
FROM public.profiles p
WHERE coalesce(trim(p.first_name), '') <> ''
GROUP BY lower(trim(concat_ws(' ', p.first_name, p.last_name)))
HAVING count(*) > 1
ORDER BY perfiles DESC, nombre_normalizado;
