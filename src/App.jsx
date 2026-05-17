import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import PostLoginClassesBanner from './components/PostLoginClassesBanner'
import Footer from './components/Footer'
import { initMetaPixel, trackMetaPageView } from './utils/metaPixel'
import { canUseMarketingCookies } from './utils/cookieConsent'
import CookieConsent from './components/CookieConsent'
import PageSEO from './components/PageSEO'
import Home from './pages/Home'
import Classes from './pages/Classes'
import Schedule from './pages/Schedule'
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
import Ubicacion from './pages/Ubicacion'
import DesignSystem from './pages/DesignSystem'
import HomeRedesign from './pages/HomeRedesign'
import ScheduleRedesign from './pages/ScheduleRedesign'
import PackagesRedesign from './pages/PackagesRedesign'
import MyBookingsRedesign from './pages/MyBookingsRedesign'
import ClassesRedesign from './pages/ClassesRedesign'
import Previews from './pages/Previews'
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

function AppContent() {
  const { pathname } = useLocation()
  const isStandalonePreview =
    pathname === '/design-system' ||
    pathname === '/schedule-redesign' ||
    pathname === '/packages-redesign' ||
    pathname === '/mis-reservas-redesign' ||
    pathname === '/previews'

  const hideGlobalNavbar =
    pathname === '/home-redesign' ||
    pathname === '/classes-redesign' ||
    pathname === '/login' ||
    pathname === '/signup'

  return (
    <>
      <MetaPixelRouter />
      <ScrollToTop />
      <PageSEO />
      {!hideGlobalNavbar && !isStandalonePreview && <Navbar />}
      {!isStandalonePreview && <PostLoginClassesBanner />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/coaches/login" element={<TeacherLogin />} />
        <Route path="/coaches/panel" element={<TeacherDashboard />} />
        <Route path="/coaches" element={<Navigate to="/classes" replace />} />
        <Route path="/teachers" element={<Navigate to="/classes" replace />} />
        <Route path="/horario" element={<Schedule />} />
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
        <Route path="/privacidad" element={<PrivacyPolicy />} />
        <Route path="/terminos" element={<TermsAndConditions />} />
        <Route path="/mis-reservas" element={<MyBookings />} />
        <Route path="/design-system" element={<DesignSystem />} />
        <Route path="/home-redesign" element={<HomeRedesign />} />
        <Route path="/schedule-redesign" element={<ScheduleRedesign />} />
        <Route path="/packages-redesign" element={<PackagesRedesign />} />
        <Route path="/mis-reservas-redesign" element={<MyBookingsRedesign />} />
        <Route path="/classes-redesign" element={<ClassesRedesign />} />
        <Route path="/previews" element={<Previews />} />
      </Routes>
      {!isStandalonePreview && <Footer />}
      {!isStandalonePreview && <CookieConsent />}
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
