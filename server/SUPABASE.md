# Supabase (esquema normalizado)

El backend usa **solo** Supabase como fuente de verdad para reservas, perfiles y paquetes vendidos. Variables obligatorias en `server/.env`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY` (misma clave **anon** pública que en el frontend; necesaria para `/api/auth/login` y `/api/auth/signup` desde Express)

En el frontend (`.env` en la raíz del repo Vite):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Tablas esperadas

- `profiles` — `id` (uuid), `email`, `first_name`, `last_name`, `phone`, `auth_id`
- `classes`, `teachers`, `schedules`, `packages`, `customer_packages`
- `bookings_new`, `payments_new`

### `schedules.valid_from` / `schedules.valid_until` (opcional)

Columnas tipo `date` (nullable). Definen la ventana en la que un slot acepta **nuevas** reservas, sin borrar la fila ni romper historial en `bookings_new`.

- **NULL en ambos** (o sin columnas hasta migrar): comportamiento como antes.
- **Cerrar un horario** sin `DELETE`: por ejemplo `valid_until = ayer` en filas futuras (ver `server/sql/remove_*.sql` actualizados).

Migración: `server/sql/add_schedules_valid_from_until.sql`. La lógica está en `findScheduleBySlot` en `server/db/bookings.js`.

Las lecturas de reservas se adaptan al **mismo JSON plano** que consumía la API antes (ver `server/db/bookingAdapter.js`).

## Recuperación de contraseña (clientes)

El correo lo envía **Supabase** (`resetPasswordForEmail`). La ruta `/reset-password` del SPA debe abrirse desde ese enlace para que exista sesión de recuperación; luego se llama a `supabase.auth.updateUser({ password })`.

Los archivos `bookings.json`, `users.json` y `packages.json` ya no se usan para esos datos.
