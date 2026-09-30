-- Detalle de TODOS los pagos de septiembre 2026, con cliente y correo
-- (Supabase → SQL Editor → Run)
--
-- Una fila por pago: fecha (hora CDMX), tipo, concepto, cliente, correo, monto.
-- Solo cobros exitosos y con monto > 0. Rango: 1 sep 00:00 → 1 oct 00:00 (CDMX).
-- Unidades: payments_new.amount y customer_packages.amount_paid están en CENTAVOS (/100);
--           taller_bookings.amount_paid y salon_bookings.total_amount ya están en MXN.
-- Al final hay un total general (fila "TOTAL").

WITH pagos AS (
  -- Clases sueltas (pagos que no pertenecen a un paquete)
  SELECT
    pay.created_at                                   AS fecha,
    'Clase suelta'::text                             AS tipo,
    'Clase suelta'::text                             AS concepto,
    trim(concat_ws(' ', p.first_name, p.last_name))  AS cliente,
    p.email                                          AS correo,
    round(pay.amount::numeric / 100, 2)              AS monto_mxn,
    pay.stripe_payment_intent_id                     AS stripe_id
  FROM public.payments_new pay
  LEFT JOIN public.profiles p ON p.id = pay.customer_id
  WHERE pay.status = 'succeeded'
    AND pay.customer_package_id IS NULL
    AND pay.amount > 0

  UNION ALL

  -- Paquetes
  SELECT
    cp.created_at,
    'Paquete',
    coalesce(pkg.name, 'Paquete'),
    trim(concat_ws(' ', p.first_name, p.last_name)),
    p.email,
    round(cp.amount_paid::numeric / 100, 2),
    cp.stripe_payment_intent_id
  FROM public.customer_packages cp
  LEFT JOIN public.profiles p   ON p.id = cp.customer_id
  LEFT JOIN public.packages pkg ON pkg.id = cp.package_id
  WHERE cp.payment_status = 'succeeded'
    AND cp.amount_paid > 0

  UNION ALL

  -- Talleres
  SELECT
    tb.created_at,
    'Taller',
    'Taller',
    tb.customer_name,
    tb.customer_email,
    round(tb.amount_paid::numeric, 2),
    tb.stripe_payment_intent_id
  FROM public.taller_bookings tb
  WHERE tb.payment_status IN ('succeeded', 'paid')
    AND tb.amount_paid > 0

  UNION ALL

  -- Renta de salón
  SELECT
    coalesce(sb.paid_at, sb.created_at),
    'Renta de salón',
    'Renta de salón',
    sb.customer_name,
    sb.customer_email,
    round(sb.total_amount::numeric, 2),
    sb.stripe_payment_intent_id
  FROM public.salon_bookings sb
  WHERE sb.status = 'paid'
),
sept AS (
  SELECT *
  FROM pagos
  WHERE fecha >= timestamp with time zone '2026-09-01 00:00 America/Mexico_City'
    AND fecha <  timestamp with time zone '2026-10-01 00:00 America/Mexico_City'
)
SELECT fecha_cdmx, tipo, concepto, cliente, correo, monto_mxn, stripe_id
FROM (
  SELECT
    0 AS orden,
    to_char(fecha AT TIME ZONE 'America/Mexico_City', 'YYYY-MM-DD HH24:MI') AS fecha_cdmx,
    tipo, concepto, cliente, correo, monto_mxn, stripe_id
  FROM sept

  UNION ALL

  SELECT
    1, 'TOTAL', NULL, count(*)::text || ' pagos', NULL, NULL, sum(monto_mxn), NULL
  FROM sept
) t
ORDER BY orden, fecha_cdmx;
