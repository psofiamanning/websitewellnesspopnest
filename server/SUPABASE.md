# Reservas y usuarios con Supabase (persistentes en producción)

Las reservas y los usuarios se guardan en **Supabase** cuando configuras `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en el backend. Con **solo esas dos variables** es suficiente; no hace falta ninguna otra de Supabase.

**Proyecto actual:** Wellness Database · Project ID: `cgtiuulyregyxdpaudtf`  
→ URL: `https://cgtiuulyregyxdpaudtf.supabase.co`

## 1. Crear proyecto en Supabase

1. Entra en [supabase.com](https://supabase.com) y crea una cuenta (gratis).
2. **New project** → nombre, contraseña de DB (guárdala), región.
3. Cuando esté listo, ve a **Project Settings** (⚙️) → **API**.
4. Copia:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key (en "Project API keys", la que dice "secret") → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Crear las tablas (reservas y usuarios)

En el dashboard de Supabase: **SQL Editor** → New query → pega y ejecuta:

```sql
-- Tabla para reservas (cada fila = una reserva, el JSON completo en "data")
create table if not exists public.bookings (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

-- Índice para listar por fecha de creación
create index if not exists bookings_created_at_idx on public.bookings (created_at);

-- Tabla para usuarios (registro, login, compra de paquetes)
create table if not exists public.users (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create index if not exists users_created_at_idx on public.users (created_at);

-- El backend usa service_role, así que no hace falta RLS para desarrollo.
-- Si quieres restringir acceso después, puedes añadir políticas (RLS).
```

Luego **Run**.

## 3. Configurar el backend

En **Railway** (o donde corra el backend):

- Variables de entorno:
  - `SUPABASE_URL` = la Project URL (ej. `https://xxxxx.supabase.co`)
  - `SUPABASE_SERVICE_ROLE_KEY` = la clave **service_role** (la secreta)

En **local** (carpeta `server/`):

- Copia `server/.env.example` a `server/.env` y añade las mismas dos variables.

Reinicia el servidor. Al arrancar deberías ver en consola:

```
📝 Bookings: Supabase
👥 Users: Supabase
```

Si no configuras estas variables, el backend sigue usando `server/bookings.json` y `server/users.json` (los datos se pierden en cada deploy en producción).

## 4. Migrar datos existentes (opcional)

**Reservas:** Si tienes reservas en `bookings.json`, configura Supabase y la tabla como arriba; luego ejecuta un script que lea `bookings.json` e inserte cada objeto en la tabla `bookings` (columnas `id`, `data`, `created_at`).

**Usuarios:** Si tienes usuarios en `users.json`, después de crear la tabla `users` puedes ejecutar un script que lea `users.json` e inserte cada usuario en la tabla `users` (columnas `id`, `data`, `created_at`). El backend usa las mismas variables `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` para reservas y usuarios.
