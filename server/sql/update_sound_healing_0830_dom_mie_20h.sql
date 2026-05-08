-- Sound Healing: domingo 08:00 -> 08:30; nuevo miércoles 20:00 (Brenda).
-- Ejecutar en Supabase SQL Editor. Ajusta nombres si difieren.

-- 1) Domingo 08:00 -> 08:30 (misma clase, mismo coach)
UPDATE public.schedules s
SET scheduled_time = '08:30:00'
FROM public.classes c, public.teachers t
WHERE s.class_id = c.id
  AND s.teacher_id = t.id
  AND c.name = 'Sound Healing'
  AND t.full_name = 'Brenda Granados Segovia'
  AND s.scheduled_time = '08:00:00'
  AND extract(isodow from s.scheduled_date)::int = 7;

-- 2) Miércoles 20:00 — generar próximos 90 días (evita duplicar si ya existe)
WITH future AS (
  SELECT d::date AS scheduled_date
  FROM generate_series(current_date, current_date + interval '90 days', interval '1 day') g(d)
  WHERE extract(isodow FROM d)::int = 3
),
cls AS (
  SELECT id FROM public.classes WHERE name = 'Sound Healing' LIMIT 1
),
tch AS (
  SELECT id FROM public.teachers WHERE full_name = 'Brenda Granados Segovia' LIMIT 1
)
INSERT INTO public.schedules (class_id, teacher_id, scheduled_date, scheduled_time, status, spots_total, spots_available)
SELECT cls.id, tch.id, f.scheduled_date, '20:00:00'::time, 'active', 10, 10
FROM future f
CROSS JOIN cls
CROSS JOIN tch
ON CONFLICT (class_id, teacher_id, scheduled_date, scheduled_time) DO UPDATE
SET status = 'active';
