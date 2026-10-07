-- Octubre 2026: salida de Brenda Granados Segovia (última clase: domingo 2026-10-04)
-- y alta de Juan Martínez en Sound Healing.
--
--   Retira (desde 2026-10-05):
--     - Sound Healing jueves 20:00 y domingo 09:00 (Brenda)
--     - Meditación y Sound Healing sábado 10:30 (Made + Brenda) -> clase archivada
--   Agrega (próximos 180 días):
--     - Sound Healing martes 20:30, miércoles 20:30 y domingo 09:00 (Juan Martínez)
--
-- No borra filas: las reservas y el historial de Brenda siguen enlazados a sus
-- schedule_id. Al 2026-10-06 no había reservas en ninguno de los slots retirados.
-- Las filas retiradas se ponen en status = 'inactive' (además de valid_until):
-- findScheduleBySlot empata por clase + fecha + hora sin mirar la coach, así que
-- el domingo 09:00 de Brenda tiene que quedar fuera para no chocar con el de Juan.
--
-- Para revertir: status = 'active', valid_until = NULL en las mismas filas.

BEGIN;

-- 1) Alta de Juan Martínez (idempotente).
INSERT INTO public.teachers (full_name, is_active)
SELECT 'Juan Martínez', true
WHERE NOT EXISTS (SELECT 1 FROM public.teachers WHERE full_name = 'Juan Martínez');

-- 2) Brenda deja de estar activa (no se borra: su historial sigue enlazado).
UPDATE public.teachers
SET is_active = false, updated_at = now()
WHERE full_name = 'Brenda Granados Segovia';

-- 3) Retirar todos los horarios futuros de Brenda.
UPDATE public.schedules s
SET status = 'inactive',
    valid_until = DATE '2026-10-04'
FROM public.teachers t
WHERE s.teacher_id = t.id
  AND t.full_name = 'Brenda Granados Segovia'
  AND s.scheduled_date >= DATE '2026-10-05'
  AND s.status = 'active';

-- 4) Archivar Meditación y Sound Healing y retirar sus horarios futuros.
UPDATE public.classes
SET is_active = false
WHERE name = 'Meditación y Sound Healing';

UPDATE public.schedules s
SET status = 'inactive',
    valid_until = DATE '2026-10-04'
FROM public.classes c
WHERE s.class_id = c.id
  AND c.name = 'Meditación y Sound Healing'
  AND s.scheduled_date >= DATE '2026-10-05'
  AND s.status = 'active';

-- 5) Sound Healing con Juan Martínez: martes y miércoles 20:30, domingo 09:00.
--    10 lugares por sesión. Idempotente vía ON CONFLICT.
WITH slots(isodow, t) AS (
  VALUES (2, '20:30'::time), (3, '20:30'::time), (7, '09:00'::time)
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
JOIN public.teachers tc ON tc.full_name = 'Juan Martínez'
ON CONFLICT (class_id, teacher_id, scheduled_date, scheduled_time) DO UPDATE
SET status = 'active',
    valid_from = NULL,
    valid_until = NULL;

COMMIT;

-- =====================================================================
--  Verificación (correr después):
--
--  SELECT c.name, t.full_name,
--         extract(isodow from s.scheduled_date)::int AS dow,
--         s.scheduled_time, s.status, count(*), min(s.scheduled_date), max(s.scheduled_date)
--  FROM public.schedules s
--  JOIN public.classes c  ON c.id = s.class_id
--  JOIN public.teachers t ON t.id = s.teacher_id
--  WHERE c.name IN ('Sound Healing', 'Meditación y Sound Healing')
--    AND s.scheduled_date >= DATE '2026-10-05'
--  GROUP BY 1,2,3,4,5
--  ORDER BY 1,2,3,4;
-- =====================================================================
