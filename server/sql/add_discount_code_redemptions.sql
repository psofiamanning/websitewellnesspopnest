-- Canjes de códigos de descuento (un uso por correo y por código)
create table if not exists public.discount_code_redemptions (
  id bigint generated always as identity primary key,
  discount_code text not null,
  customer_email text not null,
  profile_id uuid references public.profiles (id) on delete set null,
  booking_id bigint references public.bookings_new (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint discount_code_redemptions_unique_email_code unique (discount_code, customer_email)
);

create index if not exists discount_code_redemptions_email_idx
  on public.discount_code_redemptions (customer_email);

create index if not exists discount_code_redemptions_code_idx
  on public.discount_code_redemptions (discount_code);
