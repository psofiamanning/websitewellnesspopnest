-- Paquetes en propuesta (revisión interna) — 2026
--
-- ADITIVO y REVERSIBLE: inserta 5 paquetes nuevos SIN modificar ni borrar los
-- existentes (Paquete de 10 Clases, Paquete de 20 Clases, etc.).
--
-- El campo `name` DEBE coincidir EXACTO con src/data/packageOffers.js para que
-- al pagar se acrediten bien las clases (server/db/packages.js -> por `name`).
--
-- Idempotente: correrlo varias veces no duplica filas.
-- Ejecutar en Supabase -> SQL Editor.

insert into public.packages (name, total_classes, price, validity_days, is_active)
select v.name, v.total_classes, v.price, v.validity_days, true
from (values
  ('Descubre Popnest',       3,  550, 30),
  ('Paquete de 4 Clases',    4,  900, 30),
  ('Paquete de 8 Clases',    8, 1600, 30),
  ('Paquete de 12 Clases',  12, 2200, 30),
  ('Popnest Duo',            8, 1750, 30),
  -- Ilimitado: total_classes = 0. El backend NO descuenta (lo detecta por nombre)
  -- y vale por su vigencia. No usa cupo.
  ('Ilimitado Mensual',      0, 2990, 30)
) as v(name, total_classes, price, validity_days)
where not exists (
  select 1 from public.packages p where p.name = v.name
);

-- Corrige el Ilimitado si en una corrida previa quedó con un cupo (p. ej. 999):
update public.packages set total_classes = 0
where name = 'Ilimitado Mensual' and total_classes <> 0;

-- Verificación:
--   select name, total_classes, price, validity_days, is_active
--   from public.packages
--   where name in ('Descubre Popnest','Paquete de 4 Clases','Paquete de 8 Clases',
--                  'Paquete de 12 Clases','Popnest Duo')
--   order by price;

-- Reversión (elige una):
--   -- Ocultar sin borrar (conserva historial de compras si ya alguien compró):
--   update public.packages set is_active = false
--     where name in ('Descubre Popnest','Paquete de 4 Clases','Paquete de 8 Clases',
--                    'Paquete de 12 Clases','Popnest Duo','Ilimitado Mensual');
--   -- Eliminar por completo (solo si NADIE ha comprado estos paquetes):
--   delete from public.packages
--     where name in ('Descubre Popnest','Paquete de 4 Clases','Paquete de 8 Clases',
--                    'Paquete de 12 Clases','Popnest Duo','Ilimitado Mensual');
