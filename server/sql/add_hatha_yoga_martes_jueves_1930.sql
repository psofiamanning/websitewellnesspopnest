-- Hatha Yoga (Blanca Bear): regenerar horarios martes y jueves 19:30.
-- Los horarios previos solo llegaban hasta 2026-04-30, por lo que el frontend
-- ofrecía la clase pero no existía fila en `schedules` -> "0 lugares disponibles".
-- Genera filas para los próximos 180 días. 10 lugares por sesión.
-- Idempotente: ON CONFLICT no duplica filas ya existentes; reactiva si estaban inactivas.

WITH future AS (
  SELECT d::date AS scheduled_date
  FROM generate_series(current_date, current_date + interval '180 days', interval '1 day') g(d)
  WHERE extract(isodow FROM d)::int IN (2, 4)   -- 2=martes, 4=jueves
),
cls AS (
  SELECT id FROM public.classes WHERE name = 'Hatha Yoga' LIMIT 1
),
tch AS (
  SELECT id FROM public.teachers WHERE full_name = 'Blanca Bear' LIMIT 1
)
INSERT INTO public.schedules (class_id, teacher_id, scheduled_date, scheduled_time, status, spots_total, spots_available)
SELECT cls.id, tch.id, f.scheduled_date, '19:30:00'::time, 'active', 10, 10
FROM future f
CROSS JOIN cls
CROSS JOIN tch
ON CONFLICT (class_id, teacher_id, scheduled_date, scheduled_time) DO UPDATE
SET status = 'active';
