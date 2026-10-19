-- Personas que COMPRARON paquete o clase suelta en SEPTIEMBRE y OCTUBRE 2026
-- (Supabase → SQL Editor → Run). Exportable a CSV.
--
-- Solo cobros exitosos (succeeded) con monto > 0 (excluye créditos gratis de administración).
-- Rango: 1 sep 00:00 → 1 nov 00:00, hora CDMX.
-- Montos: payments_new.amount y customer_packages.amount_paid están en CENTAVOS (/100).

-- =============================================================================
-- UNA FILA POR COMPRA: nombre, apellido, email, qué compró, fecha, monto
-- y la fecha de la última compra de esa persona
-- =============================================================================
WITH compras AS (
  -- Paquetes
  SELECT
    cp.customer_id,
    cp.created_at                            AS fecha,
    'Paquete: ' || coalesce(pkg.name, '—')   AS compra,
    round(cp.amount_paid::numeric / 100, 2)  AS monto_mxn
  FROM public.customer_packages cp
  LEFT JOIN public.packages pkg ON pkg.id = cp.package_id
  WHERE cp.payment_status = 'succeeded'
    AND cp.amount_paid > 0   -- excluye créditos gratis de administración

  UNION ALL

  -- Clases sueltas (pagos que no pertenecen a un paquete)
  SELECT
    pay.customer_id,
    pay.created_at,
    'Clase: ' || coalesce(cls.name, 'Clase suelta'),
    round(pay.amount::numeric / 100, 2)
  FROM public.payments_new pay
  LEFT JOIN public.bookings_new b ON b.id = pay.booking_id
  LEFT JOIN public.schedules sch  ON sch.id = b.schedule_id
  LEFT JOIN public.classes cls    ON cls.id = sch.class_id
  WHERE pay.status = 'succeeded'
    AND pay.customer_package_id IS NULL
    AND pay.amount > 0
)
SELECT
  p.first_name                                                               AS nombre,
  p.last_name                                                                AS apellido,
  p.email                                                                    AS email,
  c.compra                                                                   AS que_compro,
  to_char(c.fecha AT TIME ZONE 'America/Mexico_City', 'YYYY-MM-DD HH24:MI')  AS fecha_compra,
  c.monto_mxn                                                                AS monto_mxn,
  to_char(max(c.fecha) OVER (PARTITION BY c.customer_id)
          AT TIME ZONE 'America/Mexico_City', 'YYYY-MM-DD')                  AS ultima_compra
FROM compras c
JOIN public.profiles p ON p.id = c.customer_id
WHERE c.fecha >= timestamptz '2026-09-01 00:00 America/Mexico_City'
  AND c.fecha <  timestamptz '2026-11-01 00:00 America/Mexico_City'
ORDER BY p.first_name, p.last_name, c.fecha;
