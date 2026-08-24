import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import PostLoginClassesBanner from './components/PostLoginClassesBanner'
import Footer from './components/Footer'
import { initMetaPixel, trackMetaPageView } from './utils/metaPixel'
import { canUseMarketingCookies } from './utils/cookieConsent'
import CookieConsent from './components/CookieConsent'
import FreeClassPopup from './components/FreeClassPopup'
import PageSEO from './components/PageSEO'
import { syncProposalPreviewFromUrl } from './config/proposalPlans'
import Home from './pages/Home'
import Classes from './pages/Classes'
import Schedule from './pages/Schedule'
import Talleres from './pages/Talleres'
import TallerDetalle from './pages/TallerDetalle'
import Booking from './pages/Booking'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import Packages from './pages/Packages'
import PackagePurchase from './pages/PackagePurchase'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminForgotPassword from './pages/AdminForgotPassword'
import AdminResetPassword from './pages/AdminResetPassword'
import TeacherLogin from './pages/TeacherLogin'
import TeacherDashboard from './pages/TeacherDashboard'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsAndConditions from './pages/TermsAndConditions'
import MyBookings from './pages/MyBookings'
import MyPackages from './pages/MyPackages'
import Ubicacion from './pages/Ubicacion'
import ClassLanding from './pages/ClassLanding'
import YogaCoyoacan from './pages/YogaCoyoacan'
import Espacios from './pages/Espacios'
import DesignSystem from './pages/DesignSystem'
import HomeRedesign from './pages/HomeRedesign'
import ScheduleRedesign from './pages/ScheduleRedesign'
import PackagesRedesign from './pages/PackagesRedesign'
import MyBookingsRedesign from './pages/MyBookingsRedesign'
import ClassesRedesign from './pages/ClassesRedesign'
import Previews from './pages/Previews'
import NotFound from './pages/NotFound'
import DevOnlyRoute from './components/DevOnlyRoute'
import './App.css'

/** Solo inicializa y hace tracking con Meta Pixel si el usuario aceptó cookies de marketing. */
function MetaPixelRouter() {
  const location = useLocation()
  useEffect(() => {
    if (canUseMarketingCookies()) {
      initMetaPixel()
    }
  }, [])
  useEffect(() => {
    if (canUseMarketingCookies() && location.pathname) {
      trackMetaPageView()
    }
  }, [location.pathname])
  return null
}

/** En cada cambio de ruta, lleva el scroll al inicio (arriba). Evita que en móvil
 * al pasar de /classes (scrolleado) a /booking/class/... se mantenga el scroll. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function AppContent() {
  const { pathname } = useLocation()

  // Activa el modo preview interno de planes si la URL trae ?preview=equipo,
  // y lo mantiene al navegar entre páginas (persistido en localStorage).
  useEffect(() => {
    syncProposalPreviewFromUrl()
  }, [])
  const isStandalonePreview =
    pathname === '/design-system' ||
    pathname === '/schedule-redesign' ||
    pathname === '/packages-redesign' ||
    pathname === '/mis-reservas-redesign' ||
    pathname === '/previews'

  // Portal oculto /espacios (+ /espacios/oficinas): sin navbar ni footer del sitio.
  const isHiddenSpacePage = pathname === '/espacios' || pathname.startsWith('/espacios/')

  /** Vistas que se muestran solas, sin navbar, footer, cookies ni popup. */
  const isBareLayout = isStandalonePreview || isHiddenSpacePage

  const hideGlobalNavbar =
    pathname === '/home-redesign' ||
    pathname === '/classes-redesign' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password'

  // El popup de clase gratis solo se muestra en páginas públicas de marketing,
  // no en flujos de reserva, pago, login ni paneles privados.
  const isMarketingRoute =
    pathname === '/' ||
    pathname === '/classes' ||
    pathname.startsWith('/clases/') ||
    pathname === '/horario' ||
    pathname === '/talleres' ||
    pathname === '/packages' ||
    pathname === '/ubicacion'

  return (
    <>
      <MetaPixelRouter />
      <ScrollToTop />
      <PageSEO />
      {!hideGlobalNavbar && !isBareLayout && <Navbar />}
      {!isBareLayout && <PostLoginClassesBanner />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/clases/yoga-coyoacan" element={<YogaCoyoacan />} />
        <Route path="/clases/:slug" element={<ClassLanding />} />
        <Route path="/coaches/login" element={<TeacherLogin />} />
        <Route path="/coaches/panel" element={<TeacherDashboard />} />
        <Route path="/coaches" element={<Navigate to="/classes" replace />} />
        <Route path="/teachers" element={<Navigate to="/classes" replace />} />
        <Route path="/horario" element={<Schedule />} />
        <Route path="/talleres" element={<Talleres />} />
        <Route path="/talleres/:id" element={<TallerDetalle />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/booking/package/:id" element={<PackagePurchase />} />
        <Route path="/booking/:type/:id" element={<Booking />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/profesores/login" element={<Navigate to="/coaches/login" replace />} />
        <Route path="/profesores" element={<Navigate to="/classes" replace />} />
        <Route path="/ubicacion" element={<Ubicacion />} />
        {/* Portal oculto: no enlazado en el sitio ni en el sitemap (noindex). */}
        <Route path="/espacios" element={<Espacios />} />
        <Route path="/privacidad" element={<PrivacyPolicy />} />
        <Route path="/terminos" element={<TermsAndConditions />} />
        <Route path="/mis-reservas" element={<MyBookings />} />
        <Route path="/mis-paquetes" element={<MyPackages />} />
        <Route path="/design-system" element={<DevOnlyRoute><DesignSystem /></DevOnlyRoute>} />
        <Route path="/home-redesign" element={<DevOnlyRoute><HomeRedesign /></DevOnlyRoute>} />
        <Route path="/schedule-redesign" element={<DevOnlyRoute><ScheduleRedesign /></DevOnlyRoute>} />
        <Route path="/packages-redesign" element={<DevOnlyRoute><PackagesRedesign /></DevOnlyRoute>} />
        <Route path="/mis-reservas-redesign" element={<DevOnlyRoute><MyBookingsRedesign /></DevOnlyRoute>} />
        <Route path="/classes-redesign" element={<DevOnlyRoute><ClassesRedesign /></DevOnlyRoute>} />
        <Route path="/previews" element={<DevOnlyRoute><Previews /></DevOnlyRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isBareLayout && <Footer />}
      {!isStandalonePreview && <CookieConsent />}
      {!isBareLayout && isMarketingRoute && <FreeClassPopup />}
    </>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
