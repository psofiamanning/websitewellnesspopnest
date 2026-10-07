-- Ilimitado Mensual: precio de $2,990 a $1,800 MXN (2026-10-07).
-- El servidor valida el monto de Stripe contra packages.price, así que este
-- cambio debe ir junto con el deploy del frontend (src/data/packageOffers.js).
-- Compras anteriores no cambian (amount_paid queda como se cobró).
-- Para revertir: price = 2990.

UPDATE public.packages
SET price = 1800
WHERE name = 'Ilimitado Mensual';

-- Verificación:
--  SELECT name, price, validity_days FROM public.packages WHERE name = 'Ilimitado Mensual';
