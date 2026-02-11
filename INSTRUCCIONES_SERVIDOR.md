# Instrucciones para Iniciar el Servidor

## Requisitos Previos

- Node.js instalado (versión 14 o superior)
- npm instalado (viene con Node.js)

## Pasos para Iniciar el Servidor

### 1. Navegar a la carpeta del servidor

```bash
cd server
```

### 2. Instalar dependencias (si aún no están instaladas)

```bash
npm install
```

Esto instalará todas las dependencias necesarias:
- express
- cors
- dotenv
- stripe
- body-parser

### 3. Configurar variables de entorno

Copia el archivo de ejemplo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Luego edita el archivo `.env` y agrega tu clave secreta de Stripe:

```env
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui
PORT=3000
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui  # Opcional para producción
```

**Nota:** Puedes obtener tu clave secreta de Stripe en: https://dashboard.stripe.com/apikeys

### 4. Iniciar el servidor

#### Opción A: Directamente con Node.js (más simple)
```bash
node server.js
```

#### Opción B: Modo desarrollo (con auto-reload)
```bash
npm run dev
```

#### Opción C: Modo producción
```bash
npm start
```

### 5. Verificar que el servidor está corriendo

Deberías ver un mensaje similar a:

```
🚀 Server running on http://localhost:3000
📝 Bookings file: /ruta/al/proyecto/server/bookings.json
👥 Users file: /ruta/al/proyecto/server/users.json
```

Si no tienes configurada la clave de Stripe, verás una advertencia:
```
⚠️  STRIPE_SECRET_KEY not set. Stripe features will not work.
```

## Endpoints Disponibles

Una vez iniciado el servidor, estarán disponibles los siguientes endpoints:

- `GET http://localhost:3000/api/health` - Verificar estado del servidor
- `POST http://localhost:3000/api/create-payment-intent` - Crear intención de pago
- `POST http://localhost:3000/api/confirm-payment` - Confirmar pago
- `POST http://localhost:3000/api/confirm-booking` - Confirmar reserva
- `POST http://localhost:3000/api/bookings` - Crear reserva
- `GET http://localhost:3000/api/bookings` - Obtener todas las reservas
- `GET http://localhost:3000/api/bookings/:id` - Obtener reserva por ID
- `GET http://localhost:3000/api/bookings/availability/:className/:date/:time` - Verificar disponibilidad
- `POST http://localhost:3000/api/auth/signup` - Registro de usuario
- `POST http://localhost:3000/api/auth/login` - Inicio de sesión
- `POST http://localhost:3000/api/packages/purchase` - Comprar paquete
- `GET http://localhost:3000/api/packages` - Obtener todos los paquetes
- `GET http://localhost:3000/api/packages/user/:email` - Obtener paquetes de un usuario
- `POST http://localhost:3000/api/webhook` - Webhook de Stripe

## Solución de Problemas

### Error: "Cannot find module"
Ejecuta `npm install` en la carpeta `server/` para instalar las dependencias.

### Error: "Port 3000 is already in use"
Cambia el puerto en el archivo `.env`:
```env
PORT=3001
```

### Error relacionado con Stripe
Asegúrate de que:
1. Tu clave secreta de Stripe esté correctamente configurada en `.env`
2. Estés usando una clave de prueba (`sk_test_...`) para desarrollo
3. La clave no tenga espacios adicionales

### El servidor no responde
1. Verifica que el servidor esté corriendo revisando la consola
2. Prueba acceder a `http://localhost:3000/api/health` en tu navegador
3. Verifica que no haya errores en la consola del servidor

## Archivos Generados

El servidor creará automáticamente los siguientes archivos JSON para almacenar datos:

- `server/bookings.json` - Almacena todas las reservas
- `server/users.json` - Almacena todos los usuarios registrados
- `server/packages.json` - Almacena todas las compras de paquetes

Estos archivos se crean automáticamente la primera vez que se guarda un dato.

## Detener el Servidor

Para detener el servidor, presiona `Ctrl + C` en la terminal donde está corriendo.
