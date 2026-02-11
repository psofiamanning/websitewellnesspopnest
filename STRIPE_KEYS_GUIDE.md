# Guía para Obtener tu Clave de Stripe

## ¿Qué clave necesitas?

Necesitas la **Publishable Key** (Clave Pública) de Stripe. Esta es la clave que se usa en el frontend y es segura de exponer públicamente.

⚠️ **IMPORTANTE**: Nunca uses tu **Secret Key** (Clave Secreta) en el frontend. Esa clave solo debe usarse en el backend.

## Pasos para obtener tu Publishable Key

### 1. Accede a tu cuenta de Stripe

1. Ve a [https://dashboard.stripe.com/](https://dashboard.stripe.com/)
2. Inicia sesión con tu cuenta

### 2. Navega a las API Keys

1. En el menú lateral izquierdo, haz clic en **"Developers"** (o "Desarrolladores")
2. Luego haz clic en **"API keys"** (o "Claves API")

### 3. Encuentra tu Publishable Key

Verás dos tipos de claves:

#### **Modo Test (Desarrollo)**
- **Publishable key**: Empieza con `pk_test_...`
- **Secret key**: Empieza con `sk_test_...` (NO uses esta en el frontend)

#### **Modo Live (Producción)**
- **Publishable key**: Empieza con `pk_live_...`
- **Secret key**: Empieza con `sk_live_...` (NO uses esta en el frontend)

### 4. Copia tu Publishable Key

1. En la sección **"Test mode"** (o "Modo de prueba"), encuentra la **"Publishable key"**
2. Haz clic en el botón **"Reveal test key"** (o "Revelar clave de prueba") si está oculta
3. Copia la clave completa (debe empezar con `pk_test_`)

### 5. Configura en tu proyecto

1. Crea el archivo `.env` en la raíz del proyecto:
   ```bash
   cp .env.example .env
   ```

2. Abre el archivo `.env` y pega tu clave:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_completa_aqui
   ```

3. Guarda el archivo

4. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Ejemplo de cómo se ve

Tu archivo `.env` debería verse así:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdefghijklmnopqrstuvwxyz
```

## Verificación

Una vez configurado, puedes verificar que funciona:
1. Abre la consola del navegador (F12)
2. Intenta hacer una reserva
3. Si ves mensajes sobre Stripe cargándose, está funcionando
4. Si ves advertencias sobre la clave no configurada, verifica que el archivo `.env` esté correcto

## Notas importantes

- ✅ **SÍ puedes compartir** tu Publishable Key públicamente
- ❌ **NUNCA compartas** tu Secret Key
- 🔒 La Secret Key solo se usa en el backend (servidor)
- 🧪 Usa claves de **test** para desarrollo
- 🚀 Usa claves de **live** solo en producción

## Tarjetas de prueba de Stripe

Para probar pagos en modo test, puedes usar estas tarjetas:

- **Tarjeta exitosa**: `4242 4242 4242 4242`
- **Tarjeta rechazada**: `4000 0000 0000 0002`
- **Cualquier fecha futura**: `12/34`
- **Cualquier CVV**: `123`

Más tarjetas de prueba en: https://stripe.com/docs/testing
