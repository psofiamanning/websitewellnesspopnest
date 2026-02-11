// Script de prueba rápida para verificar que el servidor funciona
import fetch from 'node-fetch'

const BASE_URL = 'http://localhost:3002'

async function testServer() {
  console.log('🧪 Probando servidor...\n')
  
  try {
    // Test 1: Ruta raíz
    console.log('1. Probando ruta raíz (/)...')
    const rootResponse = await fetch(`${BASE_URL}/`)
    const rootData = await rootResponse.json()
    console.log('✅ Ruta raíz:', rootData.message || 'OK')
    
    // Test 2: Health check
    console.log('\n2. Probando /api/health...')
    const healthResponse = await fetch(`${BASE_URL}/api/health`)
    const healthData = await healthResponse.json()
    console.log('✅ Health check:', healthData.status)
    
    // Test 3: Bookings
    console.log('\n3. Probando /api/bookings...')
    const bookingsResponse = await fetch(`${BASE_URL}/api/bookings`)
    const bookingsData = await bookingsResponse.json()
    console.log('✅ Bookings:', Array.isArray(bookingsData) ? `${bookingsData.length} reservas` : 'OK')
    
    console.log('\n✅ Todos los tests pasaron!')
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n💡 Asegúrate de que el servidor esté corriendo:')
    console.log('   cd server && node server.js')
  }
}

testServer()
