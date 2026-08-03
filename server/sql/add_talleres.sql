-- =====================================================================
--  Talleres (workshops) — contenido editable desde el panel de admin
-- =====================================================================
--  Aditiva y reversible: crea tablas nuevas, no toca nada existente.
--  Correr en Supabase → SQL Editor.
--
--  Además hay que crear un bucket público de Storage para las imágenes.
--  El backend lo crea solo al subir la primera imagen (createBucket), pero
--  si prefieres hacerlo a mano: Storage → New bucket → nombre "talleres",
--  marcar "Public bucket".
-- =====================================================================

create table if not exists public.talleres (
  id              bigint generated always as identity primary key,
  title           text not null,
  tema            text,
  descripcion     text,
  comida          text,
  price           numeric not null default 0,      -- MXN
  image_url       text,
  fecha           date,
  hora            text,
  lugar           text,
  spots_total     integer not null default 20,
  spots_available integer not null default 20,
  is_active       boolean not null default true,   -- publicado / borrador
  payment_link    text,                            -- link de pago de Stripe (opcional)
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Por si la tabla ya existía de una corrida previa, agrega la columna sin error.
alter table public.talleres add column if not exists payment_link text;

create index if not exists talleres_active_idx on public.talleres (is_active, fecha);

create table if not exists public.taller_bookings (
  id                       bigint generated always as identity primary key,
  taller_id                bigint references public.talleres (id) on delete set null,
  taller_title             text,                    -- snapshot por si se borra el taller
  customer_name            text,
  customer_email           text,
  customer_phone           text,
  amount_paid              numeric,
  currency                 text default 'mxn',
  payment_status           text,
  stripe_payment_intent_id text,
  created_at               timestamptz not null default now()
);

create index if not exists taller_bookings_taller_idx on public.taller_bookings (taller_id);
create index if not exists taller_bookings_email_idx  on public.taller_bookings (customer_email);

-- Resta un lugar de forma segura (no baja de 0). Devuelve la fila si pudo.
create or replace function public.decrement_taller_spot(p_taller_id bigint)
returns public.talleres
language plpgsql
as $$
declare
  updated public.talleres;
begin
  update public.talleres
     set spots_available = spots_available - 1,
         updated_at = now()
   where id = p_taller_id
     and is_active = true
     and spots_available > 0
  returning * into updated;
  return updated;   -- NULL si no había lugar / no existe / inactivo
end;
$$;
