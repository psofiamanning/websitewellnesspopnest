import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Configuración para manejar módulos opcionales como Stripe
  resolve: {
    alias: {
      // Permitir que Stripe sea opcional - si no existe, se manejará en runtime
    }
  }
})
