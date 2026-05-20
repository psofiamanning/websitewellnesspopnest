-- Créditos de clase otorgados por administración (sin Stripe, sin fecha fija).
-- Ejecutar una vez en Supabase → SQL Editor.

ALTER TABLE public.customer_packages
ADD COLUMN IF NOT EXISTS admin_granted boolean NOT NULL DEFAULT false;

ALTER TABLE public.customer_packages
ADD COLUMN IF NOT EXISTS admin_grant_note text;

COMMENT ON COLUMN public.customer_packages.admin_granted IS 'true = créditos dados por admin; el cliente reserva fecha/hora después';
COMMENT ON COLUMN public.customer_packages.admin_grant_note IS 'Nota interna opcional al otorgar créditos';

INSERT INTO public.packages (name, total_classes, price, validity_days, is_active)
SELECT 'Clases otorgadas — Administración', 1, 0, 365, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.packages WHERE name = 'Clases otorgadas — Administración'
);
