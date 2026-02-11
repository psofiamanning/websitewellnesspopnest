import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBookings } from '../services/bookingService'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002'

// Verificar si el usuario es administrador
const isAdminAuthenticated = () => {
  return !!localStorage.getItem('admin_token')
}

// Cerrar sesión de administrador
const adminLogout = () => {
  localStorage.removeItem('admin_token')
  window.location.href = '/admin/login'
}

function Admin() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [packages, setPackages] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [filteredPackages, setFilteredPackages] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [bookingsViewMode, setBookingsViewMode] = useState('class') // 'class' | 'teacher'
  const [selectedGroup, setSelectedGroup] = useState(null) // { type: 'class'|'teacher', name: string } | null
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [activeTab, setActiveTab] = useState('bookings') // 'bookings' o 'packages'

  useEffect(() => {
    // Verificar autenticación de administrador
    if (!isAdminAuthenticated()) {
      navigate('/admin/login')
      return
    }

    loadBookings()
    loadPackages()
  }, [navigate])

  useEffect(() => {
    filterBookings()
    filterPackages()
  }, [bookings, packages, searchTerm, filterDate])

  const loadBookings = async () => {
    try {
      const allBookings = await getBookings()
      // Ordenar por fecha más reciente primero
      const sorted = allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setBookings(sorted)
    } catch (error) {
      console.error('Error loading bookings:', error)
    }
  }

  const loadPackages = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/packages`)
      if (response.ok) {
        const allPackages = await response.json()
        // Ordenar por fecha más reciente primero
        const sorted = allPackages.sort((a, b) => new Date(b.createdAt || b.purchaseDate) - new Date(a.createdAt || a.purchaseDate))
        setPackages(sorted)
      }
    } catch (error) {
      console.error('Error loading packages:', error)
    }
  }

  const filterBookings = () => {
    let filtered = [...bookings]

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(booking => 
        booking.customer?.fullName?.toLowerCase().includes(term) ||
        booking.customer?.email?.toLowerCase().includes(term) ||
        booking.customer?.phone?.includes(term) ||
        booking.className?.toLowerCase().includes(term)
      )
    }

    // Filtrar por fecha
    if (filterDate) {
      filtered = filtered.filter(booking => booking.date === filterDate)
    }

    setFilteredBookings(filtered)
  }

  // Reservas filtradas por fecha (y opcionalmente por búsqueda)
  let bookingsByDate = filterDate
    ? bookings.filter(b => b.date === filterDate)
    : []
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase().trim()
    bookingsByDate = bookingsByDate.filter(b =>
      b.customer?.fullName?.toLowerCase().includes(term) ||
      b.customer?.email?.toLowerCase().includes(term) ||
      b.customer?.phone?.includes(term) ||
      b.className?.toLowerCase().includes(term) ||
      b.teacherName?.toLowerCase().includes(term)
    )
  }

  // Agrupar por clase
  const byClass = bookingsByDate.reduce((acc, b) => {
    const key = b.className || 'Sin clase'
    if (!acc[key]) acc[key] = []
    acc[key].push(b)
    return acc
  }, {})

  // Agrupar por profesor
  const byTeacher = bookingsByDate.reduce((acc, b) => {
    const key = b.teacherName || 'Sin profesor'
    if (!acc[key]) acc[key] = []
    acc[key].push(b)
    return acc
  }, {})

  const groupList = bookingsViewMode === 'class'
    ? Object.entries(byClass).map(([name, list]) => ({ type: 'class', name, bookings: list }))
    : Object.entries(byTeacher).map(([name, list]) => ({ type: 'teacher', name, bookings: list }))

  const selectedGroupBookings = selectedGroup
    ? (selectedGroup.type === 'class' ? byClass[selectedGroup.name] : byTeacher[selectedGroup.name]) || []
    : []

  const filterPackages = () => {
    let filtered = [...packages]

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(pkg => 
        pkg.customer?.fullName?.toLowerCase().includes(term) ||
        pkg.customer?.email?.toLowerCase().includes(term) ||
        pkg.customer?.phone?.includes(term) ||
        pkg.packageName?.toLowerCase().includes(term)
      )
    }

    setFilteredPackages(filtered)
  }

  // Obtener reservas que usaron un paquete específico
  const getBookingsForPackage = (packageId) => {
    return bookings.filter(booking => booking.packageId === packageId)
  }

  const formatCurrency = (amount, currency = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency
    }).format(amount / 100)
  }

  return (
    <div className="wellness-background min-h-screen">
      <div className="wellness-shapes">
        <div className="wellness-shape shape-1"></div>
        <div className="wellness-shape shape-2"></div>
        <div className="wellness-shape shape-3"></div>
        <div className="wellness-shape shape-4"></div>
        <div className="wellness-shape shape-5"></div>
      </div>
      
      <div className="wellness-content">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pt-24">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            {/* Header */}
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-h1 font-heading text-body mb-2">
                  Panel de Administración
                </h1>
                <p className="text-body font-body">
                  Gestión de reservas, paquetes y pagos
                </p>
              </div>
              <button
                onClick={adminLogout}
                className="px-4 py-2 rounded-lg font-body transition-all duration-300 text-white hover:bg-opacity-90"
                style={{ 
                  backgroundColor: '#B73D37',
                }}
              >
                Cerrar Sesión
              </button>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-neutral">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`px-4 py-2 font-body font-medium transition-colors ${
                    activeTab === 'bookings'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-body hover:text-primary'
                  }`}
                >
                  Reservas ({bookings.length})
                </button>
                <button
                  onClick={() => setActiveTab('packages')}
                  className={`px-4 py-2 font-body font-medium transition-colors ${
                    activeTab === 'packages'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-body hover:text-primary'
                  }`}
                >
                  Paquetes ({packages.length})
                </button>
              </div>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-body font-body font-medium mb-2">
                  Filtrar por fecha
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => {
                    setFilterDate(e.target.value)
                    setSelectedGroup(null)
                  }}
                  className="w-full px-4 py-2 rounded-lg border-2 border-neutral focus:border-primary focus:outline-none font-body text-body"
                />
              </div>
              <div>
                <label className="block text-body font-body font-medium mb-2">
                  Buscar (nombre, email, teléfono, clase)
                </label>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-neutral focus:border-primary focus:outline-none font-body text-body"
                />
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-quaternary rounded-lg p-4">
                <p className="text-body font-body text-sm mb-1">Total Reservas</p>
                <p className="text-h2 font-heading text-primary">{bookings.length}</p>
              </div>
              <div className="bg-quaternary rounded-lg p-4">
                <p className="text-body font-body text-sm mb-1">Total Paquetes</p>
                <p className="text-h2 font-heading text-primary">{packages.length}</p>
              </div>
              <div className="bg-quaternary rounded-lg p-4">
                <p className="text-body font-body text-sm mb-1">Ingresos por Clases</p>
                <p className="text-h2 font-heading text-primary">
                  {formatCurrency(bookings.filter(b => b.paymentMethod !== 'package').reduce((sum, b) => sum + (b.payment?.amount || 0), 0))}
                </p>
              </div>
              <div className="bg-quaternary rounded-lg p-4">
                <p className="text-body font-body text-sm mb-1">Ingresos por Paquetes</p>
                <p className="text-h2 font-heading text-primary">
                  {formatCurrency(packages.reduce((sum, p) => sum + (p.payment?.amount || 0), 0))}
                </p>
              </div>
            </div>

            {/* Contenido según tab activo */}
            {activeTab === 'bookings' ? (
              /* Reservas: filtrar por fecha → por clase o por profesor → detalle */
              <div className="space-y-6">
                {!filterDate ? (
                  <div className="text-center py-12 bg-quaternary rounded-lg">
                    <p className="text-body font-body">Selecciona una fecha para ver las reservas.</p>
                  </div>
                ) : (
                  <>
                    {/* Tabs Por clase / Por profesor (solo cuando hay fecha) */}
                    <div className="flex gap-2 border-b border-neutral pb-2">
                      <button
                        type="button"
                        onClick={() => { setBookingsViewMode('class'); setSelectedGroup(null) }}
                        className={`px-4 py-2 rounded-t-lg font-body font-medium transition-colors ${
                          bookingsViewMode === 'class'
                            ? 'bg-primary text-white'
                            : 'bg-quaternary text-body hover:bg-gray-200'
                        }`}
                        style={bookingsViewMode === 'class' ? { backgroundColor: '#B73D37' } : {}}
                      >
                        Por clase
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBookingsViewMode('teacher'); setSelectedGroup(null) }}
                        className={`px-4 py-2 rounded-t-lg font-body font-medium transition-colors ${
                          bookingsViewMode === 'teacher'
                            ? 'text-white'
                            : 'bg-quaternary text-body hover:bg-gray-200'
                        }`}
                        style={bookingsViewMode === 'teacher' ? { backgroundColor: '#B73D37' } : {}}
                      >
                        Por profesor
                      </button>
                    </div>

                    {selectedGroup ? (
                      /* Vista: lista de reservas del grupo seleccionado (click → detalle) */
                      <div>
                        <button
                          type="button"
                          onClick={() => setSelectedGroup(null)}
                          className="mb-4 text-body font-body hover:text-primary flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                          Volver
                        </button>
                        <h3 className="text-h3 font-heading text-body mb-4">
                          {selectedGroup.type === 'class' ? 'Clase' : 'Profesor'}: {selectedGroup.name}
                        </h3>
                        <div className="space-y-2">
                          {selectedGroupBookings.map((booking) => (
                            <div
                              key={booking.id}
                              onClick={() => setSelectedBooking(booking)}
                              className="flex items-center justify-between border-2 border-neutral rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                            >
                              <span className="font-body text-body">
                                {booking.customer?.firstName} {booking.customer?.lastName}
                              </span>
                              <span className="font-body text-body text-sm">{booking.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Vista: grupos (clase o profesor) con número de reservas y nombres */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {groupList.length === 0 ? (
                          <div className="col-span-2 text-center py-12">
                            <p className="text-body font-body">No hay reservas para esta fecha.</p>
                          </div>
                        ) : (
                          groupList.map((group) => (
                            <div
                              key={`${group.type}-${group.name}`}
                              onClick={() => setSelectedGroup({ type: group.type, name: group.name })}
                              className="border-2 border-neutral rounded-lg p-5 hover:border-primary transition-colors cursor-pointer"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="text-h3 font-heading text-body">{group.name}</h3>
                                <span className="px-3 py-1 rounded-full text-sm font-body bg-primary text-white">
                                  {group.bookings.length} {group.bookings.length === 1 ? 'reserva' : 'reservas'}
                                </span>
                              </div>
                              <ul className="space-y-1 text-body font-body text-sm">
                                {group.bookings.map((b) => (
                                  <li key={b.id}>
                                    {b.customer?.firstName} {b.customer?.lastName}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              /* Lista de paquetes */
              <div className="space-y-4">
                {filteredPackages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-body font-body">No hay paquetes para mostrar</p>
                  </div>
                ) : (
                  filteredPackages.map((pkg) => {
                    const packageBookings = getBookingsForPackage(pkg.id)
                    return (
                      <div
                        key={pkg.id}
                        className="border-2 border-neutral rounded-lg p-6 hover:border-primary transition-colors cursor-pointer"
                        onClick={() => setSelectedPackage(pkg)}
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-h3 font-heading text-body">
                                {pkg.packageName}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-body ${
                                pkg.payment?.status === 'succeeded' || pkg.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {pkg.payment?.status === 'succeeded' || pkg.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                              </span>
                            </div>
                            <div className="space-y-1 text-body font-body text-sm">
                              <p>
                                <span className="font-medium">Cliente:</span> {pkg.customer?.fullName || 'N/A'}
                              </p>
                              <p>
                                <span className="font-medium">Email:</span> {pkg.customer?.email || 'N/A'}
                              </p>
                              <p>
                                <span className="font-medium">Teléfono:</span> {pkg.customer?.phone || 'N/A'}
                              </p>
                              <p>
                                <span className="font-medium">Clases totales:</span> {pkg.classes || 10}
                              </p>
                              <p>
                                <span className="font-medium">Clases usadas:</span> {pkg.classesUsed || packageBookings.length} / {pkg.classes || 10}
                              </p>
                              <p>
                                <span className="font-medium">Clases disponibles:</span> {pkg.classesRemaining || ((pkg.classes || 10) - (pkg.classesUsed || packageBookings.length))}
                              </p>
                              <p>
                                <span className="font-medium">Monto:</span> {formatCurrency(pkg.payment?.amount || 0)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-body font-body mb-2">
                              {format(new Date(pkg.createdAt || pkg.purchaseDate), "dd/MM/yyyy HH:mm", { locale: es })}
                            </div>
                            {pkg.stripeInfo?.paymentIntentId && (
                              <div className="text-xs text-body font-body opacity-75">
                                Stripe ID: {pkg.stripeInfo.paymentIntentId.slice(0, 20)}...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* Modal de detalles de reserva */}
          {selectedBooking && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pt-20"
              onClick={() => setSelectedBooking(null)}
            >
              <div 
                className="bg-white rounded-lg p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-h2 font-heading text-body">
                    Detalles de la Reserva
                  </h2>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="text-body hover:text-primary"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Información de la clase */}
                  <div>
                    <h3 className="text-h3 font-heading text-body mb-3">Información de la Clase</h3>
                    <div className="bg-quaternary rounded-lg p-4 space-y-2 text-body font-body">
                      <p><span className="font-medium">Tipo:</span> {selectedBooking.type === 'profesor' ? 'Profesor' : 'Clase'}</p>
                      <p><span className="font-medium">Nombre:</span> {selectedBooking.className}</p>
                      {selectedBooking.teacherName && (
                        <p><span className="font-medium">Profesor:</span> {selectedBooking.teacherName}</p>
                      )}
                      <p><span className="font-medium">Fecha:</span> {selectedBooking.formattedDate}</p>
                      <p><span className="font-medium">Hora:</span> {selectedBooking.time}</p>
                    </div>
                  </div>

                  {/* Información del cliente */}
                  <div>
                    <h3 className="text-h3 font-heading text-body mb-3">Información del Cliente</h3>
                    <div className="bg-quaternary rounded-lg p-4 space-y-2 text-body font-body">
                      <p><span className="font-medium">Nombre completo:</span> {selectedBooking.customer.fullName}</p>
                      <p><span className="font-medium">Email:</span> {selectedBooking.customer.email}</p>
                      <p><span className="font-medium">Teléfono:</span> {selectedBooking.customer.phone}</p>
                    </div>
                  </div>

                  {/* Información de pago Stripe */}
                  <div>
                    <h3 className="text-h3 font-heading text-body mb-3">Información de Pago (Stripe)</h3>
                    <div className="bg-quaternary rounded-lg p-4 space-y-2 text-body font-body">
                      <p><span className="font-medium">Estado:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          selectedBooking.payment?.status === 'succeeded' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedBooking.payment?.status === 'succeeded' ? 'Pagado' : 'Pendiente'}
                        </span>
                      </p>
                      <p><span className="font-medium">Método de pago:</span> {selectedBooking.paymentMethod === 'package' ? 'Paquete de Clases' : (selectedBooking.payment?.method || 'Tarjeta')}</p>
                      {selectedBooking.paymentMethod === 'package' && selectedBooking.packageId && (
                        <p><span className="font-medium">ID del Paquete:</span> 
                          <code className="ml-2 text-xs bg-white px-2 py-1 rounded">{selectedBooking.packageId}</code>
                        </p>
                      )}
                      {selectedBooking.paymentMethod !== 'package' && (
                        <>
                          <p><span className="font-medium">Monto:</span> {formatCurrency(selectedBooking.payment?.amount || 0)}</p>
                          <p><span className="font-medium">Moneda:</span> {selectedBooking.payment?.currency || 'MXN'}</p>
                          <p><span className="font-medium">Tarjeta terminada en:</span> {selectedBooking.payment?.cardLastFour || 'N/A'}</p>
                        </>
                      )}
                      {selectedBooking.stripeInfo?.paymentIntentId && (
                        <>
                          <p><span className="font-medium">Payment Intent ID:</span> 
                            <code className="ml-2 text-xs bg-white px-2 py-1 rounded">{selectedBooking.stripeInfo.paymentIntentId}</code>
                          </p>
                        </>
                      )}
                      <p><span className="font-medium">Fecha de creación:</span> {format(new Date(selectedBooking.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: es })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal de detalles de paquete */}
          {selectedPackage && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pt-20"
              onClick={() => setSelectedPackage(null)}
            >
              <div 
                className="bg-white rounded-lg p-6 md:p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-h2 font-heading text-body">
                    Detalles del Paquete
                  </h2>
                  <button
                    onClick={() => setSelectedPackage(null)}
                    className="text-body hover:text-primary"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Información del paquete */}
                  <div>
                    <h3 className="text-h3 font-heading text-body mb-3">Información del Paquete</h3>
                    <div className="bg-quaternary rounded-lg p-4 space-y-2 text-body font-body">
                      <p><span className="font-medium">Nombre:</span> {selectedPackage.packageName}</p>
                      <p><span className="font-medium">Clases totales:</span> {selectedPackage.classes || 10}</p>
                      <p><span className="font-medium">Clases usadas:</span> {selectedPackage.classesUsed || getBookingsForPackage(selectedPackage.id).length}</p>
                      <p><span className="font-medium">Clases disponibles:</span> {selectedPackage.classesRemaining || ((selectedPackage.classes || 10) - (selectedPackage.classesUsed || getBookingsForPackage(selectedPackage.id).length))}</p>
                      <p><span className="font-medium">Estado:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          selectedPackage.payment?.status === 'succeeded' || selectedPackage.status === 'confirmed'
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedPackage.payment?.status === 'succeeded' || selectedPackage.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                        </span>
                      </p>
                      <p><span className="font-medium">Fecha de compra:</span> {format(new Date(selectedPackage.createdAt || selectedPackage.purchaseDate), "dd/MM/yyyy HH:mm:ss", { locale: es })}</p>
                      {selectedPackage.lastUsed && (
                        <p><span className="font-medium">Última clase usada:</span> {format(new Date(selectedPackage.lastUsed), "dd/MM/yyyy HH:mm:ss", { locale: es })}</p>
                      )}
                    </div>
                  </div>

                  {/* Información del cliente */}
                  <div>
                    <h3 className="text-h3 font-heading text-body mb-3">Información del Cliente</h3>
                    <div className="bg-quaternary rounded-lg p-4 space-y-2 text-body font-body">
                      <p><span className="font-medium">Nombre completo:</span> {selectedPackage.customer?.fullName || 'N/A'}</p>
                      <p><span className="font-medium">Email:</span> {selectedPackage.customer?.email || 'N/A'}</p>
                      <p><span className="font-medium">Teléfono:</span> {selectedPackage.customer?.phone || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Información de pago */}
                  <div>
                    <h3 className="text-h3 font-heading text-body mb-3">Información de Pago</h3>
                    <div className="bg-quaternary rounded-lg p-4 space-y-2 text-body font-body">
                      <p><span className="font-medium">Método de pago:</span> {selectedPackage.payment?.method || 'Tarjeta de Crédito/Débito'}</p>
                      <p><span className="font-medium">Monto:</span> {formatCurrency(selectedPackage.payment?.amount || 0)}</p>
                      <p><span className="font-medium">Moneda:</span> {selectedPackage.payment?.currency || 'MXN'}</p>
                      {selectedPackage.payment?.cardLastFour && (
                        <p><span className="font-medium">Tarjeta terminada en:</span> {selectedPackage.payment.cardLastFour}</p>
                      )}
                      {selectedPackage.stripeInfo?.paymentIntentId && (
                        <p><span className="font-medium">Payment Intent ID:</span> 
                          <code className="ml-2 text-xs bg-white px-2 py-1 rounded">{selectedPackage.stripeInfo.paymentIntentId}</code>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Clases utilizadas */}
                  <div>
                    <h3 className="text-h3 font-heading text-body mb-3">
                      Clases Utilizadas ({getBookingsForPackage(selectedPackage.id).length})
                    </h3>
                    {getBookingsForPackage(selectedPackage.id).length === 0 ? (
                      <div className="bg-quaternary rounded-lg p-4 text-body font-body text-center">
                        <p>No se han utilizado clases de este paquete aún</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {getBookingsForPackage(selectedPackage.id).map((booking) => (
                          <div key={booking.id} className="bg-quaternary rounded-lg p-4 text-body font-body">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{booking.className}</p>
                                <p className="text-sm">{booking.formattedDate} a las {booking.time}</p>
                              </div>
                              <div className="text-right text-sm">
                                <p>{format(new Date(booking.createdAt), "dd/MM/yyyy", { locale: es })}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Admin
