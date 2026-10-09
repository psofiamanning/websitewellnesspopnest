-- Pilates sábado 08:00 (Blanca Bear) se deja de ofrecer desde 2026-10-08.
-- No borra filas: las reservas en bookings_new siguen enlazadas a su schedule_id.
-- Para revertir: status = 'active', valid_until = NULL en las filas del paso 2.

-- 1) ANTES de correr: revisar si hay reservas futuras en ese horario
--    (si hay, el estudio contacta a las clientas para reubicar).
SELECT s.scheduled_date, b.status, p.first_name, p.last_name, p.email, p.phone
FROM public.bookings_new b
JOIN public.schedules s ON s.id = b.schedule_id
JOIN public.classes c ON c.id = s.class_id
LEFT JOIN public.profiles p ON p.id = b.customer_id
WHERE c.name = 'Pilates'
  AND s.scheduled_time = '08:00:00'
  AND extract(isodow from s.scheduled_date)::int = 6
  AND s.scheduled_date >= DATE '2026-10-08'
ORDER BY s.scheduled_date;

-- 2) Cerrar todas las sesiones futuras de Pilates sábado 08:00.
BEGIN;

UPDATE public.schedules s
SET status = 'inactive',
    valid_until = DATE '2026-10-07'
FROM public.classes c
WHERE s.class_id = c.id
  AND c.name = 'Pilates'
  AND s.scheduled_time = '08:00:00'
  AND extract(isodow from s.scheduled_date)::int = 6
  AND s.scheduled_date >= DATE '2026-10-08'
  AND s.status = 'active';

COMMIT;

-- Verificación: no debe quedar ninguna fila 'active'.
--  SELECT s.status, count(*), min(s.scheduled_date), max(s.scheduled_date)
--  FROM public.schedules s JOIN public.classes c ON c.id = s.class_id
--  WHERE c.name = 'Pilates' AND s.scheduled_time = '08:00:00'
--    AND extract(isodow from s.scheduled_date)::int = 6
--    AND s.scheduled_date >= DATE '2026-10-08'
--  GROUP BY 1;
