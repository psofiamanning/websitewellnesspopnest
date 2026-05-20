# Despliegue completo — frontend, backend y Supabase

Guía para llevar a producción **todo lo desarrollado** (rediseño editorial, reservas, códigos de descuento, Mis paquetes, auth).

Repositorio: `https://github.com/psofiamanning/websitewellnesspopnest` · rama **`main`**.

---

## 1. GitHub (código)

El código de frontend y backend ya está en `main`. Para comprobar en tu máquina:

```bash
cd /Users/psmanningruiz/Documents/2026Projects/EstudioPopnestWellness
git pull origin main
git status
```

**No subir nunca** `.env` ni `server/.env` (están en `.gitignore`).

---

## 2. Base de datos (Supabase)

1. Entra a [supabase.com](https://supabase.com) → proyecto **Wellness Database**.
2. **SQL Editor** → ejecuta los scripts en el orden de [`server/sql/README.md`](server/sql/README.md).

**Mínimo para las funciones nuevas:**

| Script | Función |
|--------|---------|
| `add_discount_code_redemptions.sql` | Códigos de descuento (clase gratis) |
| `add_booking_package_credit_deducted.sql` | Reservas con paquete y cancelaciones |

El resto son catálogo de paquetes, precios y ajustes de horario según tu base actual.

---

## 3. Backend (Node en `server/`)

### Variables de entorno (`server/.env` en el hosting)

Copia desde `server/.env.example` y configura en **Railway**, **Render**, VPS, etc.:

| Variable | Producción |
|----------|------------|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role (secreto) |
| `SUPABASE_ANON_KEY` | anon key (misma que en Vite) |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (si usas webhooks) |
| `FRONTEND_URL` | `https://popnest.app` |
| `PORT` | Lo asigna el hosting (ej. `3000`) |
| `MAILERSEND_API_KEY` o SMTP | Correos bienvenida / recuperar contraseña |
| `DISCOUNT_CODES` | Opcional; por defecto `BIENVENIDA` y `POPNEST` |

### Despliegue (ejemplo Railway)

1. **New Project** → Deploy from GitHub → repo `websitewellnesspopnest`.
2. **Root directory:** `server` (o comando de inicio desde esa carpeta).
3. **Start command:** `npm start`
4. **Build:** `npm install`
5. Pega todas las variables de entorno.
6. Dominio personalizado: **`api.popnest.app`** (CNAME que indique Railway).

### Endpoints nuevos / relevantes

- `GET /api/packages/user/:email/all` — Mis paquetes (activos + historial)
- `GET /api/packages/user/:email` — Paquetes activos (reserva)
- `POST /api/discount-codes/validate` — Validar código de descuento
- `POST /api/save-booking` — acepta `paymentMethod: 'discount_code'`

Tras desplegar, prueba: `https://api.popnest.app/api/health` debe responder JSON.

---

## 4. Frontend (Vercel — popnest.app)

En **Vercel → Project → Settings → Environment Variables** (Production):

| Variable | Valor |
|----------|--------|
| `VITE_BACKEND_URL` | `https://api.popnest.app` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `VITE_SUPABASE_URL` | URL Supabase |
| `VITE_SUPABASE_ANON_KEY` | anon key |
| `VITE_META_PIXEL_ID` | Si usas Meta Pixel |

Cada push a `main` redeploya automáticamente. Si cambias variables, **Redeploy** manual.

El build ya usa fallback a `https://api.popnest.app` si falta `VITE_BACKEND_URL`, pero conviene definirla en Vercel.

---

## 5. DNS

| Dominio | Destino |
|---------|---------|
| `popnest.app` | Vercel (ya configurado) |
| `api.popnest.app` | URL del backend (Railway/Render/etc.) |

Sin `api.popnest.app` activo: reservas, login con paquetes y **Mis paquetes** no cargan datos.

---

## 6. Checklist de prueba en producción

- [ ] `https://api.popnest.app/api/health` responde OK
- [ ] `https://popnest.app` — inicio, clases, horario, planes
- [ ] Login / registro / olvidé contraseña (correo con enlace a `popnest.app`)
- [ ] Reserva clase con tarjeta (Stripe live)
- [ ] Reserva con paquete activo — texto “X clases disponibles”
- [ ] Código de descuento (tabla `discount_code_redemptions` creada)
- [ ] Menú **Mis paquetes** (usuario con paquete) → `/mis-paquetes`
- [ ] Compra de paquete en `/packages`

---

## 7. Resumen de lo incluido en el repo

**Frontend:** rediseño editorial (home, clases, horario, planes, reserva, login, forgot/reset password), Mis paquetes, navbar unificado, códigos de descuento en UI.

**Backend:** Supabase bookings/packages, validación de descuentos, endpoint paquetes `/all`, compra de paquetes Stripe.

**SQL:** ver carpeta `server/sql/`.

Para dudas de variables antiguas, ver también [`CAMBIOS_PARA_PRODUCCION.md`](CAMBIOS_PARA_PRODUCCION.md) y [`DEPLOY_VERCEL.md`](DEPLOY_VERCEL.md).
