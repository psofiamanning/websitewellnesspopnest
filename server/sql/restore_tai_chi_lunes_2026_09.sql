-- Corrección: Tai Chi (Blanca Bear) se queda en AMBOS días, lunes Y
-- miércoles 19:30 — no fue un "mover" el horario, fue agregar el miércoles
-- como sesión extra. move_tai_chi_a_miercoles_2026_09.sql había retirado
-- por error el slot de lunes; este script lo reactiva.
-- No borra filas: sólo limpia valid_until en los slots de lunes.

BEGIN;

UPDATE public.schedules s
SET valid_until = NULL
FROM public.classes c, public.teachers t
WHERE s.class_id = c.id
  AND s.teacher_id = t.id
  AND c.name = 'Tai Chi'
  AND t.full_name = 'Blanca Bear'
  AND s.scheduled_time = '19:30:00'
  AND extract(isodow FROM s.scheduled_date)::int = 1
  AND s.scheduled_date >= CURRENT_DATE
  AND s.status = 'active';

COMMIT;
