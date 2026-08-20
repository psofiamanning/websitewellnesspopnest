-- Nuevos usuarios (perfiles) — correo, nombre y fecha de alta
-- Supabase → SQL Editor → Run (corre una sección a la vez)
--
-- "Usuario" = fila en public.profiles. Se crea al registrarse (cuenta) o al
-- reservar/comprar por primera vez. auth_id IS NOT NULL = tiene cuenta con
-- contraseña; si es NULL, el perfil nació de una reserva o compra.

-- =============================================================================
-- 1) LOS 20 MÁS RECIENTES (lo más rápido para "¿cuál es el correo del nuevo?")
-- =============================================================================
SELECT
  p.email,
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
  p.phone,
  p.auth_id IS NOT NULL AS tiene_cuenta,
  p.created_at AT TIME ZONE 'America/Mexico_City' AS alta_cdmx
FROM public.profiles p
ORDER BY p.created_at DESC
LIMIT 20;

-- =============================================================================
-- 2) TODOS LOS NUEVOS DE LOS ÚLTIMOS N DÍAS (cambia el 7 por los días que quieras)
-- =============================================================================
SELECT
  p.email,
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
  p.phone,
  p.auth_id IS NOT NULL AS tiene_cuenta,
  p.created_at AT TIME ZONE 'America/Mexico_City' AS alta_cdmx,
  (SELECT count(*) FROM public.bookings_new b
     WHERE b.customer_id = p.id AND b.status IS DISTINCT FROM 'cancelled') AS reservas,
  (SELECT count(*) FROM public.customer_packages cp
     WHERE cp.customer_id = p.id) AS compras_paquete
FROM public.profiles p
WHERE p.created_at >= now() - interval '7 days'
ORDER BY p.created_at DESC;

-- =============================================================================
-- 3) NUEVOS DE ESTE MES (mes calendario, hora CDMX)
-- =============================================================================
SELECT
  p.email,
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
  p.created_at AT TIME ZONE 'America/Mexico_City' AS alta_cdmx
FROM public.profiles p
WHERE (p.created_at AT TIME ZONE 'America/Mexico_City')
      >= date_trunc('month', now() AT TIME ZONE 'America/Mexico_City')
ORDER BY p.created_at DESC;

-- =============================================================================
-- 4) BUSCAR EL CORREO DE ALGUIEN POR NOMBRE (cambia el texto entre %)
-- =============================================================================
SELECT
  p.email,
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
  p.phone,
  p.created_at AT TIME ZONE 'America/Mexico_City' AS alta_cdmx
FROM public.profiles p
WHERE lower(trim(concat_ws(' ', p.first_name, p.last_name))) LIKE lower('%maria%')
   OR lower(p.email) LIKE lower('%maria%')
ORDER BY p.created_at DESC;

-- =============================================================================
-- 5) ALTAS POR DÍA (últimos 30 días) — para ver el ritmo de registro
-- =============================================================================
SELECT
  (p.created_at AT TIME ZONE 'America/Mexico_City')::date AS dia_cdmx,
  count(*) AS nuevos,
  count(*) FILTER (WHERE p.auth_id IS NOT NULL) AS con_cuenta
FROM public.profiles p
WHERE p.created_at >= now() - interval '30 days'
GROUP BY 1
ORDER BY 1 DESC;

-- =============================================================================
-- 6) SOLO QUIENES CREARON CUENTA (registro con contraseña), últimos 30 días
--    Usa auth.users: útil para separar "se registró" de "solo reservó".
-- =============================================================================
SELECT
  u.email,
  trim(concat_ws(' ', p.first_name, p.last_name)) AS nombre,
  u.created_at AT TIME ZONE 'America/Mexico_City' AS cuenta_creada_cdmx,
  u.last_sign_in_at AT TIME ZONE 'America/Mexico_City' AS ultimo_acceso_cdmx,
  u.email_confirmed_at IS NOT NULL AS correo_confirmado
FROM auth.users u
LEFT JOIN public.profiles p ON p.auth_id = u.id
WHERE u.created_at >= now() - interval '30 days'
ORDER BY u.created_at DESC;

-- =============================================================================
-- 7) CORREOS DEL POPUP DE CLASE GRATIS (leads, no son clientes todavía)
-- =============================================================================
SELECT
  l.email,
  l.source,
  l.offer,
  l.created_at AT TIME ZONE 'America/Mexico_City' AS capturado_cdmx,
  EXISTS (SELECT 1 FROM public.profiles p WHERE lower(p.email) = lower(l.email)) AS ya_es_cliente
FROM public.lead_emails l
ORDER BY l.created_at DESC
LIMIT 50;
