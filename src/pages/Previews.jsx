import { Link } from 'react-router-dom'

const redesignItems = [
  {
    to: '/design-system',
    title: 'Design system',
    note: 'Componentes y tokens en iframe aislado.',
  },
  {
    to: '/home-redesign',
    title: 'Inicio (rediseño)',
    note: 'Alias de la home nueva; misma vista que /.',
  },
  {
    to: '/classes-redesign',
    title: 'Clases / prácticas (rediseño)',
    note: 'Hero + chips + tarjetas pn-practice-card (design system). /classes sigue siendo la vista pública.',
  },
  {
    to: '/schedule-redesign',
    title: 'Horario (rediseño)',
    note: 'Mock del horario; no reemplaza /horario.',
  },
  {
    to: '/packages-redesign',
    title: 'Paquetes (rediseño)',
    note: 'Mock de paquetes y membresías; no reemplaza /packages.',
  },
  {
    to: '/mis-reservas-redesign',
    title: 'Mis reservas (rediseño)',
    note: 'Mock del panel de reservas; no reemplaza /mis-reservas.',
  },
]

/** Páginas del sitio público actual (navbar + footer) para revisar antes de cambiar a live. */
const liveSiteItems = [
  { to: '/', title: 'Inicio', note: 'Landing principal' },
  { to: '/classes', title: 'Prácticas', note: 'Disciplinas y reserva por tipo de clase' },
  { to: '/horario', title: 'Horario', note: 'Semana, filtros y reserva por horario' },
  { to: '/packages', title: 'Planes', note: 'Precios y compra de paquetes' },
  { to: '/ubicacion', title: 'Ubicación', note: 'Cómo llegar' },
  { to: '/login', title: 'Iniciar sesión', note: 'Cuenta cliente' },
  { to: '/signup', title: 'Crear cuenta', note: 'Alta de cuenta' },
  { to: '/forgot-password', title: 'Olvidé mi contraseña', note: 'Recuperación' },
  {
    to: '/mis-reservas',
    title: 'Mis reservas',
    note: 'Si no hay sesión, redirige a login; entra con una cuenta de prueba',
  },
  { to: '/privacidad', title: 'Aviso de privacidad', note: '' },
  { to: '/terminos', title: 'Términos y condiciones', note: '' },
]

const staffItems = [
  { to: '/coaches/login', title: 'Login maestras', note: 'Panel /coaches/panel tras autenticarse' },
  { to: '/admin/login', title: 'Login admin', note: 'Solo si usas el panel /admin' },
]

function PreviewLinkCard({ to, title, note }) {
  return (
    <li>
      <Link
        to={to}
        className="block rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-stone-300 hover:shadow md:p-5"
      >
        <span className="font-semibold text-stone-900">{title}</span>
        {note ? <span className="mt-1 block text-sm text-stone-600">{note}</span> : null}
        <span className="mt-2 block font-mono text-xs text-stone-500">{to}</span>
      </Link>
    </li>
  )
}

function Previews() {
  return (
    <main className="min-h-screen bg-stone-100 px-5 py-12 md:px-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
          Solo desarrollo / revisión
        </p>
        <h1 className="mt-2 text-2xl font-bold text-stone-900 md:text-3xl">
          Ver todo antes de publicar
        </h1>
        <p className="mt-3 max-w-2xl text-stone-600">
          Aquí tienes el <strong className="font-semibold text-stone-800">sitio en vivo hoy</strong>{' '}
          (mismas rutas que producción) y, abajo, los{' '}
          <strong className="font-semibold text-stone-800">mocks del rediseño</strong> en rutas
          aparte. Recorre la primera lista para validar el producto actual; la segunda para el
          look nuevo sin tocar lo público.
        </p>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-900">Sitio público actual (live)</h2>
          <p className="mt-1 text-sm text-stone-600">
            Incluye navbar, footer y cookies. Reservas y checkout: entra desde Horario, Prácticas o
            Paquetes según el flujo que quieras probar.
          </p>
          <ul className="mt-6 grid list-none gap-4 md:grid-cols-2">
            {liveSiteItems.map((item) => (
              <PreviewLinkCard key={item.to} {...item} />
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-stone-900">Áreas staff (opcional)</h2>
          <ul className="mt-4 grid list-none gap-4 md:grid-cols-2">
            {staffItems.map((item) => (
              <PreviewLinkCard key={item.to} {...item} />
            ))}
          </ul>
        </section>

        <section className="mt-12 border-t border-stone-200 pt-12">
          <h2 className="text-lg font-semibold text-stone-900">Vistas previas del rediseño</h2>
          <p className="mt-1 text-sm text-stone-600">
            Pantallas aisladas (sin navbar del sitio) para revisar diseño y copy nuevos.
          </p>
          <ul className="mt-6 space-y-4">
            {redesignItems.map(({ to, title, note }) => (
              <PreviewLinkCard key={to} to={to} title={title} note={note} />
            ))}
          </ul>
        </section>

        <p className="mt-12 text-sm text-stone-500">
          En local:{' '}
          <code className="rounded bg-stone-200 px-1.5 py-0.5">npm run dev</code> y abre{' '}
          <code className="rounded bg-stone-200 px-1.5 py-0.5">http://localhost:5173/previews</code>{' '}
          (o el puerto que indique Vite).
        </p>
      </div>
    </main>
  )
}

export default Previews
