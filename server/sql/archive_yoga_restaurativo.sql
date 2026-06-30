-- Archivar Yoga Restaurativo: por ahora no se ofrece esta clase.
-- 1) Marca la clase como inactiva (is_active = false).
-- 2) Desactiva sus horarios (status = 'inactive') para que NO aparezcan como
--    reservables aunque se consulte la API directamente (findScheduleBySlot
--    filtra status = 'active').
-- No borra filas: las 6 reservas pasadas siguen enlazadas a su schedule_id.
-- Para reactivarla en el futuro: poner is_active = true y regenerar horarios
--    (ver patrón en add_hatha_yoga_martes_jueves_1930.sql).

UPDATE public.classes
SET is_active = false
WHERE name = 'Yoga Restaurativo';

UPDATE public.schedules s
SET status = 'inactive'
FROM public.classes c
WHERE s.class_id = c.id
  AND c.name = 'Yoga Restaurativo'
  AND s.status = 'active';
