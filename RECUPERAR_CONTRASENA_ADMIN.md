# Recuperar contraseña de administrador

Si olvidaste la contraseña del panel de administración y **no te llegó el correo** de restablecimiento, puedes hacer lo siguiente.

## 1. Revisar que el correo esté configurado

El enlace de “Olvidé mi contraseña” **solo envía el email** si el servidor tiene configurado correo:

- **MailerSend:** `MAILERSEND_API_KEY` (y opcionalmente `MAILERSEND_FROM_EMAIL`) en `server/.env`
- **Gmail SMTP:** `SMTP_MAIL_USER` y `SMTP_MAIL_APP_PASSWORD` en `server/.env`

Si no está configurado, al solicitar el restablecimiento el servidor mostrará en consola:

`⚠️ Correo no configurado: no se envía enlace de restablecimiento de administrador a ...`

**Solución:** Configura una de las dos opciones en `server/.env` (ver `server/.env.example`), reinicia el servidor y vuelve a pedir “Enviar enlace” en la pantalla de olvidé contraseña.

---

## 2. Restablecer sin correo (clave secreta)

Si no puedes o no quieres usar correo, puedes restablecer la contraseña con una **clave secreta** que solo tú conoces.

### Paso 1: Definir la clave en el servidor

En `server/.env` añade (o descomenta y cambia el valor):

```env
ADMIN_RESET_SECRET=una_frase_o_clave_larga_y_secreta
```

Reinicia el servidor.

### Paso 2: Llamar al endpoint

Desde tu máquina (Postman, curl o similar), envía un **POST** al backend:

**URL:** `https://tu-api.com/api/auth/admin/force-reset-password`  
(o en local: `http://localhost:3002/api/auth/admin/force-reset-password`)

**Headers:** `Content-Type: application/json`

**Body (JSON):**

```json
{
  "email": "info@estudiopopnest.com",
  "newPassword": "TuNuevaContraseñaSegura",
  "secret": "una_frase_o_clave_larga_y_secreta"
}
```

El valor de `secret` debe ser **exactamente** el mismo que pusiste en `ADMIN_RESET_SECRET`.

Ejemplo con **curl** (reemplaza la URL y los valores):

```bash
curl -X POST https://tu-api.com/api/auth/admin/force-reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"info@estudiopopnest.com","newPassword":"TuNuevaContraseña","secret":"tu_ADMIN_RESET_SECRET"}'
```

Si todo va bien, la respuesta dirá que la contraseña fue actualizada. Después puedes entrar al panel con ese correo y la nueva contraseña.

---

## 3. Cambiar la contraseña editando el archivo (solo con acceso al servidor)

Si tienes acceso al servidor donde corre el backend:

1. Abre el archivo `server/admins.json`.
2. Localiza el administrador por su `email`.
3. Cambia el valor de `password` por la nueva contraseña en texto plano.
4. Guarda el archivo (no hace falta reiniciar el servidor para el próximo login).

**Importante:** No subas `admins.json` a un repositorio público; suele estar en `.gitignore`.
