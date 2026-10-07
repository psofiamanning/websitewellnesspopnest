-- Hatha Yoga (Blanca Bear): jueves 19:00 -> jueves 08:30, desde el jueves 2026-10-08.
-- Es un reemplazo (confirmado: "en lugar de 7pm"). Domingo 08:00 no cambia.
-- No borra filas. Al 2026-10-06 no había reservas en ningún jueves 19:00 futuro.
-- status = 'inactive' porque findScheduleBySlot empata por clase + fecha + hora.
-- Para revertir: status = 'active', valid_until = NULL en las filas del paso 1.

BEGIN;

-- 1) Retirar Hatha Yoga jueves 19:00.
UPDATE public.schedules s
SET status = 'inactive',
    valid_until = DATE '2026-10-07'
FROM public.classes c, public.teachers t
WHERE s.class_id = c.id
  AND s.teacher_id = t.id
  AND c.name = 'Hatha Yoga'
  AND t.full_name = 'Blanca Bear'
  AND s.scheduled_time = '19:00:00'
  AND extract(isodow FROM s.scheduled_date)::int = 4
  AND s.scheduled_date >= DATE '2026-10-08'
  AND s.status = 'active';

-- 2) Alta de Hatha Yoga jueves 08:30 (próximos 180 días, 10 lugares). Idempotente.
WITH thursdays AS (
  SELECT d::date AS scheduled_date
  FROM generate_series(current_date, current_date + interval '180 days', interval '1 day') g(d)
  WHERE extract(isodow FROM d)::int = 4
)
INSERT INTO public.schedules
  (class_id, teacher_id, scheduled_date, scheduled_time, status, spots_total, spots_available)
SELECT c.id, t.id, th.scheduled_date, '08:30'::time, 'active', 10, 10
FROM thursdays th
JOIN public.classes c  ON c.name = 'Hatha Yoga'
JOIN public.teachers t ON t.full_name = 'Blanca Bear'
ON CONFLICT (class_id, teacher_id, scheduled_date, scheduled_time) DO UPDATE
SET status = 'active',
    valid_from = NULL,
    valid_until = NULL;

COMMIT;

-- Verificación:
--  SELECT s.scheduled_time, s.status, count(*), min(s.scheduled_date), max(s.scheduled_date)
--  FROM public.schedules s JOIN public.classes c ON c.id = s.class_id
--  WHERE c.name = 'Hatha Yoga' AND extract(isodow FROM s.scheduled_date)::int = 4
--    AND s.scheduled_date >= DATE '2026-10-08'
--  GROUP BY 1,2 ORDER BY 1,2;
