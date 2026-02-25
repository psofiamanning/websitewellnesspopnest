const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002'

export const getTeacherToken = () => localStorage.getItem('teacher_token')
export const getTeacherName = () => localStorage.getItem('teacher_name')
export const isTeacherAuthenticated = () => !!getTeacherToken()

export const teacherLogout = () => {
  localStorage.removeItem('teacher_token')
  localStorage.removeItem('teacher_name')
  localStorage.removeItem('teacher_id')
  window.location.href = '/maestras/login'
}

/** Obtiene las reservas confirmadas de las próximas clases de la maestra logueada */
export const getTeacherUpcomingBookings = async () => {
  const token = getTeacherToken()
  if (!token) throw new Error('No hay sesión de maestra')
  const response = await fetch(`${BACKEND_URL}/api/bookings/teacher/upcoming`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Error al cargar las reservas')
  }
  return response.json()
}
