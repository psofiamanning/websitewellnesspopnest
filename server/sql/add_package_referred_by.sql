-- Ejecutar en Supabase → SQL Editor (una vez).
-- Guarda el nombre de la persona que refirió al cliente en la compra de paquete.

ALTER TABLE customer_packages
ADD COLUMN IF NOT EXISTS referred_by TEXT;

COMMENT ON COLUMN customer_packages.referred_by IS
  'Texto libre opcional: nombre de quien refirió al cliente (capturado en el checkout de paquete).';
