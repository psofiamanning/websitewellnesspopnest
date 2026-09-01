-- Tai Chi (Blanca Bear) se mueve de lunes 19:30 a miércoles 19:30, permanente
-- desde septiembre 2026. Libera el slot retirando Hatha Yoga miércoles 19:30
-- (Blanca Bear), que chocaba en el mismo horario con la misma coach.
-- No borra filas: las reservas pasadas siguen enlazadas al mismo schedule_id.
-- Requiere columnas valid_from / valid_until (add_schedules_valid_from_until.sql).

BEGIN;

-- 1) Retirar Hatha Yoga miércoles 19:30 (Blanca Bear) de nuevas reservas.
UPDATE public.schedules s
SET valid_until = CURRENT_DATE - INTERVAL '1 day'
FROM public.classes c, public.teachers t
WHERE s.class_id = c.id
  AND s.teacher_id = t.id
  AND c.name = 'Hatha Yoga'
  AND t.full_name = 'Blanca Bear'
  AND s.scheduled_time = '19:30:00'
  AND extract(isodow FROM s.scheduled_date)::int = 3
  AND s.scheduled_date >= CURRENT_DATE
  AND s.status = 'active';

-- 2) Retirar Tai Chi lunes 19:30 (Blanca Bear) de nuevas reservas.
UPDATE public.schedules s
SET valid_until = CURRENT_DATE - INTERVAL '1 day'
FROM public.classes c, public.teachers t
WHERE s.class_id = c.id
  AND s.teacher_id = t.id
  AND c.name = 'Tai Chi'
  AND t.full_name = 'Blanca Bear'
  AND s.scheduled_time = '19:30:00'
  AND extract(isodow FROM s.scheduled_date)::int = 1
  AND s.scheduled_date >= CURRENT_DATE
  AND s.status = 'active';

-- 3) Alta de Tai Chi miércoles 19:30 (Blanca Bear) en cada miércoles que ya
--    tenía Hatha Yoga generado (mismo rango de 180 días de la corrida
--    original). Idempotente vía ON CONFLICT.
WITH wednesdays AS (
  SELECT DISTINCT s.scheduled_date
  FROM public.schedules s
  JOIN public.classes c ON c.id = s.class_id
  WHERE c.name = 'Hatha Yoga'
    AND extract(isodow FROM s.scheduled_date)::int = 3
    AND s.scheduled_date >= CURRENT_DATE
)
INSERT INTO public.schedules
  (class_id, teacher_id, scheduled_date, scheduled_time, status, spots_total, spots_available)
SELECT c.id, t.id, w.scheduled_date, '19:30'::time, 'active', 10, 10
FROM wednesdays w
JOIN public.classes c  ON c.name = 'Tai Chi'
JOIN public.teachers t ON t.full_name = 'Blanca Bear'
ON CONFLICT (class_id, teacher_id, scheduled_date, scheduled_time) DO UPDATE
SET status = 'active',
    valid_from = NULL,
    valid_until = NULL;

COMMIT;

-- =====================================================================
--  Verificación rápida (correr después, fuera de la transacción):
--
--  SELECT c.name, t.full_name,
--         extract(isodow from s.scheduled_date)::int AS dow,
--         s.scheduled_time, s.status, s.valid_until, count(*)
--  FROM public.schedules s
--  JOIN public.classes c  ON c.id = s.class_id
--  JOIN public.teachers t ON t.id = s.teacher_id
--  WHERE c.name IN ('Tai Chi', 'Hatha Yoga')
--    AND s.scheduled_date >= CURRENT_DATE
--  GROUP BY 1,2,3,4,5,6
--  ORDER BY 1,3,4;
-- =====================================================================
