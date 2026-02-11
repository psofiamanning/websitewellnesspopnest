# Cambios para producción – Estudio Popnest Wellness

Documento de referencia con todo lo que debes cambiar o revisar cuando pases de **localhost** a **producción**. Puedes seguir probando en local y usar esta lista al desplegar.

---

## 1. Variables de entorno

### 1.1 Frontend (raíz del proyecto: `.env`)

El frontend (Vite) solo lee variables que empiezan por `VITE_`. En producción, crea o edita el `.env` en la **raíz** del proyecto (o configura estas variables en tu plataforma de hosting).

| Variable | Desarrollo (localhost) | Producción |
|----------|------------------------|------------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` (opcional: ya usas `pk_live_...`) | `pk_live_...` (clave pública de Stripe en modo live) |
| `VITE_BACKEND_URL` | `http://localhost:3002` | `https://api.popnest.app` (o la URL pública de tu API) |

- **Importante:** Después de cambiar `.env` en un proyecto Vite hay que **volver a hacer build** (`npm run build`) para que los nuevos valores se incluyan en el build.

---

### 1.2 Backend (carpeta `server`: `server/.env`)

Estas variables las usa solo el servidor Node. En producción, configúralas en el servidor donde corra el backend (o en el panel de variables de entorno de tu hosting).

| Variable | Desarrollo (localhost) | Producción |
|----------|------------------------|------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` (clave secreta de Stripe en modo live) |
| `STRIPE_WEBHOOK_SECRET` | (opcional) | `whsec_...` (si usas webhooks de Stripe en producción) |
| `SMTP_MAIL_USER` | `info@estudiopopnest.com` (o el que uses) | El mismo correo que envía los emails |
| `SMTP_MAIL_APP_PASSWORD` | Contraseña de aplicación de Gmail | La misma (o una nueva App Password si cambias de cuenta) |
| `FRONTEND_URL` | `http://localhost:5173` | `https://popnest.app` (URL pública de tu web) |
| `PORT` | `3002` (o el que uses) | El puerto que asigne tu hosting (ej. 3000, 8080) o deja que lo defina la plataforma |

**Sobre `FRONTEND_URL`:**  
Se usa para el enlace que se envía en el correo de “Olvidé mi contraseña”. Si en producción no lo cambias, el enlace seguiría apuntando a `http://localhost:5173` y no funcionaría para los usuarios. En producción debe ser la URL real del frontend: `https://popnest.app`.

---

## 2. Stripe (pagos)

- **Desarrollo:** Claves de prueba (`pk_test_...`, `sk_test_...`). Los pagos no son reales.
- **Producción:** Cambiar a claves live en [Stripe Dashboard](https://dashboard.stripe.com/apikeys):
  - En el **frontend** (`.env` raíz): `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
  - En el **backend** (`server/.env`): `STRIPE_SECRET_KEY=sk_live_...`
- **Webhooks (opcional):** Si en producción quieres recibir eventos de Stripe (pago completado, etc.), configura el webhook en Stripe y pon `STRIPE_WEBHOOK_SECRET=whsec_...` en `server/.env`.

---

## 3. Email (bienvenida y “olvidé mi contraseña”)

- Ya usas Gmail/Google Workspace con **contraseña de aplicación**; en producción puede seguir igual.
- Solo asegúrate de que en **`server/.env`** en producción estén:
  - `SMTP_MAIL_USER`
  - `SMTP_MAIL_APP_PASSWORD`
  - `FRONTEND_URL` = URL pública del frontend (para que el enlace de restablecer contraseña sea correcto).

---

## 4. CORS (backend)

Hoy el servidor tiene `app.use(cors())` (acepta peticiones de cualquier origen). En producción es más seguro limitar el origen:

- Opción recomendada: permitir solo el origen de tu frontend en producción.
- Si usas un servicio que te da la URL del frontend (ej. Vercel, Netlify), puedes usar una variable de entorno para el origen permitido y configurar CORS en `server/server.js` para que use esa variable en lugar de `*`.

*(Si quieres, en un siguiente paso se puede añadir en el código la opción de configurar el origen CORS por variable de entorno.)*

---

## 5. Seguridad rápida

- **Nunca** subas `.env` o `server/.env` al repositorio. Deben estar en `.gitignore`.
- En producción, servir todo por **HTTPS** (frontend y backend).
- Las claves **secretas** (`sk_live_...`, `SMTP_MAIL_APP_PASSWORD`, etc.) solo en el **servidor**; en el frontend solo la clave **pública** de Stripe (`pk_live_...`).

---

## 6. Resumen de archivos a tocar en producción

| Dónde | Qué hacer |
|-------|-----------|
| **Raíz del proyecto** (frontend) | `.env`: poner `VITE_BACKEND_URL` y `VITE_STRIPE_PUBLISHABLE_KEY` con valores de producción. Luego `npm run build`. |
| **Carpeta `server`** (backend) | `server/.env`: poner `STRIPE_SECRET_KEY`, `FRONTEND_URL`, `PORT` (y opcionalmente `STRIPE_WEBHOOK_SECRET`). Mantener `SMTP_MAIL_USER` y `SMTP_MAIL_APP_PASSWORD`. |
| **Hosting frontend** | Subir el resultado de `npm run build` (carpeta `dist`) y configurar la URL del backend si la plataforma usa variables de entorno. |
| **Hosting backend** | Subir el contenido de `server/`, instalar dependencias (`npm install`), configurar variables de entorno y arrancar con `npm start` (o el comando que use tu plataforma). |

---

## 7. Checklist antes de dar por cerrada la producción

- [ ] `VITE_BACKEND_URL` apunta a la URL pública del backend (HTTPS).
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` es la clave **live** de Stripe (`pk_live_...`).
- [ ] En `server/.env`: `STRIPE_SECRET_KEY` es la clave **live** (`sk_live_...`).
- [ ] En `server/.env`: `FRONTEND_URL` es la URL pública del frontend (HTTPS).
- [ ] Frontend y backend se sirven por HTTPS.
- [ ] Probado: registro de usuario → llega correo de bienvenida.
- [ ] Probado: “Olvidé mi contraseña” → llega correo y el enlace abre tu sitio en producción y permite cambiar contraseña.
- [ ] Probado: un pago de prueba en modo live (o desactivar pagos hasta estar listos).

---

Puedes dejar todo en localhost para las pruebas y, cuando vayas a producción, aplicar solo los cambios de este documento.
