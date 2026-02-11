# Cambiar a Stripe Production Keys

## ⚠️ IMPORTANTE
- Las keys de producción procesan pagos REALES
- Asegúrate de tener las keys correctas de tu cuenta de Stripe
- Las keys de producción empiezan con `pk_live_` y `sk_live_`

## Pasos para cambiar a producción

### 1. Obtener las keys de producción desde Stripe Dashboard
1. Ve a https://dashboard.stripe.com/apikeys
2. Asegúrate de estar en modo "Live" (no "Test")
3. Copia tu **Publishable key** (empieza con `pk_live_`)
4. Copia tu **Secret key** (empieza con `sk_live_`)

### 2. Actualizar `.env` (Frontend)
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_TU_PUBLISHABLE_KEY_AQUI
VITE_BACKEND_URL=http://localhost:3002
```

### 3. Actualizar `server/.env` (Backend)
```bash
STRIPE_SECRET_KEY=sk_live_TU_SECRET_KEY_AQUI
PORT=3002
```

### 4. Reiniciar ambos servidores
- Frontend: Reinicia el servidor de desarrollo (npm run dev)
- Backend: Reinicia el servidor Node.js (node server.js)

## Verificación
Después de cambiar las keys, verifica:
1. El servidor backend muestra "✅ PaymentIntent creado" sin errores
2. El frontend carga el CardElement sin errores
3. Puedes hacer una transacción de prueba (pero será REAL, no de prueba)

## Nota sobre tarjetas de prueba
Con keys de producción, las tarjetas de prueba (como 4242 4242 4242 4242) NO funcionarán.
Necesitarás usar tarjetas reales para probar.
