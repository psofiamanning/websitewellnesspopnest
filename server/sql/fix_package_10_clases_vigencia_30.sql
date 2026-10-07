-- Paquete de 10 Clases: la vigencia correcta es 30 días (lo que anuncia el sitio).
-- La tabla tenía validity_days = 60. Solo afecta compras nuevas: las compras ya
-- hechas conservan su expires_at (al 2026-10-07 la única activa era una cuenta
-- de prueba). Para revertir: validity_days = 60.

UPDATE public.packages
SET validity_days = 30
WHERE name = 'Paquete de 10 Clases';

-- Verificación:
--  SELECT name, total_classes, price, validity_days FROM public.packages ORDER BY price;
