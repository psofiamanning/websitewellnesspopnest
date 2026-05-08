-- Dejar de ofertar Meditación lunes 08:00 (Madeline) para nuevas reservas.
-- Requiere columnas valid_from / valid_until (add_schedules_valid_from_until.sql).
-- No borra filas: historial en bookings_new intacto.

UPDATE public.schedules s
SET valid_until = CURRENT_DATE - INTERVAL '1 day'
FROM public.classes c, public.teachers t
WHERE s.class_id = c.id
  AND s.teacher_id = t.id
  AND c.name IN ('Meditación', 'Meditacion')
  AND t.full_name = 'Madeline Rojas Givaudan'
  AND s.scheduled_time = '08:00:00'
  AND extract(isodow from s.scheduled_date)::int = 1
  AND s.scheduled_date >= CURRENT_DATE;
