# Instalación de Stripe

## Error actual

Si ves el error: `Failed to resolve import "@stripe/stripe-js"`, es porque el paquete no está instalado.

## Solución

### Opción 1: Instalar Stripe (Recomendado)

Ejecuta en la terminal:

```bash
npm install @stripe/stripe-js
```

Luego reinicia el servidor de desarrollo:

```bash
npm run dev
```

### Opción 2: Continuar sin Stripe (Modo desarrollo)

El código está diseñado para funcionar sin Stripe instalado. El sistema funcionará en "modo simulación" donde:

- Las reservas se guardan normalmente
- Los pagos se marcan como "simulados"
- Puedes ver todas las reservas en el panel de administración
- Cuando instales Stripe, los pagos reales funcionarán automáticamente

## Configuración después de instalar

1. Crea el archivo `.env`:
   ```bash
   cp .env.example .env
   ```

2. Agrega tu clave pública de Stripe en `.env`:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_aqui
   ```

3. Reinicia el servidor

## Ver más información

Consulta `STRIPE_SETUP.md` para instrucciones completas de configuración.
