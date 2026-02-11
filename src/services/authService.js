// Servicio de autenticación
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002'

// Guardar token en localStorage
const saveToken = (token) => {
  localStorage.setItem('auth_token', token)
}

// Obtener token de localStorage
export const getToken = () => {
  return localStorage.getItem('auth_token')
}

// Obtener usuario actual
export const getCurrentUser = () => {
  const token = getToken()
  if (!token) {
    console.log('No hay token disponible')
    return null
  }
  
  try {
    // Decodificar el token (formato simple base64)
    // El token puede ser solo base64 o tener formato JWT con puntos
    let payload
    if (token.includes('.')) {
      // Formato JWT estándar
      payload = JSON.parse(atob(token.split('.')[1]))
    } else {
      // Formato simple base64
      payload = JSON.parse(atob(token))
    }
    
    const user = payload.user || null
    if (user) {
      console.log('✅ Usuario decodificado del token:', {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        phoneType: typeof user.phone,
        phoneExists: user.phone !== undefined && user.phone !== null && user.phone !== ''
      })
    }
    return user
  } catch (error) {
    console.error('❌ Error decoding token:', error)
    console.error('Token que causó el error:', token.substring(0, 50) + '...')
    return null
  }
}

// Verificar si el usuario está autenticado
export const isAuthenticated = () => {
  return !!getToken()
}

// Cerrar sesión
export const logout = () => {
  localStorage.removeItem('auth_token')
  window.location.href = '/'
}

// Registro de usuario
export const signup = async (userData) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    })

    // Verificar si la respuesta es JSON antes de parsear
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('Respuesta no JSON recibida:', text.substring(0, 200))
      return {
        success: false,
        error: 'El servidor devolvió una respuesta inválida. Por favor verifica que el backend esté corriendo en http://localhost:3002'
      }
    }

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Error al registrarse'
      }
    }

    // Si el servidor devuelve un token, guardarlo
    if (data.token) {
      saveToken(data.token)
      // Verificar que el token se decodifique correctamente
      const decodedUser = getCurrentUser()
      console.log('✅ Usuario después del registro (desde token):', decodedUser)
      console.log('✅ Teléfono después del registro:', decodedUser?.phone || 'NO ENCONTRADO')
      
      // Si el teléfono no está en el token pero está en la respuesta del servidor, actualizar
      if (!decodedUser?.phone && data.user?.phone) {
        console.warn('⚠️ Teléfono no está en el token pero está en la respuesta del servidor')
        console.warn('⚠️ Esto puede indicar un problema con la generación del token')
      }
    }

    return {
      success: true,
      user: data.user,
      token: data.token
    }
  } catch (error) {
    console.error('Error en signup:', error)
    // Si el error es de parsing JSON, el servidor probablemente devolvió HTML
    if (error.message && error.message.includes('JSON')) {
      return {
        success: false,
        error: 'Error de conexión con el servidor. Por favor verifica que el backend esté corriendo en http://localhost:3002'
      }
    }
    return {
      success: false,
      error: error.message || 'Error de conexión. Por favor intenta de nuevo.'
    }
  }
}

// Establecer contraseña para usuarios auto-creados
export const setPassword = async (email, password) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/set-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Error al establecer contraseña'
      }
    }

    // Guardar token
    if (data.token) {
      saveToken(data.token)
    }

    return {
      success: true,
      user: data.user,
      token: data.token,
      message: data.message
    }
  } catch (error) {
    console.error('Error setting password:', error)
    return {
      success: false,
      error: error.message || 'Error de conexión. Por favor intenta de nuevo.'
    }
  }
}

// Solicitar restablecimiento de contraseña (envía correo con enlace)
export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() })
    })
    const data = await response.json()
    if (!response.ok) {
      return { success: false, error: data.error || 'Error al enviar el correo' }
    }
    return { success: true, message: data.message }
  } catch (err) {
    console.error('Error in forgotPassword:', err)
    return { success: false, error: err.message || 'Error de conexión. Intenta de nuevo.' }
  }
}

// Restablecer contraseña con el token del correo
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    })
    const data = await response.json()
    if (!response.ok) {
      return { success: false, error: data.error || 'Error al restablecer contraseña' }
    }
    return { success: true, message: data.message }
  } catch (err) {
    console.error('Error in resetPassword:', err)
    return { success: false, error: err.message || 'Error de conexión. Intenta de nuevo.' }
  }
}

// --- Administrador: olvidé mi contraseña ---
export const adminForgotPassword = async (email) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/admin/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() })
    })
    const data = await response.json()
    if (!response.ok) {
      return { success: false, error: data.error || 'Error al enviar el correo' }
    }
    return { success: true, message: data.message }
  } catch (err) {
    console.error('Error in adminForgotPassword:', err)
    return { success: false, error: err.message || 'Error de conexión. Intenta de nuevo.' }
  }
}

export const adminResetPassword = async (token, newPassword) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/admin/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    })
    const data = await response.json()
    if (!response.ok) {
      return { success: false, error: data.error || 'Error al restablecer contraseña' }
    }
    return { success: true, message: data.message }
  } catch (err) {
    console.error('Error in adminResetPassword:', err)
    return { success: false, error: err.message || 'Error de conexión. Intenta de nuevo.' }
  }
}

// Inicio de sesión
export const login = async (email, password) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password: password || '' })
    })

    const data = await response.json()

    // Si el usuario necesita establecer contraseña
    if (data.needsPassword) {
      return {
        success: false,
        needsPassword: true,
        message: data.message,
        user: data.user
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Error al iniciar sesión'
      }
    }

    // Guardar token
    if (data.token) {
      saveToken(data.token)
    }

    return {
      success: true,
      user: data.user,
      token: data.token
    }
  } catch (error) {
    console.error('Error en login:', error)
    // Si el error es de parsing JSON, puede ser que el servidor devolvió HTML
    if (error.message && error.message.includes('JSON')) {
      return {
        success: false,
        error: 'Error de conexión con el servidor. Por favor verifica que el backend esté corriendo.'
      }
    }
    return {
      success: false,
      error: error.message || 'Error de conexión. Por favor intenta de nuevo.'
    }
  }
}
