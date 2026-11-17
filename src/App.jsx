import { useEffect, lazy, Suspense } from 'react'
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
import RentaSalon from './pages/RentaSalon'
import Coworking from './pages/Coworking'
import RunClub from './pages/RunClub'
import Packages from './pages/Packages'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsAndConditions from './pages/TermsAndConditions'
import Ubicacion from './pages/Ubicacion'
import ClassLanding from './pages/ClassLanding'
import YogaCoyoacan from './pages/YogaCoyoacan'
import NotFound from './pages/NotFound'
import DevOnlyRoute from './components/DevOnlyRoute'
import FituneRedirect from './components/FituneRedirect'
// Páginas que nunca se pre-renderizan (login, cuenta, reservas, admin, previews de diseño):
// se descargan solo al visitarlas, así el Home y las landings no cargan su código.
const RentaSalonConfirmacion = lazy(() => import('./pages/RentaSalonConfirmacion'))
const TallerDetalle = lazy(() => import('./pages/TallerDetalle'))
const Booking = lazy(() => import('./pages/Booking'))
const Admin = lazy(() => import('./pages/Admin'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const PackagePurchase = lazy(() => import('./pages/PackagePurchase'))
const Login = lazy(() => import('./pages/Login'))
const SignUp = lazy(() => import('./pages/SignUp'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const AdminForgotPassword = lazy(() => import('./pages/AdminForgotPassword'))
const AdminResetPassword = lazy(() => import('./pages/AdminResetPassword'))
const TeacherLogin = lazy(() => import('./pages/TeacherLogin'))
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'))
const MyBookings = lazy(() => import('./pages/MyBookings'))
const MyPackages = lazy(() => import('./pages/MyPackages'))
const Espacios = lazy(() => import('./pages/Espacios'))
const DesignSystem = lazy(() => import('./pages/DesignSystem'))
const HomeRedesign = lazy(() => import('./pages/HomeRedesign'))
const ScheduleRedesign = lazy(() => import('./pages/ScheduleRedesign'))
const PackagesRedesign = lazy(() => import('./pages/PackagesRedesign'))
const MyBookingsRedesign = lazy(() => import('./pages/MyBookingsRedesign'))
const ClassesRedesign = lazy(() => import('./pages/ClassesRedesign'))
const Previews = lazy(() => import('./pages/Previews'))
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
    pathname === '/renta-salon' ||
    pathname === '/packages' ||
    pathname === '/ubicacion'

  return (
    <>
      <MetaPixelRouter />
      <ScrollToTop />
      <PageSEO />
      {!hideGlobalNavbar && !isBareLayout && <Navbar />}
      {!isBareLayout && <PostLoginClassesBanner />}
      <Suspense fallback={<div className="route-loading" aria-busy="true" style={{ minHeight: '60vh' }} />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/clases/yoga-coyoacan" element={<YogaCoyoacan />} />
        {/* Meditación y Sound Healing se archivó en oct 2026 (salida de Brenda); conserva el link viejo. */}
        <Route path="/clases/meditacion-sound-healing-coyoacan" element={<Navigate to="/clases/sound-healing-coyoacan" replace />} />
        {/* Meditación se dejó de ofrecer en oct 2026; conserva el link viejo. */}
        <Route path="/clases/meditacion-coyoacan" element={<Navigate to="/classes" replace />} />
        <Route path="/clases/:slug" element={<ClassLanding />} />
        <Route path="/coaches/login" element={<TeacherLogin />} />
        <Route path="/coaches/panel" element={<TeacherDashboard />} />
        <Route path="/coaches" element={<Navigate to="/classes" replace />} />
        <Route path="/teachers" element={<Navigate to="/classes" replace />} />
        <Route path="/horario" element={<Schedule />} />
        <Route path="/talleres" element={<Talleres />} />
        <Route path="/talleres/:id" element={<TallerDetalle />} />
        <Route path="/renta-salon" element={<RentaSalon />} />
        <Route path="/renta-salon/confirmacion" element={<RentaSalonConfirmacion />} />
        <Route path="/coworking" element={<Coworking />} />
        <Route path="/run-club" element={<RunClub />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/booking/package/:id" element={<FituneRedirect kind="package"><PackagePurchase /></FituneRedirect>} />
        <Route path="/booking/:type/:id" element={<FituneRedirect kind="class"><Booking /></FituneRedirect>} />
        <Route path="/login" element={<FituneRedirect><Login /></FituneRedirect>} />
        <Route path="/signup" element={<FituneRedirect><SignUp /></FituneRedirect>} />
        <Route path="/forgot-password" element={<FituneRedirect><ForgotPassword /></FituneRedirect>} />
        <Route path="/reset-password" element={<FituneRedirect><ResetPassword /></FituneRedirect>} />
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
        <Route path="/mis-reservas" element={<FituneRedirect><MyBookings /></FituneRedirect>} />
        <Route path="/mis-paquetes" element={<FituneRedirect><MyPackages /></FituneRedirect>} />
        <Route path="/design-system" element={<DevOnlyRoute><DesignSystem /></DevOnlyRoute>} />
        <Route path="/home-redesign" element={<DevOnlyRoute><HomeRedesign /></DevOnlyRoute>} />
        <Route path="/schedule-redesign" element={<DevOnlyRoute><ScheduleRedesign /></DevOnlyRoute>} />
        <Route path="/packages-redesign" element={<DevOnlyRoute><PackagesRedesign /></DevOnlyRoute>} />
        <Route path="/mis-reservas-redesign" element={<DevOnlyRoute><MyBookingsRedesign /></DevOnlyRoute>} />
        <Route path="/classes-redesign" element={<DevOnlyRoute><ClassesRedesign /></DevOnlyRoute>} />
        <Route path="/previews" element={<DevOnlyRoute><Previews /></DevOnlyRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
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
