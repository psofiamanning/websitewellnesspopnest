-- cambio_sound_healing_juan_martinez_2026_10.sql se corrió dos veces: primero con
-- 'Juan Martinez' (sin acento, teachers.id = 10) y luego con 'Juan Martínez'
-- (teachers.id = 11). Cada slot de Sound Healing quedó duplicado.
-- El nombre correcto es 'Juan Martínez'. Se desactiva el duplicado sin borrar filas.
-- Al 2026-10-06 ninguno de los 77 horarios duplicados tenía reservas.

BEGIN;

UPDATE public.schedules s
SET status = 'inactive'
FROM public.teachers t
WHERE s.teacher_id = t.id
  AND t.full_name = 'Juan Martinez'
  AND s.status = 'active';

UPDATE public.teachers
SET is_active = false, updated_at = now()
WHERE full_name = 'Juan Martinez';

COMMIT;

-- Verificación: debe salir solo 'Juan Martínez' con status active.
--  SELECT t.full_name, s.status, count(*)
--  FROM public.schedules s JOIN public.teachers t ON t.id = s.teacher_id
--  WHERE t.full_name LIKE 'Juan Mart%'
--  GROUP BY 1,2 ORDER BY 1,2;
