# Backend - Estudio Popnest Wellness

Backend Express para manejar pagos con Stripe y reservas de forma segura.

## Instalación

```bash
cd server
npm install
```

## Configuración

1. Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Edita `.env` y agrega tu **Stripe Secret Key**:
```env
STRIPE_SECRET_KEY=sk_test_tu_secret_key_aqui
PORT=3000
```

## Ejecutar

### Desarrollo (con auto-reload):
```bash
npm run dev
```

### Producción:
```bash
npm start
```

El servidor correrá en `http://localhost:3000`

## Endpoints

### POST `/api/create-payment-intent`
Crea un Payment Intent con Stripe.

**Body:**
```json
{
  "amount": 50000,
  "currency": "mxn",
  "customerInfo": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "phone": "+525512345678"
  }
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 50000,
  "currency": "mxn",
  "status": "requires_payment_method"
}
```

### POST `/api/confirm-booking`
Confirma una reserva después de un pago exitoso.

**Body:**
```json
{
  "paymentIntentId": "pi_xxx",
  "bookingData": { ... }
}
```

### GET `/api/bookings`
Obtiene todas las reservas.

### GET `/api/bookings/:id`
Obtiene una reserva específica por ID.

### POST `/api/webhook`
Webhook de Stripe para eventos de pago (configurar en Stripe Dashboard).

### GET `/api/health`
Health check del servidor.

## Webhooks de Stripe

Para recibir eventos de Stripe en producción:

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Agrega un endpoint: `https://tu-dominio.com/api/webhook`
3. Selecciona los eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copia el Webhook Secret y agrégalo a `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Desarrollo Local con Stripe CLI

Para probar webhooks localmente:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

Esto te dará un webhook secret que puedes usar en desarrollo.
