import { Link } from 'react-router-dom'

function PrivacyPolicy() {
  return (
    <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 pt-28 pb-20">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-heading font-light mb-2" style={{ color: '#1F2937' }}>
            Política de Privacidad
          </h1>
          <p className="text-sm font-body mb-8" style={{ color: '#6B7280' }}>
            Última actualización: febrero 2026
          </p>

          <div className="space-y-8 font-body text-base leading-relaxed" style={{ color: '#4B5563' }}>
            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>1. Responsable del tratamiento</h2>
              <p>
                El responsable del tratamiento de los datos personales es <strong>FINOVIX S.A.P.I.</strong>, que opera la marca Estudio Popnest Wellness («nosotros», «nuestro»). Tratamos los datos que nos facilitas a través de este sitio web (popnest.app) y de los servicios de reserva de clases, compra de paquetes y creación de cuentas de usuario. El tratamiento de tus datos personales se realiza de conformidad con la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong> y su reglamento, vigentes en los Estados Unidos Mexicanos.
              </p>
              <p className="mt-2">
                Puedes contactarnos en: <a href="mailto:info@estudiopopnest.com" className="underline" style={{ color: '#B73D37' }}>info@estudiopopnest.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>2. Datos que recogemos</h2>
              <p>Recogemos únicamente los datos necesarios para:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Gestionar tu cuenta (nombre, apellidos, correo electrónico, teléfono y contraseña).</li>
                <li>Procesar reservas de clases y compra de paquetes (datos de pago son gestionados por Stripe; nosotros no almacenamos datos completos de tarjeta).</li>
                <li>Enviarte recordatorios o comunicaciones relacionadas con tus reservas y, si nos diste consentimiento, información sobre el estudio.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>3. Finalidad y base legal</h2>
              <p>
                Utilizamos tus datos para ejecutar el contrato de reserva o compra, gestionar tu cuenta y, en su caso, enviar comunicaciones comerciales si has aceptado recibirlas. La base legal es la ejecución del contrato, el consentimiento cuando lo pedimos de forma expresa, y el interés legítimo para mejorar nuestros servicios.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>4. Conservación y seguridad</h2>
              <p>
                Conservamos tus datos mientras mantengas una relación con nosotros y, después, durante el tiempo que exija la ley. Aplicamos medidas técnicas y organizativas para proteger tu información frente a accesos no autorizados, pérdida o alteración.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>5. Tus derechos (ARCO)</h2>
              <p>
                De conformidad con la ley mexicana, puedes ejercer en cualquier momento tus derechos de <strong>Acceso</strong>, <strong>Rectificación</strong>, <strong>Cancelación</strong> y <strong>Oposición</strong> (derechos ARCO), así como revocar tu consentimiento para el tratamiento de tus datos. Para ello escríbenos a <a href="mailto:info@estudiopopnest.com" className="underline" style={{ color: '#B73D37' }}>info@estudiopopnest.com</a>. También tienes derecho a presentar una queja o denuncia ante el <strong>Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI)</strong>, la autoridad competente en materia de protección de datos personales en México.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>6. Cookies y tecnologías similares</h2>
              <p>
                Este sitio puede utilizar cookies y tecnologías similares para el correcto funcionamiento de la web y la sesión de usuario. Puedes configurar tu navegador para rechazar o limitar el uso de cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>7. Ley aplicable</h2>
              <p>
                Esta política de privacidad y el tratamiento de los datos personales se rigen por la legislación de los <strong>Estados Unidos Mexicanos</strong>, en particular por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y su reglamento.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>8. Cambios</h2>
              <p>
                Nos reservamos el derecho de actualizar esta política de privacidad. Cualquier cambio relevante se publicará en esta página con la fecha de última actualización.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t" style={{ borderColor: '#E5E7EB' }}>
            <Link to="/" className="font-body text-sm hover:underline" style={{ color: '#B73D37' }}>
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
