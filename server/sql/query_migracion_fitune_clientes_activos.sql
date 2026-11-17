-- Migración a Fitune (1 de diciembre de 2026): clientes que hay que pasar a mano.
-- Supabase → SQL Editor → Run. SOLO LECTURA: no modifica nada.
--
-- Corre cada bloque por separado y exporta a CSV.
-- Conviene correrlo de nuevo el 30 de noviembre en la noche: hasta esa fecha se puede seguir comprando y reservando en popnest.app.

-- =============================================================================
-- 1) PAQUETES VIGENTES: clases que le quedan a cada cliente al 1 de diciembre
--    (pagados, sin vencer y con saldo, o ilimitados sin vencer).
-- =============================================================================
SELECT
  trim(concat_ws(' ', p.first_name, p.last_name))       AS nombre,
  p.email                                               AS correo,
  p.phone                                               AS telefono,
  pkg.name                                              AS paquete,
  cp.classes_remaining                                  AS clases_restantes,
  (cp.created_at AT TIME ZONE 'America/Mexico_City')::date AS comprado_el,
  (cp.expires_at AT TIME ZONE 'America/Mexico_City')::date AS vence_el,
  cp.id                                                 AS customer_package_id
FROM public.customer_packages cp
JOIN public.profiles p   ON p.id = cp.customer_id
JOIN public.packages pkg ON pkg.id = cp.package_id
WHERE cp.payment_status = 'succeeded'
  AND (cp.expires_at IS NULL OR cp.expires_at >= '2026-12-01T00:00:00-06:00')
  AND (cp.classes_remaining > 0 OR pkg.name ILIKE '%ilimitad%')
ORDER BY vence_el, nombre;

-- =============================================================================
-- 2) RESERVAS DEL 1 DE DICIEMBRE EN ADELANTE hechas en popnest.app
--    (hay que recrearlas en Fitune para que el cupo y la lista de la coach cuadren).
-- =============================================================================
SELECT
  sch.scheduled_date                                    AS fecha,
  sch.scheduled_time                                    AS hora,
  cls.name                                              AS clase,
  t.full_name                                           AS coach,
  trim(concat_ws(' ', p.first_name, p.last_name))       AS nombre,
  p.email                                               AS correo,
  p.phone                                               AS telefono,
  b.status                                              AS estado,
  CASE WHEN b.customer_package_id IS NULL THEN 'Clase suelta' ELSE 'Paquete' END AS pagada_con,
  b.id                                                  AS booking_id
FROM public.bookings_new b
JOIN public.schedules sch ON sch.id = b.schedule_id
JOIN public.classes cls   ON cls.id = sch.class_id
LEFT JOIN public.teachers t ON t.id = sch.teacher_id
JOIN public.profiles p    ON p.id = b.customer_id
WHERE sch.scheduled_date >= DATE '2026-12-01'
  AND b.status <> 'cancelled'
ORDER BY fecha, hora, nombre;
