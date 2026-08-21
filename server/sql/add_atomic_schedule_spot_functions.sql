-- Decremento/incremento atómico de spots_available en schedules.
--
-- Antes, el servidor leía spots_available, restaba 1 en JS, y hacía UPDATE con ese
-- número — dos reservas simultáneas para el último lugar podían leer el mismo valor
-- y ambas confirmarse (sobrecupo). Estas funciones hacen el UPDATE condicionado en
-- una sola sentencia SQL (atómica), así que solo una puede ganar la carrera.
--
-- Ejecutar una sola vez en Supabase → SQL Editor.

create or replace function public.decrement_schedule_spot(p_schedule_id bigint)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows integer;
begin
  update public.schedules
  set spots_available = spots_available - 1
  where id = p_schedule_id and spots_available > 0;
  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;

create or replace function public.increment_schedule_spot(p_schedule_id bigint)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows integer;
begin
  update public.schedules
  set spots_available = spots_available + 1
  where id = p_schedule_id
    and spots_available < spots_total;
  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;
