-- Limpieza: Hatha Yoga 19:30 (Blanca) martes, miércoles y jueves.
-- Son filas viejas que siguen 'active' en schedules aunque el horario público
-- ya no las ofrece (Hatha hoy es jueves 20:30 y domingo 08:00). Chocan con
-- Pilates mar 19:30, Tai Chi mié 19:30 y Sound Healing jue 19:30 (Jimena), y
-- aparecen en "Registrar en clase" del panel. Al 2026-10-09 no tenían reservas.
--
-- No borra filas: solo las marca 'inactive'.
-- Para revertir: mismas condiciones con status = 'active'.

UPDATE public.schedules s
SET status = 'inactive'
FROM public.classes c, public.teachers t
WHERE s.class_id = c.id
  AND s.teacher_id = t.id
  AND c.name = 'Hatha Yoga'
  AND t.full_name = 'Blanca Bear'
  AND s.scheduled_time = '19:30'
  AND extract(isodow FROM s.scheduled_date)::int IN (2, 3, 4)
  AND s.scheduled_date >= current_date
  AND s.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM public.bookings_new b
    WHERE b.schedule_id = s.id AND b.status <> 'cancelled'
  );
