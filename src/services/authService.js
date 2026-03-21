// Servicio de autenticación (token JWT de Supabase Auth vía backend o sesión en cliente)
import { supabase } from '../lib/supabaseClient.js'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002'

const saveToken = (token) => {
  if (token) localStorage.setItem('auth_token', token)
}

export const getToken = () => {
  return localStorage.getItem('auth_token')
}

export const getCurrentUser = () => {
  const token = getToken()
  if (!token) return null

  try {
    if (token.includes('.')) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const meta = payload.user_metadata || {}
      return {
        id: payload.sub,
        email: payload.email,
        firstName: meta.first_name || meta.firstName || '',
        lastName: meta.last_name || meta.lastName || '',
        phone: meta.phone != null ? String(meta.phone) : '',
      }
    }
    const payload = JSON.parse(atob(token))
    return payload.user || null
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

export const isAuthenticated = () => {
  return !!getToken()
}

export const logout = () => {
  localStorage.removeItem('auth_token')
  if (supabase) supabase.auth.signOut().catch(() => {})
  window.location.href = '/'
}

export const signup = async (userData) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('Respuesta no JSON:', text.substring(0, 200))
      return {
        success: false,
        error: 'El servidor devolvió una respuesta inválida. Verifica el backend.',
      }
    }

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || 'Error al registrarse' }
    }

    if (data.token) {
      saveToken(data.token)
    }

    return {
      success: true,
      user: data.user,
      token: data.token,
      message: data.message,
    }
  } catch (error) {
    console.error('Error en signup:', error)
    return {
      success: false,
      error: error.message || 'Error de conexión. Por favor intenta de nuevo.',
    }
  }
}

export const setPassword = async () => ({
  success: false,
  error: 'Usa «Olvidé mi contraseña» para restablecer tu acceso.',
})

export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
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

export const resetPassword = async (_token, newPassword) => {
  if (!supabase) {
    return { success: false, error: 'Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.' }
  }
  const { data: { session }, error: sErr } = await supabase.auth.getSession()
  if (sErr || !session) {
    return {
      success: false,
      error:
        'Abre esta página desde el enlace del correo de recuperación (misma ventana) o solicita un nuevo enlace.',
    }
  }
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) {
    return { success: false, error: error.message || 'No se pudo actualizar la contraseña' }
  }
  saveToken(session.access_token)
  return { success: true, message: 'Contraseña actualizada.' }
}

export const adminForgotPassword = async (email) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/admin/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
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
      body: JSON.stringify({ token, newPassword }),
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

export const login = async (email, password) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: password || '' }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Error al iniciar sesión',
      }
    }

    if (data.token) {
      saveToken(data.token)
    }

    return {
      success: true,
      user: data.user,
      token: data.token,
    }
  } catch (error) {
    console.error('Error en login:', error)
    return {
      success: false,
      error: error.message || 'Error de conexión. Por favor intenta de nuevo.',
    }
  }
}
