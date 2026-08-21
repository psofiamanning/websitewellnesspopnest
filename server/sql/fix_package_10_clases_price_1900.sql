-- El precio de "Paquete de 10 Clases" en la base de datos (packages.price) se había
-- quedado en $2,250 por una migración anterior (update_package_prices_250mxn.sql),
-- pero el frontend (src/data/packageOffers.js) — que es lo que realmente se le cobra
-- al cliente vía Stripe — siempre mostró $1,900. Confirmado 2026-08-21: $1,900 es el
-- precio correcto. Ya aplicado en producción manualmente; este archivo deja
-- constancia y sirve para volver a aplicarlo si hiciera falta.

UPDATE public.packages SET price = 1900 WHERE name = 'Paquete de 10 Clases';
