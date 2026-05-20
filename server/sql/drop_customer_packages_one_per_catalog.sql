-- Permite varias compras del mismo paquete por cliente (Georgina, Emma, etc.)
-- Ejecutar UNA VEZ en Supabase → SQL Editor.

-- Constraints
ALTER TABLE public.customer_packages
DROP CONSTRAINT IF EXISTS customer_packages_customer_id_package_id_key;

ALTER TABLE public.customer_packages
DROP CONSTRAINT IF EXISTS customer_packages_unique_active;

-- Índice único (a veces el error viene de aquí, no de CONSTRAINT)
DROP INDEX IF EXISTS public.customer_packages_unique_active;

-- Ver qué queda (debe devolver 0 filas de índices únicos en customer_id+package_id)
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'customer_packages'
  AND indexdef ILIKE '%unique%';
