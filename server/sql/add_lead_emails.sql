-- Correos capturados por el popup de "clase gratis" (cuenta regresiva de 20s).
-- Un registro por correo + oferta para evitar duplicados.
create table if not exists public.lead_emails (
  id bigint generated always as identity primary key,
  email text not null,
  source text not null default 'free_class_popup',
  offer text not null default 'clase_gratis',
  created_at timestamptz not null default now(),
  constraint lead_emails_unique_email_offer unique (email, offer)
);

create index if not exists lead_emails_email_idx
  on public.lead_emails (email);

create index if not exists lead_emails_created_at_idx
  on public.lead_emails (created_at desc);
