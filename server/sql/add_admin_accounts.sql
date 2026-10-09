-- Cuentas del panel /admin (super_admin y operadores) en Supabase.
-- Antes vivían en server/admins.json, que Railway borra al redesplegar.
-- Aditivo: solo crea una tabla nueva. Al arrancar, el backend copia aquí las
-- cuentas que encuentre en admins.json si la tabla está vacía.
--
-- Reversible: DROP TABLE public.admin_accounts;  (el backend vuelve a usar admins.json)

CREATE TABLE IF NOT EXISTS public.admin_accounts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('super_admin', 'operator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Solo el backend (service role) puede leerla; sin políticas = nadie más.
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;
