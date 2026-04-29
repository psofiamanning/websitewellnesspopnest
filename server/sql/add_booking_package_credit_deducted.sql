-- Ejecutar en Supabase → SQL Editor (una vez).
-- Indica si la reserva descontó una clase del saldo del paquete (necesario para cancelaciones correctas).

ALTER TABLE bookings_new
ADD COLUMN IF NOT EXISTS package_credit_deducted BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN bookings_new.package_credit_deducted IS
  'True si esta reserva restó classes_remaining del paquete. Las primeras 2 reservas del Paquete de 20 Clases van en false.';
