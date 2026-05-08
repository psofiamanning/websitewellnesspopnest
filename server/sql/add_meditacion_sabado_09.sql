-- Meditación (Madeline): nuevo horario sábados 09:00. Próximos 90 días.

WITH future AS (
  SELECT d::date AS scheduled_date
  FROM generate_series(current_date, current_date + interval '90 days', interval '1 day') g(d)
  WHERE extract(isodow FROM d)::int = 6
),
cls AS (
  SELECT id FROM public.classes WHERE name = 'Meditación' LIMIT 1
),
tch AS (
  SELECT id FROM public.teachers WHERE full_name = 'Madeline Rojas Givaudan' LIMIT 1
)
INSERT INTO public.schedules (class_id, teacher_id, scheduled_date, scheduled_time, status, spots_total, spots_available)
SELECT cls.id, tch.id, f.scheduled_date, '09:00:00'::time, 'active', 10, 10
FROM future f
CROSS JOIN cls
CROSS JOIN tch
ON CONFLICT (class_id, teacher_id, scheduled_date, scheduled_time) DO UPDATE
SET status = 'active';
