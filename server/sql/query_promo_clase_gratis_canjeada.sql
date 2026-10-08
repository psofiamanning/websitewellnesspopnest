-- Personas de la promo "clase gratis" (popup → lead_emails) que YA reservaron
-- su clase gratis en la plataforma con el código POPNEST.
-- El canje queda en discount_code_redemptions, ligado a la reserva en bookings_new.
-- Supabase → SQL Editor → Run. Fechas en hora CDMX.
SELECT
  le.email                                                         AS correo,
  trim(concat_ws(' ', p.first_name, p.last_name))                  AS nombre,
  p.phone                                                          AS telefono,
  to_char(le.created_at AT TIME ZONE 'America/Mexico_City', 'YYYY-MM-DD HH24:MI') AS dejo_correo_en_popup,
  to_char(r.created_at  AT TIME ZONE 'America/Mexico_City', 'YYYY-MM-DD HH24:MI') AS reservo_gratis_el,
  cls.name                                                         AS clase,
  to_char(sch.scheduled_date + sch.scheduled_time, 'YYYY-MM-DD HH24:MI') AS fecha_de_la_clase,
  t.full_name                                                      AS coach,
  b.status                                                         AS estado_reserva
FROM public.lead_emails le
JOIN public.discount_code_redemptions r
  ON lower(trim(r.customer_email)) = lower(trim(le.email))
 AND upper(r.discount_code) = 'POPNEST'
LEFT JOIN public.bookings_new b   ON b.id = r.booking_id
LEFT JOIN public.schedules sch    ON sch.id = b.schedule_id
LEFT JOIN public.classes cls      ON cls.id = sch.class_id
LEFT JOIN public.teachers t       ON t.id = sch.teacher_id
LEFT JOIN public.profiles p       ON p.id = coalesce(r.profile_id, b.customer_id)
WHERE le.offer = 'clase_gratis'
ORDER BY r.created_at DESC;
