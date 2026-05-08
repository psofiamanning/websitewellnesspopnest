-- Dejar de ofertar Hatha Yoga 10:30 martes/jueves (Blanca) para nuevas reservas.
-- Requiere columnas valid_from / valid_until (add_schedules_valid_from_until.sql).
-- No borra filas: las reservas pasadas siguen enlazadas al mismo schedule_id.

UPDATE public.schedules s
SET valid_until = CURRENT_DATE - INTERVAL '1 day'
FROM public.classes c, public.teachers t
WHERE s.class_id = c.id
  AND s.teacher_id = t.id
  AND c.name = 'Hatha Yoga'
  AND t.full_name = 'Blanca Bear'
  AND s.scheduled_time = '10:30:00'
  AND extract(isodow from s.scheduled_date)::int IN (2, 4)
  AND s.scheduled_date >= CURRENT_DATE;
