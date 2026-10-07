-- Meditación (Madeline Rojas Givaudan, domingo 10:30) se deja de ofrecer desde
-- 2026-10-07, incluida la sesión del domingo 2026-10-11.
-- No borra filas: las 10 reservas históricas y la que había para el 11 de octubre
-- (Andrea Villaseñor, pagada con código de descuento) siguen enlazadas a su
-- schedule_id; el estudio la contacta por fuera para reubicar/reembolsar.
-- Para revertir: classes/teachers is_active = true y schedules status = 'active',
-- valid_until = NULL en las filas del paso 3.

BEGIN;

-- 1) Archivar la clase.
UPDATE public.classes
SET is_active = false
WHERE name = 'Meditación';

-- 2) Made deja de estar activa (no tiene otras clases; su historial se conserva).
UPDATE public.teachers
SET is_active = false, updated_at = now()
WHERE full_name = 'Madeline Rojas Givaudan';

-- 3) Cerrar todas las sesiones futuras de Meditación.
UPDATE public.schedules s
SET status = 'inactive',
    valid_until = DATE '2026-10-06'
FROM public.classes c
WHERE s.class_id = c.id
  AND c.name = 'Meditación'
  AND s.scheduled_date >= DATE '2026-10-07'
  AND s.status = 'active';

COMMIT;

-- Verificación: no debe quedar ninguna fila 'active'.
--  SELECT s.status, count(*), min(s.scheduled_date), max(s.scheduled_date)
--  FROM public.schedules s JOIN public.classes c ON c.id = s.class_id
--  WHERE c.name = 'Meditación' AND s.scheduled_date >= DATE '2026-10-07'
--  GROUP BY 1;
