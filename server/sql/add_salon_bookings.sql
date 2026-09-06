-- =====================================================================
--  Renta de salón al público — reservas pagadas + solicitudes especiales
-- =====================================================================
--  Aditiva y reversible: crea tablas nuevas, no toca nada existente.
--  Corre esto en Supabase → SQL Editor.
-- =====================================================================

-- Reservas pagadas en línea (Valle, Tarde, Fin de semana día, Noche).
-- El precio se calcula y valida en el servidor (server/config/salonPricing.js);
-- aquí solo se guarda una "foto" del precio usado al momento de cotizar.
create table if not exists public.salon_bookings (
  id                          bigint generated always as identity primary key,
  customer_name               text not null,
  customer_email              text not null,
  customer_phone              text,
  booking_date                date not null,
  start_time                  time not null,
  end_time                    time not null,
  slot_key                    text not null,        -- 'valle' | 'tarde' | 'fin_semana_dia' | 'noche'
  num_people                  integer not null,
  hours                       numeric not null,
  hourly_rate_snapshot        numeric not null,      -- MXN, precio/hora del tier al cotizar
  base_amount                 numeric not null,       -- hours * hourly_rate_snapshot
  extra_proyector             boolean not null default false,
  extra_montaje                boolean not null default false,
  extras_amount                numeric not null default 0,
  total_amount                numeric not null,       -- base_amount + extras_amount, en MXN
  currency                    text not null default 'mxn',
  status                      text not null default 'pending', -- pending | paid | cancelled | expired
  notes                       text,
  stripe_checkout_session_id  text,
  stripe_payment_intent_id    text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  paid_at                     timestamptz
);

create index if not exists salon_bookings_date_idx on public.salon_bookings (booking_date, status);
create index if not exists salon_bookings_session_idx on public.salon_bookings (stripe_checkout_session_id);
create index if not exists salon_bookings_email_idx on public.salon_bookings (customer_email);

-- Solicitudes manuales para la franja "Sobre horario de clase" (implica mover
-- una clase regular, así que no se cobra ni se confirma automáticamente aquí).
create table if not exists public.salon_special_requests (
  id               bigint generated always as identity primary key,
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text,
  desired_date     date,
  desired_time     text,           -- texto libre: es una solicitud, no un horario ya validado
  duration_hours   numeric,
  num_people       integer,
  notes            text,
  status           text not null default 'nuevo', -- nuevo | contactado | confirmado | rechazado
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists salon_special_requests_status_idx on public.salon_special_requests (status, created_at);
