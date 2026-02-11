import { Link } from 'react-router-dom'

function TermsAndConditions() {
  return (
    <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 pt-28 pb-20">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-heading font-light mb-2" style={{ color: '#1F2937' }}>
            Términos y Condiciones
          </h1>
          <p className="text-sm font-body mb-8" style={{ color: '#6B7280' }}>
            Última actualización: febrero 2026
          </p>

          <div className="space-y-8 font-body text-base leading-relaxed" style={{ color: '#4B5563' }}>
            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>1. Aceptación</h2>
              <p>
                El uso de este sitio web y de los servicios de <strong>FINOVIX S.A.P.I.</strong>, operando como Estudio Popnest Wellness (reservas de clases, compra de paquetes, creación de cuentas), implica la aceptación de los presentes Términos y Condiciones. Si no estás de acuerdo, te rogamos que no utilices nuestros servicios.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>2. Servicios ofrecidos</h2>
              <p>
                FINOVIX S.A.P.I. (Estudio Popnest Wellness) ofrece clases de yoga, meditación, tai chi, sound healing y actividades afines, así como la posibilidad de reservar clases individuales o adquirir paquetes de clases a través de esta plataforma. Los horarios, profesores y condiciones específicas de cada clase se indican en la web y pueden estar sujetos a disponibilidad.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>3. Registro y cuenta</h2>
              <p>
                Para reservar clases o comprar paquetes puede ser necesario registrarse. Es responsabilidad del usuario proporcionar información veraz y mantener la confidencialidad de su contraseña. La cuenta es personal e intransferible.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>4. Reservas y pagos</h2>
              <p>
                Las reservas y pagos se realizan a través de la plataforma. Los pagos con tarjeta son procesados por Stripe; no almacenamos datos completos de tu tarjeta. Los precios y promociones vigentes son los publicados en el momento de la reserva o compra. Los paquetes de clases pueden tener fecha de validez; en tal caso se indicará antes de la compra.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>5. Cancelaciones, reagendamiento y reembolsos</h2>
              <p>
                No realizamos reembolsos en dinero. Si no puedes asistir a una clase reservada o deseas cambiar la fecha u horario, puedes <strong>reagendar</strong> tu reserva a otra fecha y hora disponible para la misma clase, desde la sección «Mis reservas» en tu cuenta, con al menos <strong>48 horas de anticipación</strong> a la clase reservada. Si prefieres, también puedes contactarnos para solicitar el cambio. Las políticas de cancelación o cambio de reserva se comunican en el proceso de reserva o en el estudio.
              </p>
              <p className="mt-2">
                En caso de cancelación o cambio por parte del estudio (por ejemplo, por fuerza mayor o baja del profesor), se te ofrecerá <strong>reprogramación</strong> a otra fecha u horario; no se realizan reembolsos en efectivo salvo que la ley aplicable lo exija.
              </p>
              <p className="mt-2">
                Para paquetes de clases ya adquiridos, no se devuelve el importe pagado; las clases no utilizadas podrán usarse en otras fechas dentro del periodo de validez del paquete, o reagendarse según las condiciones del paquete.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>6. Uso adecuado</h2>
              <p>
                El usuario se compromete a utilizar el sitio y los servicios de forma lícita y respetuosa. No está permitido el uso fraudulento, la suplantación de identidad ni cualquier conducta que perjudique al estudio o a otros usuarios.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>7. Propiedad intelectual</h2>
              <p>
                Los contenidos, diseño, logotipos y materiales de este sitio web son propiedad de FINOVIX S.A.P.I. (Estudio Popnest Wellness) o de sus titulares y están protegidos por la legislación aplicable. No está permitida su reproducción o uso no autorizado.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>8. Limitación de responsabilidad</h2>
              <p>
                FINOVIX S.A.P.I. (Estudio Popnest Wellness) no será responsable de daños indirectos o consecuentes derivados del uso del sitio o de los servicios, salvo en los casos en que la ley no permita esta limitación. La participación en las clases implica que el usuario asume su estado de salud y aptitud para la práctica.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>9. Modificaciones</h2>
              <p>
                Nos reservamos el derecho de modificar estos Términos y Condiciones. Los cambios entrarán en vigor desde su publicación en esta página. El uso continuado del sitio tras los cambios implica la aceptación de los nuevos términos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>10. Ley aplicable y foro</h2>
              <p>
                Los presentes Términos y Condiciones se rigen por las <strong>leyes de los Estados Unidos Mexicanos</strong>. Cualquier controversia derivada de su interpretación o cumplimiento será sometida a los tribunales competentes en la República Mexicana, renunciando las partes a cualquier otro fuero que por razón de su domicilio presente o futuro pudiera corresponderles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>11. Contacto</h2>
              <p>
                Para cualquier duda sobre estos Términos y Condiciones puedes contactar a <strong>FINOVIX S.A.P.I.</strong> en <a href="mailto:info@estudiopopnest.com" className="underline" style={{ color: '#B73D37' }}>info@estudiopopnest.com</a>.
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

export default TermsAndConditions
