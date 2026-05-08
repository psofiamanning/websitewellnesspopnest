-- Actualizar precios de paquetes alineados con clase individual $250 MXN.
-- Ejecutar en Supabase → SQL Editor si ya tienes filas en `packages`.

UPDATE packages SET price = 2250 WHERE name = 'Paquete de 10 Clases';
UPDATE packages SET price = 4500 WHERE name = 'Paquete de 20 Clases';
