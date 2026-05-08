-- Ventana de publicación de cada fila en `schedules` (sin borrar historial).
-- NULL = sin límite en ese extremo (compatible con datos existentes).
-- Nueva reserva: el backend solo considera slots con status = 'active' y
--   scheduled_date dentro de [valid_from, valid_until] cuando esas columnas no son NULL.

ALTER TABLE public.schedules
  ADD COLUMN IF NOT EXISTS valid_from date,
  ADD COLUMN IF NOT EXISTS valid_until date;

COMMENT ON COLUMN public.schedules.valid_from IS
  'Primera fecha en la que este slot acepta reservas nuevas (inclusive). NULL = sin límite inferior.';
COMMENT ON COLUMN public.schedules.valid_until IS
  'Última fecha en la que este slot acepta reservas nuevas (inclusive). NULL = sin límite superior.';
