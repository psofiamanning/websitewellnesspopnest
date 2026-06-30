-- Compras de los ÚLTIMOS 30 DÍAS: clases sueltas + paquetes
-- Supabase → SQL Editor → Run
--
-- Clase suelta = pago en payments_new ligado a bookings_new (method = 'card', etc.)
-- Paquete      = fila en customer_packages
-- Montos: payments_new.amount y customer_packages.amount_paid están en CENTAVOS → /100 = MXN

-- =============================================================================
-- 1) VISTA UNIFICADA: clases sueltas + paquetes de los últimos 30 días
-- =============================================================================
WITH compras AS (
  -- Clases sueltas (un pago por reserva)
  SELECT
    pay.created_at                                   AS fecha,
    'Clase suelta'::text                             AS tipo,
    cls.name                                         AS concepto,
    p.email                                          AS correo,
    trim(concat_ws(' ', p.first_name, p.last_name))  AS nombre,
    pay.method                                       AS metodo,
    pay.status                                       AS estado_pago,
    round(pay.amount::numeric / 100, 2)              AS monto_mxn,
    pay.stripe_payment_intent_id                     AS stripe_pi
  FROM public.payments_new pay
  JOIN public.profiles p   ON p.id = pay.customer_id
  LEFT JOIN public.bookings_new b ON b.id = pay.booking_id
  LEFT JOIN public.schedules sch  ON sch.id = b.schedule_id
  LEFT JOIN public.classes cls    ON cls.id = sch.class_id
  WHERE pay.created_at >= now() - interval '30 days'
    AND pay.customer_package_id IS NULL   -- excluir el pago que pertenece a un paquete

  UNION ALL

  -- Paquetes
  SELECT
    cp.created_at                                    AS fecha,
    'Paquete'::text                                  AS tipo,
    pkg.name                                         AS concepto,
    p.email                                          AS correo,
    trim(concat_ws(' ', p.first_name, p.last_name))  AS nombre,
    'package'::text                                  AS metodo,
    cp.payment_status                                AS estado_pago,
    round(cp.amount_paid::numeric / 100, 2)          AS monto_mxn,
    cp.stripe_payment_intent_id                      AS stripe_pi
  FROM public.customer_packages cp
  JOIN public.profiles p  ON p.id = cp.customer_id
  JOIN public.packages pkg ON pkg.id = cp.package_id
  WHERE cp.created_at >= now() - interval '30 days'
)
SELECT
  fecha AT TIME ZONE 'America/Mexico_City' AS fecha_cdmx,
  tipo,
  concepto,
  nombre,
  correo,
  metodo,
  estado_pago,
  monto_mxn,
  stripe_pi
FROM compras
ORDER BY fecha DESC;

-- =============================================================================
-- 2) RESUMEN: totales por tipo (solo pagos exitosos) en los últimos 30 días
-- =============================================================================
WITH compras AS (
  SELECT 'Clase suelta'::text AS tipo, pay.status AS estado_pago,
         round(pay.amount::numeric / 100, 2) AS monto_mxn
  FROM public.payments_new pay
  WHERE pay.created_at >= now() - interval '30 days'
    AND pay.customer_package_id IS NULL
  UNION ALL
  SELECT 'Paquete'::text AS tipo, cp.payment_status AS estado_pago,
         round(cp.amount_paid::numeric / 100, 2) AS monto_mxn
  FROM public.customer_packages cp
  WHERE cp.created_at >= now() - interval '30 days'
)
SELECT
  tipo,
  count(*) FILTER (WHERE estado_pago = 'succeeded')                 AS compras_exitosas,
  count(*) FILTER (WHERE estado_pago IS DISTINCT FROM 'succeeded')  AS pendientes_o_fallidas,
  sum(monto_mxn) FILTER (WHERE estado_pago = 'succeeded')           AS ingreso_mxn
FROM compras
GROUP BY tipo
ORDER BY tipo;