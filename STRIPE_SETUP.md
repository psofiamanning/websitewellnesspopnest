# Configuración de Stripe

## Pasos para configurar Stripe

### 1. Obtener las claves de Stripe

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/)
2. Inicia sesión en tu cuenta
3. Ve a **Developers** > **API keys**
4. Copia tu **Publishable key** (clave pública)
   - Para desarrollo: usa la clave que empieza con `pk_test_`
   - Para producción: usa la clave que empieza con `pk_live_`

### 2. Configurar las variables de entorno

1. Crea un archivo `.env` en la raíz del proyecto (copia de `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` y agrega tu clave pública de Stripe:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_aqui
   ```

### 3. Instalar dependencias

```bash
npm install @stripe/stripe-js
```

### 4. Reiniciar el servidor de desarrollo

Después de crear el archivo `.env`, reinicia el servidor:
```bash
npm run dev
```

### 5. Acceder al panel de administración

Una vez configurado, puedes acceder al panel de administración en:
- URL: `/admin` o haciendo clic en "Admin" en el menú de navegación
- Muestra todas las reservas con información completa:
  - Información de Stripe (Payment Intent ID)
  - Fecha y hora de la reserva
  - Datos del cliente (nombre, apellido, email, teléfono)
  - Información de pago (monto, estado, tarjeta)

## Estructura de datos guardada

Cada reserva guarda la siguiente información:

### Información de la reserva:
- Tipo (profesor/clase)
- Nombre de la clase/profesor
- Fecha y hora de la reserva
- Fecha de creación

### Información del cliente:
- Nombre
- Apellido
- Email
- Teléfono
- Nombre completo

### Información de pago Stripe:
- Payment Intent ID (para verificar en Stripe Dashboard)
- Client Secret
- Monto y moneda
- Estado del pago (succeeded/pending)
- Método de pago
- Últimos 4 dígitos de la tarjeta
- Mensaje de error (si aplica)

## Panel de Administración

El panel de administración (`/admin`) incluye:

### Funcionalidades:
- **Búsqueda**: Por nombre, email, teléfono o clase
- **Filtro por fecha**: Ver reservas de una fecha específica
- **Estadísticas**: Total de reservas, reservas filtradas, ingresos totales
- **Vista detallada**: Click en cualquier reserva para ver todos los detalles
- **Información de Stripe**: Payment Intent ID visible para verificar en Stripe Dashboard

### Información mostrada:
- Estado del pago (Pagado/Pendiente)
- Datos completos del cliente
- Información de la clase/profesor
- Detalles del pago con Stripe
- Timestamp de creación

## Notas importantes

⚠️ **Seguridad:**
- Nunca expongas tu **Secret Key** en el frontend
- Solo usa la **Publishable Key** en el código del cliente
- En producción, crea un backend para manejar Payment Intents de forma segura
- Las tarjetas de prueba de Stripe funcionan en modo test

🔒 **Datos sensibles:**
- No se guarda información completa de la tarjeta
- Solo se guardan los últimos 4 dígitos
- El Payment Intent ID permite verificar el pago completo en Stripe Dashboard
- Los datos se guardan en localStorage (en producción, usa una base de datos)

## Próximos pasos para producción

1. **Crear un backend** que:
   - Maneje la creación de Payment Intents usando tu Secret Key
   - Procese los webhooks de Stripe
   - Guarde las reservas en una base de datos

2. **Configurar webhooks** en Stripe Dashboard para:
   - Confirmar pagos exitosos
   - Manejar fallos de pago
   - Actualizar estados de reservas

3. **Reemplazar localStorage** con una base de datos real

4. **Usar claves de producción** (`pk_live_` y `sk_live_`)
