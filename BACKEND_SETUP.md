# Guía Rápida: Configurar el Backend

## Paso 1: Instalar dependencias del backend

```bash
cd server
npm install
```

## Paso 2: Configurar Stripe Secret Key

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copia tu **Secret Key** (empieza con `sk_test_...` para desarrollo)
3. Crea el archivo `.env` en la carpeta `server/`:
```bash
cd server
cp .env.example .env
```

4. Edita `server/.env` y agrega tu Secret Key:
```env
STRIPE_SECRET_KEY=sk_test_tu_secret_key_aqui
PORT=3000
```

## Paso 3: Ejecutar el backend

```bash
cd server
npm run dev
```

El servidor correrá en `http://localhost:3000`

## Paso 4: Ejecutar el frontend (en otra terminal)

```bash
npm run dev
```

El frontend correrá en `http://localhost:5173` (o el puerto que Vite asigne)

## Verificar que funciona

1. Abre el frontend en el navegador
2. Intenta hacer una reserva
3. Revisa la consola del backend - deberías ver logs de las peticiones
4. Los pagos se procesarán con Stripe real

## Estructura

```
estudio-popnest-wellness/
├── server/              # Backend Express
│   ├── server.js        # Servidor principal
│   ├── package.json     # Dependencias del backend
│   ├── .env             # Variables de entorno (crear)
│   └── bookings.json    # Base de datos (se crea automáticamente)
├── src/                 # Frontend React
└── .env                 # Variables de entorno del frontend
```

## Notas

- El backend guarda las reservas en `server/bookings.json`
- Los pagos se procesan con Stripe real usando tu Secret Key
- El frontend se conecta al backend automáticamente
- Si el backend no está disponible, el frontend usa localStorage como fallback
