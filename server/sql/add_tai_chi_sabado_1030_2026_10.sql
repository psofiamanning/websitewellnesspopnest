-- Tai Chi (Blanca Bear): nueva sesión sábado 10:30. Es una adición; lunes y
-- miércoles 19:30 no cambian. Próximos 180 días, 10 lugares. Idempotente.

WITH saturdays AS (
  SELECT d::date AS scheduled_date
  FROM generate_series(current_date, current_date + interval '180 days', interval '1 day') g(d)
  WHERE extract(isodow FROM d)::int = 6
)
INSERT INTO public.schedules
  (class_id, teacher_id, scheduled_date, scheduled_time, status, spots_total, spots_available)
SELECT c.id, t.id, sa.scheduled_date, '10:30'::time, 'active', 10, 10
FROM saturdays sa
JOIN public.classes c  ON c.name = 'Tai Chi'
JOIN public.teachers t ON t.full_name = 'Blanca Bear'
ON CONFLICT (class_id, teacher_id, scheduled_date, scheduled_time) DO UPDATE
SET status = 'active',
    valid_from = NULL,
    valid_until = NULL;

-- Verificación:
--  SELECT s.status, count(*), min(s.scheduled_date), max(s.scheduled_date)
--  FROM public.schedules s JOIN public.classes c ON c.id = s.class_id
--  WHERE c.name = 'Tai Chi' AND s.scheduled_time = '10:30'
--  GROUP BY 1;
