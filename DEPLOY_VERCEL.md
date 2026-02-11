# Conectar GitHub y desplegar en Vercel (popnest.app)

## 1. Crear el repositorio en GitHub

1. Entra en **[github.com/new](https://github.com/new)** (o GitHub → **+** → **New repository**).
2. **Repository name:** por ejemplo `estudio-popnest-wellness` o `popnest-app`.
3. **Public**. No marques "Add a README" (ya tienes código local).
4. Clic en **Create repository**.

---

## 2. Enlazar tu proyecto local y hacer push

En la terminal, desde la raíz del proyecto:

```bash
cd /Users/psmanningruiz/Documents/2026Projects/EstudioPopnestWellness

# Sustituye TU_USUARIO y NOMBRE_REPO por tu usuario de GitHub y el nombre del repo
git remote add origin https://github.com/TU_USUARIO/NOMBRE_REPO.git

git push -u origin main
```

Si GitHub te pide autenticación, usa un **Personal Access Token** (Settings → Developer settings → Personal access tokens) como contraseña, o configura SSH.

---

## 3. Conectar el repo a Vercel

1. Entra en **[vercel.com/popnest-wellness](https://vercel.com/popnest-wellness)** (o tu equipo en Vercel).
2. **Add New…** → **Project**.
3. **Import Git Repository** → **Continue with GitHub** (y autoriza si es la primera vez).
4. Elige el repositorio que acabas de crear.
5. En **Configure Project**:
   - **Framework Preset:** Vite (debería detectarse).
   - **Root Directory:** vacío (el frontend está en la raíz).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. **Environment Variables** (añade antes de desplegar):
   - `VITE_BACKEND_URL` → `https://api.popnest.app` (o la URL de tu API cuando esté desplegada).
   - `VITE_STRIPE_PUBLISHABLE_KEY` → tu clave pública de Stripe (ej. `pk_live_...`).
7. **Deploy**.

Cada push a `main` hará un nuevo deploy automático.

---

## 4. Añadir el dominio popnest.app en Vercel

1. En Vercel: tu proyecto → **Settings** → **Domains**.
2. Añade **popnest.app** (y opcionalmente **www.popnest.app**).
3. En el panel de tu dominio (donde gestionas DNS de popnest.app), crea los registros que Vercel te indique (normalmente **A** o **CNAME**).

Cuando el DNS propague, la app se servirá en **https://popnest.app**.
