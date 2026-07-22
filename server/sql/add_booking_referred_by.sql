-- Ejecutar en Supabase → SQL Editor (una vez).
-- Guarda el nombre de la persona que refirió al cliente en la reserva.

ALTER TABLE bookings_new
ADD COLUMN IF NOT EXISTS referred_by TEXT;

COMMENT ON COLUMN bookings_new.referred_by IS
  'Texto libre opcional: nombre de quien refirió al cliente (capturado en el checkout de clase/coach).';
