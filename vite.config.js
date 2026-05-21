import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  ssr: {
    // Evita import de directorio date-fns/locale al ejecutar el bundle SSR en Node.
    noExternal: ['date-fns'],
  },
  // Siempre el mismo puerto: si 5173 está ocupado, Vite falla en vez de saltar a 5174
  // (así no abres por error la URL vieja). Libera el puerto: lsof -ti :5173 | xargs kill
  server: {
    port: 5173,
    strictPort: true,
  },
  // Configuración para manejar módulos opcionales como Stripe
  resolve: {
    alias: {
      // Permitir que Stripe sea opcional - si no existe, se manejará en runtime
    }
  }
})
