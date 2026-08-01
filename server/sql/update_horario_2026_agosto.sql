-- =====================================================================
--  Actualización de horario, clases y coaches — agosto 2026
-- =====================================================================
--  Reemplaza el horario semanal completo por el nuevo (ver /horario).
--  NO borra ninguna fila: el historial de `schedules` y las reservas en
--  `bookings_new` quedan intactos. Los slots viejos sólo se "retiran"
--  (valid_until = ayer) o se marcan status='inactive'.
--
--  Requisito previo: add_schedules_valid_from_until.sql (columnas
--  valid_from / valid_until en public.schedules).
--
--  Cómo leer isodow (extract(isodow ...)): 1=Lun 2=Mar 3=Mié 4=Jue
--  5=Vie 6=Sáb 7=Dom.
--
--  ⚠️ Verifica que los nombres de coach coincidan EXACTOMENTE con
--     public.teachers.full_name (acentos incluidos), sobre todo:
--     'Rocío Enciso'. Si tu tabla los guarda distinto, ajusta el VALUES.
--  ⚠️ Si public.classes / public.teachers tienen columnas NOT NULL
--     adicionales sin default, agrega sus valores en los INSERT de los
--     pasos 1 y 2 (aquí sólo se usan las columnas conocidas).
-- =====================================================================

BEGIN;

-- 1) Alta de clases nuevas (idempotente): Belly Dance, Stretching,
--    Meditación y Sound Healing. Run Club NO se incluye (es gratis, sin
--    reservación; vive como sección informativa, no como clase reservable).
INSERT INTO public.classes (name, duration_minutes, is_active)
SELECT v.name, 60, true
FROM (VALUES
  ('Belly Dance'),
  ('Stretching'),
  ('Meditación y Sound Healing')
) AS v(name)
WHERE NOT EXISTS (
  SELECT 1 FROM public.classes c WHERE c.name = v.name
);

-- 2) Alta de coach nueva: Nadia Navarrete (idempotente).
INSERT INTO public.teachers (full_name)
SELECT 'Nadia Navarrete'
WHERE NOT EXISTS (
  SELECT 1 FROM public.teachers t WHERE t.full_name = 'Nadia Navarrete'
);

-- 3) Archivar Yoga Vinyasa (clase descontinuada) SIN borrar.
--    La coach Hayde Ortiz ya no imparte; sus slots quedan inactivos vía
--    la clase. No se elimina el registro de la coach ni sus reservas.
UPDATE public.classes
SET is_active = false
WHERE name = 'Yoga Vinyasa';

UPDATE public.schedules s
SET status = 'inactive'
FROM public.classes c
WHERE s.class_id = c.id
  AND c.name = 'Yoga Vinyasa'
  AND s.status = 'active';

-- 4) Retirar TODO el grid activo a futuro. No se borra: sólo deja de
--    aceptar reservas nuevas (valid_until = ayer). El paso 5 reactiva
--    únicamente los slots que sí forman parte del horario nuevo; los que
--    no (horarios/días viejos) permanecen retirados como histórico.
UPDATE public.schedules
SET valid_until = CURRENT_DATE - INTERVAL '1 day'
WHERE status = 'active'
  AND scheduled_date >= CURRENT_DATE
  AND (valid_until IS NULL OR valid_until >= CURRENT_DATE);

-- 5) Generar / reactivar el horario NUEVO para los próximos 180 días.
--    10 lugares por sesión. Idempotente: si el slot ya existía, se
--    reactiva (status='active', se limpia la vigencia) SIN tocar
--    spots_available/spots_total, para no perder reservas ya hechas.
WITH grid AS (
  SELECT * FROM (VALUES
    -- clase                         coach                       isodow  hora
    ('Hatha Yoga',                  'Blanca Bear',                  3, '19:30'::time),
    ('Hatha Yoga',                  'Blanca Bear',                  4, '19:00'::time),
    ('Hatha Yoga',                  'Blanca Bear',                  7, '08:00'::time),
    ('Pilates',                     'Blanca Bear',                  1, '08:30'::time),
    ('Pilates',                     'Blanca Bear',                  2, '09:30'::time),
    ('Pilates',                     'Blanca Bear',                  2, '19:30'::time),
    ('Pilates',                     'Blanca Bear',                  3, '08:30'::time),
    ('Pilates',                     'Blanca Bear',                  4, '09:30'::time),
    ('Pilates',                     'Blanca Bear',                  6, '08:00'::time),
    ('Tai Chi',                     'Blanca Bear',                  1, '19:30'::time),
    ('Power Yoga',                  'Rocío Enciso',                 2, '08:30'::time),
    ('Sound Healing',               'Brenda Granados Segovia',      4, '20:00'::time),
    ('Sound Healing',               'Brenda Granados Segovia',      7, '09:00'::time),
    ('Meditación',                  'Madeline Rojas Givaudan',      7, '10:30'::time),
    ('Belly Dance',                 'Nadia Navarrete',              3, '18:00'::time),
    ('Belly Dance',                 'Nadia Navarrete',              5, '18:00'::time),
    ('Stretching',                  'Rocío Enciso',                 5, '08:30'::time),
    ('Stretching',                  'Rocío Enciso',                 6, '09:00'::time),
    ('Meditación y Sound Healing',  'Madeline Rojas Givaudan',      6, '10:30'::time)
  ) AS g(class_name, teacher_name, isodow, t)
),
days AS (
  SELECT d::date AS scheduled_date,
         extract(isodow FROM d)::int AS isodow
  FROM generate_series(current_date, current_date + interval '180 days', interval '1 day') g(d)
)
INSERT INTO public.schedules
  (class_id, teacher_id, scheduled_date, scheduled_time, status, spots_total, spots_available)
SELECT c.id, t.id, dd.scheduled_date, g.t, 'active', 10, 10
FROM grid g
JOIN days dd        ON dd.isodow = g.isodow
JOIN public.classes c  ON c.name = g.class_name
JOIN public.teachers t ON t.full_name = g.teacher_name
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
--         s.scheduled_time, count(*) AS sesiones
--  FROM public.schedules s
--  JOIN public.classes c  ON c.id = s.class_id
--  JOIN public.teachers t ON t.id = s.teacher_id
--  WHERE s.status = 'active'
--    AND s.scheduled_date >= CURRENT_DATE
--    AND (s.valid_until IS NULL OR s.valid_until >= CURRENT_DATE)
--  GROUP BY 1,2,3,4
--  ORDER BY 3,4;
--  -- Debe listar exactamente los 19 slots del horario nuevo.
-- =====================================================================
