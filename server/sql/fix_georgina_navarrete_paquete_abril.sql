-- Georgina Navarrete · giny.nag@gmail.com · profile bb0f5574-317d-4d6b-b479-9a830eaa3d9a
-- Pago Stripe 21 abr 2026 · pi_3TOluzA0gqRxLoT30jgQijDj · $1,800 MXN
--
-- ERROR al INSERT: unique (customer_id, package_id) — solo 1 fila por "Paquete de 10" por persona.
-- Solución: paso A quitar restricción → paso B insertar 2.º paquete (id 3 queda el 1.º agotado).

-- =============================================================================
-- PASO A — Una sola vez: quitar AMBAS restricciones (si falta una, INSERT sigue fallando)
-- =============================================================================
ALTER TABLE public.customer_packages
DROP CONSTRAINT IF EXISTS customer_packages_customer_id_package_id_key;

ALTER TABLE public.customer_packages
DROP CONSTRAINT IF EXISTS customer_packages_unique_active;

DROP INDEX IF EXISTS public.customer_packages_unique_active;

-- =============================================================================
-- PASO B — Insertar 2.º paquete (después del paso A)
-- =============================================================================
INSERT INTO public.customer_packages (
  customer_id,
  package_id,
  classes_remaining,
  classes_total,
  payment_status,
  amount_paid,
  stripe_payment_intent_id,
  expires_at,
  created_at
)
SELECT
  p.id,
  pkg.id,
  pkg.total_classes,
  pkg.total_classes,
  'succeeded',
  180000,
  'pi_3TOluzA0gqRxLoT30jgQijDj',
  timestamptz '2026-04-21 15:33:00-06' + interval '60 days',
  timestamptz '2026-04-21 15:33:00-06'
FROM public.profiles p
CROSS JOIN public.packages pkg
WHERE lower(p.email) = 'giny.nag@gmail.com'
  AND pkg.name = 'Paquete de 10 Clases'
  AND NOT EXISTS (
    SELECT 1
    FROM public.customer_packages cp
    WHERE cp.stripe_payment_intent_id = 'pi_3TOluzA0gqRxLoT30jgQijDj'
  )
RETURNING id, classes_remaining, expires_at, stripe_payment_intent_id;

-- =============================================================================
-- ALTERNATIVA rápida (sin 2 filas en historial): solo recargar el paquete id 3
-- Usar solo si NO puedes ejecutar el paso A
-- =============================================================================
/*
UPDATE public.customer_packages
SET
  classes_remaining = 10,
  payment_status = 'succeeded',
  amount_paid = 180000,
  stripe_payment_intent_id = 'pi_3TOluzA0gqRxLoT30jgQijDj',
  expires_at = greatest(coalesce(expires_at, now()), now()) + interval '60 days'
WHERE id = 3
  AND customer_id = 'bb0f5574-317d-4d6b-b479-9a830eaa3d9a';
*/

-- =============================================================================
-- Verificación — deben ser 2 filas; una con 0 y otra con 10 clases
-- =============================================================================
SELECT
  cp.id,
  cp.created_at AT TIME ZONE 'America/Mexico_City' AS fecha,
  cp.classes_remaining,
  cp.stripe_payment_intent_id,
  pkg.name
FROM public.customer_packages cp
JOIN public.profiles p ON p.id = cp.customer_id
JOIN public.packages pkg ON pkg.id = cp.package_id
WHERE lower(p.email) = 'giny.nag@gmail.com'
ORDER BY cp.created_at;
