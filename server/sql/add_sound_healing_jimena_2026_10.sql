-- Octubre 2026: nueva coach Jimena en Sound Healing.
--
--   Agrega (próximos 180 días), sin quitar ningún horario existente:
--     - Sound Healing jueves 19:30 (Jimena)
--     - Sound Healing domingo 10:30 (Jimena)
--
-- Los horarios de Juan Martínez (mar y mié 20:30, dom 09:00) no se tocan.
-- Idempotente: se puede correr más de una vez sin duplicar.
--
-- Para revertir:
--   UPDATE public.schedules s SET status = 'inactive'
--   FROM public.teachers t
--   WHERE s.teacher_id = t.id AND t.full_name = 'Jimena' AND s.scheduled_date >= current_date;

BEGIN;

-- 1) Alta de Jimena (idempotente).
INSERT INTO public.teachers (full_name, is_active)
SELECT 'Jimena', true
WHERE NOT EXISTS (SELECT 1 FROM public.teachers WHERE full_name = 'Jimena');

-- 2) Sound Healing con Jimena: jueves 19:30 y domingo 10:30. 10 lugares por sesión.
WITH slots(isodow, t) AS (
  VALUES (4, '19:30'::time), (7, '10:30'::time)
),
future AS (
  SELECT d::date AS scheduled_date, extract(isodow FROM d)::int AS isodow
  FROM generate_series(current_date, current_date + interval '180 days', interval '1 day') g(d)
)
INSERT INTO public.schedules
  (class_id, teacher_id, scheduled_date, scheduled_time, status, spots_total, spots_available)
SELECT c.id, tc.id, f.scheduled_date, sl.t, 'active', 10, 10
FROM future f
JOIN slots sl ON sl.isodow = f.isodow
JOIN public.classes c   ON c.name = 'Sound Healing'
JOIN public.teachers tc ON tc.full_name = 'Jimena'
ON CONFLICT (class_id, teacher_id, scheduled_date, scheduled_time) DO UPDATE
SET status = 'active',
    valid_from = NULL,
    valid_until = NULL;

COMMIT;

-- =====================================================================
--  Verificación (correr después):
--
--  SELECT t.full_name, extract(isodow from s.scheduled_date)::int AS dow,
--         s.scheduled_time, s.status, count(*), min(s.scheduled_date), max(s.scheduled_date)
--  FROM public.schedules s
--  JOIN public.classes c  ON c.id = s.class_id
--  JOIN public.teachers t ON t.id = s.teacher_id
--  WHERE c.name = 'Sound Healing' AND s.scheduled_date >= current_date AND s.status = 'active'
--  GROUP BY 1,2,3,4 ORDER BY 1,2,3;
-- =====================================================================
