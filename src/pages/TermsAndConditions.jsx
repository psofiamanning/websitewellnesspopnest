import { Link } from 'react-router-dom'

const EMAIL = 'info@estudiopopnest.com'

function Email() {
  return (
    <a href={`mailto:${EMAIL}`} className="underline" style={{ color: '#B73D37' }}>{EMAIL}</a>
  )
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-xl font-heading font-medium mb-3" style={{ color: '#1F2937' }}>{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Clause({ n, title, children }) {
  return (
    <p>
      <strong style={{ color: '#1F2937' }}>{n} {title}.</strong> {children}
    </p>
  )
}

function TermsAndConditions() {
  return (
    <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 pt-28 pb-20">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-heading font-light mb-2" style={{ color: '#1F2937' }}>
            Términos y Condiciones
          </h1>
          <p className="text-sm font-body mb-8" style={{ color: '#6B7280' }}>
            Última actualización: 9 de octubre de 2026
          </p>

          <div className="space-y-8 font-body text-base leading-relaxed" style={{ color: '#4B5563' }}>
            <Section title="1. Aceptación">
              <p>
                La plataforma oficial de Popnest Wellness es <a href="https://popnest.app/" className="underline" style={{ color: '#B73D37' }}>https://popnest.app/</a>. Toda referencia al sitio web o a la plataforma oficial de Estudio Popnest en estos Términos y Condiciones se refiere a esa dirección. Al usar la plataforma y los servicios de Estudio Popnest (reservas de clases, compra de paquetes y creación de cuentas) aceptas estos Términos y Condiciones. Al completar una compra o reserva, confirmas que los leíste y los aceptas. Si no estás de acuerdo, te pedimos que no utilices nuestros servicios.
              </p>
            </Section>

            <Section title="2. Servicios ofrecidos">
              <p>
                Estudio Popnest ofrece clases de yoga, pilates, stretching, meditación, sound healing, danza árabe y actividades afines. En esta plataforma puedes reservar clases individuales o comprar paquetes de clases. Los horarios, coaches y condiciones de cada clase se indican en la web y están sujetos a disponibilidad. Los talleres se rigen por la sección 16 y por las condiciones particulares comunicadas por su organizador.
              </p>
            </Section>

            <Section title="3. Registro y cuenta">
              <p>
                Para reservar clases o comprar paquetes es obligatorio registrarte y crear una cuenta en el sitio web oficial de Estudio Popnest. Eres responsable de dar información veraz y de mantener la confidencialidad de tu contraseña. La cuenta y las clases adquiridas son personales e intransferibles, salvo que el paquete o la promoción contratados permitan expresamente compartirlas. En ese caso, aplican las reglas de ese paquete o promoción.
              </p>
            </Section>

            <Section title="4. Reservas y pagos">
              <p>
                Las reservas de clases y los pagos de clases o paquetes solo se consideran válidos cuando se realizan a través del sitio web oficial de Estudio Popnest. Las excepciones son las reservas hechas en plataformas de terceros autorizadas, que se rigen por la sección 9, y el pago de renta de material en la caja del estudio, conforme a la sección 8.
              </p>
              <p>
                Las solicitudes de reserva, apartados o pagos de clases y paquetes hechos por cualquier otro medio, como WhatsApp, redes sociales, llamadas o acuerdos en persona, no se consideran oficiales. El estudio no garantiza el lugar en la clase ni se hace responsable de lo que resulte de esas solicitudes. Los pagos de clases y paquetes son en línea; no se aceptan pagos en efectivo por esos conceptos. Como excepción, la renta de material se paga en efectivo en la caja del estudio, conforme a la cláusula 8.2.
              </p>
              <p>
                Los pagos con tarjeta los procesa Stripe, y nosotros no almacenamos los datos completos de tu tarjeta. Aplican los precios y promociones publicados en el momento de la reserva o compra.
              </p>
              <p>
                Eres responsable de revisar la clase, la fecha, el horario y el paquete antes de confirmar tu compra o reserva. No se hacen cambios ni reembolsos por errores al elegir. Si detectas un cobro duplicado o un cargo generado por una falla técnica, acude con un Coordinador o Coordinadora de Operaciones de Popnest Wellness en el estudio y presenta tu comprobante de pago. Si el asunto no se resuelve allí, puedes escalarlo a <Email /> con el comprobante. Responderemos el correo de escalación en un plazo de hasta 7 días hábiles. Si el error se confirma, lo corregiremos.
              </p>
            </Section>

            <Section title="5. Paquetes, vigencia y promociones">
              <Clause n="5.1" title="Vigencia">
                Los paquetes tienen una fecha de validez que se indica antes de la compra. Las clases que no uses dentro de ese periodo vencen y se pierden. La vigencia no se extiende, congela ni pausa por viajes, enfermedad, trabajo u otros motivos personales.
              </Clause>
              <Clause n="5.2" title="Sin reembolsos ni canjes">
                Los paquetes y las clases no son reembolsables. Tampoco se pueden cambiar por efectivo, por otro paquete ni por servicios de coworking, café, productos u otros servicios del estudio.
              </Clause>
              <Clause n="5.3" title="Promociones">
                Las promociones aplican solo dentro de su vigencia y con las condiciones publicadas. No son acumulables entre sí ni aplican de forma retroactiva a compras hechas antes o después de su vigencia.
              </Clause>
              <Clause n="5.4" title="Cambios de precio">
                Los precios pueden cambiar en cualquier momento. Los paquetes que ya compraste se respetan al precio que pagaste.
              </Clause>
            </Section>

            <Section title="6. Inasistencia, cambios y reposiciones">
              <Clause n="6.1" title="Sin reposiciones">
                No ofrecemos reposiciones ni reembolsos por inasistencia. Si reservaste una clase y no puedes asistir, la clase se considera tomada, salvo que la hayas reagendado conforme a la cláusula 6.4.
              </Clause>
              <Clause n="6.2" title="El motivo no cambia la regla">
                Esta política aplica sin importar la causa de la inasistencia, incluidas enfermedad, emergencias, tráfico, clima, trabajo, olvido o cualquier otro motivo personal. No se solicitan ni se aceptan justificantes.
              </Clause>
              <Clause n="6.3" title="Paquetes">
                Cada clase reservada y no asistida se descuenta del paquete. Las clases que no hayas reservado podrás usarlas dentro del periodo de validez del paquete. No se devuelve el importe de clases no utilizadas.
              </Clause>
              <Clause n="6.4" title="Cambios de clase">
                Puedes reagendar por tu cuenta una reserva confirmada desde la sección «Mis reservas» de la plataforma, con al menos 48 horas de anticipación al inicio de la clase. El cambio es a otra fecha u horario de la misma clase, sujeto a disponibilidad. Con menos de 48 horas de anticipación la reserva ya no se puede mover y aplica la cláusula 6.1. Los cambios solicitados por otros medios, como WhatsApp, redes sociales o en recepción, no se consideran válidos.
              </Clause>
              <Clause n="6.5" title="Reserva personal">
                No puedes ceder tu lugar ni enviar a otra persona en tu nombre, salvo cuando el paquete, plan o promoción permita expresamente compartir la reserva, conforme a sus reglas.
              </Clause>
              <Clause n="6.6" title="Clase incompleta">
                Si decides retirarte antes de que termine la clase, por cualquier motivo, la clase se considera tomada.
              </Clause>
              <Clause n="6.7" title="Experiencia en clase">
                Las preferencias personales sobre el estilo del coach, la música, el nivel, la temperatura o la dinámica del grupo no dan lugar a reembolso ni reposición. Tus comentarios son bienvenidos por el canal oficial de la sección 11.
              </Clause>
            </Section>

            <Section title="7. Puntualidad y tolerancia">
              <p>
                La tolerancia de llegada es de 5 minutos a partir de la hora de inicio de la clase. Entre el minuto 5 y el 10, el coach decide si permite la entrada, para no interrumpir la práctica del grupo. Después del minuto 10 no se permite la entrada. Si no puedes entrar, la clase se considera tomada y no se ofrece reposición.
              </p>
            </Section>

            <Section title="8. Material para la práctica">
              <Clause n="8.1" title="Material obligatorio">
                Es obligatorio tomar cada clase con el material básico que requiere la práctica, como mat de yoga y, en las sesiones de Sound Healing, también una cobija. Cada alumno debe traer su propio material. Sin el material básico no se permite tomar la clase.
              </Clause>
              <Clause n="8.2" title="Renta de material">
                El estudio no está obligado a proporcionar material. Cuenta con una cantidad limitada de material básico disponible para renta, sujeta a disponibilidad. La renta se paga por clase, en efectivo en la caja del estudio, antes de iniciar la práctica. Un Coordinador o Coordinadora de Operaciones de Popnest Wellness puede informarte el costo y gestionar la renta; el costo también puede consultarse en el sitio web. Si no traes tu material y no hay disponible para renta, o decides no rentarlo, la clase se considera tomada y no se ofrece reposición.
              </Clause>
              <Clause n="8.3" title="Uso dentro del estudio">
                El material rentado es propiedad del estudio y solo puede usarse dentro de sus instalaciones durante la clase. No está permitido sacarlo del estudio. Al terminar la clase, debe devolverse en las condiciones en que se recibió.
              </Clause>
              <Clause n="8.4" title="Daños o pérdida">
                El alumno es responsable del material que renta. En caso de daño o pérdida por mal uso, el estudio puede cobrar su reposición.
              </Clause>
              <Clause n="8.5" title="Usuarios de plataformas">
                La renta de material no está incluida en las reservas hechas a través de plataformas de terceros y se paga por separado, en efectivo en la caja del estudio.
              </Clause>
            </Section>

            <Section title="9. Reservas a través de plataformas de terceros">
              <Clause n="9.1" title="Aplicación de estos términos">
                Las personas que reservan a través de plataformas de terceros, como apps de bienestar o membresías corporativas, deben cumplir las reglas del estudio durante su asistencia. Esto incluye la tolerancia de 5 minutos, el registro de asistencia, las reglas sobre material y el uso adecuado de las instalaciones.
              </Clause>
              <p>
                Las políticas de cancelación, reposición o devolución de créditos de cada plataforma se rigen por sus propios términos y dependen de ella, con la excepción por cancelación del estudio prevista en la cláusula 9.8. Estudio Popnest no ofrece reposiciones directas por inasistencia o llegada tardía. Si la plataforma decide reponer la clase o devolver el crédito, esa decisión es de la plataforma y no genera ninguna obligación para el estudio.
              </p>
              <Clause n="9.2" title="Información en las plataformas">
                La información que aparece en las plataformas de terceros puede estar incompleta, desactualizada o resumida. Eso no se debe a Estudio Popnest. En caso de discrepancia, prevalecen estos Términos y Condiciones y la información publicada en nuestro sitio web, correos e Instagram y en el estudio. Una descripción incompleta en la plataforma no exime del cumplimiento de nuestras reglas.
              </Clause>
              <Clause n="9.3" title="Relación con la plataforma">
                La contratación, los pagos, las membresías, los créditos, los cargos y las penalizaciones de la plataforma se rigen por sus propios términos. Cualquier aclaración, reembolso o reclamación sobre esos conceptos debe dirigirse directamente a la plataforma correspondiente. Estudio Popnest no es responsable de fallas técnicas, errores de reserva, cancelaciones automáticas ni cambios en las condiciones de la plataforma.
              </Clause>
              <Clause n="9.4" title="Registro de asistencia">
                Para tomar la clase, debes registrar tu asistencia (check-in) en la aplicación de la plataforma al llegar al estudio. También debes mostrar tu reserva o código cuando un Coordinador o Coordinadora de Operaciones de Popnest Wellness lo solicite. Sin una reserva válida y un check-in registrado, el estudio puede no permitir el acceso.
              </Clause>
              <Clause n="9.5" title="Identidad">
                La reserva es personal e intransferible, salvo que el paquete, plan o promoción contratado permita expresamente compartirla. En ese caso, aplican las reglas y los límites de ese paquete o promoción. Un Coordinador o Coordinadora de Operaciones de Popnest Wellness puede solicitar una identificación para verificar que la persona que asiste es la titular de la cuenta o una persona autorizada conforme al paquete.
              </Clause>
              <Clause n="9.6" title="Disponibilidad y clases incluidas">
                Los lugares disponibles para usuarios de plataformas pueden ser limitados, y no todas las clases, horarios o actividades están necesariamente disponibles a través de ellas. Eventos especiales, talleres, clases privadas, renta de material, productos y servicios adicionales pueden tener un costo aparte. Estudio Popnest puede modificar en cualquier momento la oferta de clases disponibles en cada plataforma.
              </Clause>
              <Clause n="9.7" title="Inasistencias y reportes">
                El estudio puede reportar a la plataforma las reservas no asistidas y las llegadas fuera de la tolerancia. La plataforma determinará, conforme a sus propios términos, si aplica penalizaciones, repone la clase o devuelve el crédito.
              </Clause>
              <Clause n="9.8" title="Cancelaciones y avisos">
                Si el estudio cancela o modifica una clase, el aviso a usuarios de plataformas se hace a través de la propia plataforma o de los canales generales del estudio. Estudio Popnest no envía mensajes individuales a estos usuarios. La reprogramación o devolución del crédito se tramita primero conforme a las reglas de la plataforma. Si el estudio cancela la clase con tan poca anticipación que la plataforma ya no permite reprogramarla, solicita a un Coordinador o Coordinadora de Operaciones de Popnest Wellness la reposición prevista en la cláusula 10.2. No se otorgará una segunda reposición por la misma reserva si la plataforma ya la reprogramó o devolvió el crédito.
              </Clause>
              <Clause n="9.9" title="Quejas sobre el servicio del estudio">
                Las quejas relacionadas con la clase, el coach o las instalaciones se presentan primero ante un Coordinador o Coordinadora de Operaciones de Popnest Wellness en el estudio. Si el asunto no se resuelve allí, puedes escalarlo a <Email />. Las reseñas o calificaciones publicadas en la plataforma no sustituyen estos canales.
              </Clause>
              <Clause n="9.10" title="Datos personales">
                Para gestionar tu reserva, podemos recibir de la plataforma y compartir con ella datos como tu nombre, tu reserva y tu asistencia. Esos datos se tratan conforme a nuestro{' '}
                <Link to="/privacidad" className="underline" style={{ color: '#B73D37' }}>Aviso de Privacidad</Link> y al de la plataforma.
              </Clause>
            </Section>

            <Section title="10. Cancelaciones y cambios por parte del estudio">
              <Clause n="10.1" title="Clase cancelada por el estudio">
                El estudio puede cancelar una clase por ausencia del coach, causas de fuerza mayor o falta de un número mínimo de reservas. Si reservaste directamente en la plataforma de Estudio Popnest, puedes reponerla en otra fecha u horario conforme a la cláusula 10.2. Si reservaste mediante una plataforma externa, aplica primero la cláusula 9.8; cuando se cumpla la excepción allí prevista, también podrás solicitar la reposición de la cláusula 10.2. No se realizan reembolsos en efectivo, salvo que la ley aplicable lo exija.
              </Clause>
              <Clause n="10.2" title="Cómo reponer la clase">
                Solicita la reposición a un Coordinador o Coordinadora de Operaciones de Popnest Wellness en el estudio e indícale en qué clase y fecha quieres tomarla. Si surge un problema que no pueda resolverse allí, puedes escalarlo por correo a <Email />. La reposición debe tomarse dentro de los 8 días naturales siguientes a la cancelación y está sujeta a disponibilidad. Solo se permite una reprogramación: la fecha que elijas queda fija y no se puede cambiar. Si no asistes a la clase de reposición o no la programas dentro de ese plazo, la clase se considera tomada, salvo que el estudio también cancele la clase de reposición.
              </Clause>
              <Clause n="10.3" title="Fuerza mayor">
                Se consideran causas de fuerza mayor, entre otras, sismos o alertas sísmicas, cortes de luz o agua, inundaciones, manifestaciones o bloqueos, y cierres o disposiciones de las autoridades. En estos casos aplica lo previsto en 10.1.
              </Clause>
              <Clause n="10.4" title="Cambio de coach">
                El estudio puede sustituir al coach de una clase. Un cambio de coach no es motivo de cancelación, reembolso ni reposición.
              </Clause>
              <Clause n="10.5" title="Cambio de horario o de sala">
                Si el estudio cambia el horario de una clase que ya reservaste y no puedes asistir en el nuevo horario, la clase se convierte en un crédito para tomar otra clase disponible dentro de los 8 días naturales siguientes al aviso del cambio. Ese plazo se aplica aunque el paquete tenga una vigencia mayor. Para usar el crédito, sigue el procedimiento de la cláusula 10.2; solo se permite una reprogramación. Un cambio de sala dentro del estudio no da lugar a crédito.
              </Clause>
              <Clause n="10.6" title="Clases que dejan de ofrecerse">
                Si una clase deja de ofrecerse, las clases pendientes de tu paquete se pueden usar en otras disciplinas disponibles durante la vigencia del paquete.
              </Clause>
              <Clause n="10.7" title="Avisos">
                Los avisos de cancelaciones y cambios se publican en el sitio web, se envían por correo o WhatsApp, o se comunican por Instagram.
              </Clause>
            </Section>

            <Section title="11. Canales de comunicación y quejas">
              <Clause n="11.1" title="Canales informales">
                Instagram (@estudio_popnest) y WhatsApp (55 5437 9644) son canales de comunicación informal. Por ellos resolvemos dudas generales, compartimos horarios e información de clases y publicamos avisos. Lo que se comente por estos medios no se considera una queja, aclaración o solicitud formal, ni genera compromisos para el estudio.
              </Clause>
              <Clause n="11.2" title="Atención y escalación">
                Para quejas, aclaraciones, cobros, incidentes en clase y solicitudes de reposición, acude primero con un Coordinador o Coordinadora de Operaciones de Popnest Wellness en el estudio. Si no se resuelve el asunto allí, escálalo a <Email />. En el correo incluye tu nombre, la clase, la fecha, una descripción de lo ocurrido y, si aplica, tu comprobante de pago. El correo es el canal de escalación, no el canal de atención inicial. Los mensajes por Instagram o WhatsApp y las conversaciones con un coach no sustituyen este procedimiento.
              </Clause>
              <Clause n="11.3" title="Tiempo de respuesta">
                Respondemos los asuntos escalados por correo en un plazo de hasta 7 días hábiles a partir de que recibimos tu mensaje.
              </Clause>
              <Clause n="11.4" title="Sin excepciones">
                Los coaches y el personal del estudio no están autorizados para hacer excepciones a estos Términos y Condiciones ni para ofrecer reposiciones, créditos o reembolsos fuera de los casos previstos en ellos. Un Coordinador o Coordinadora de Operaciones de Popnest Wellness sí puede gestionar las reposiciones contempladas en la cláusula 10.2. Fuera de las reposiciones previstas en la cláusula 10.2 y gestionadas por Coordinación de Operaciones, cualquier excepción o compromiso de ese tipo solo será válido si consta por escrito desde <Email />.
              </Clause>
            </Section>

            <Section title="12. Uso adecuado y derecho de admisión">
              <p>
                Te comprometes a usar el sitio, los servicios y las instalaciones de forma lícita y respetuosa. No están permitidos el uso fraudulento, la suplantación de identidad ni cualquier conducta que perjudique al estudio, a los coaches o a otros usuarios.
              </p>
              <p>
                El estudio se reserva el derecho de admisión. Puede negar la entrada, pedir que una persona se retire de la clase o cancelar su cuenta por conducta irrespetuosa, agresiva o que ponga en riesgo a otros, o por incumplir estos términos de forma reiterada. En esos casos no hay reembolso ni reposición.
              </p>
            </Section>

            <Section title="13. Fotografía y video">
              <p>
                El estudio puede tomar fotografías o videos de las clases para registrar la asistencia y para difundir sus actividades en su sitio web y redes sociales. Si no quieres aparecer en publicaciones, avísale al coach antes de la clase o escríbenos a <Email />. Las imágenes de registro de asistencia son de uso interno y se tratan conforme a nuestro{' '}
                <Link to="/privacidad" className="underline" style={{ color: '#B73D37' }}>Aviso de Privacidad</Link>.
              </p>
            </Section>

            <Section title="14. Propiedad intelectual">
              <p>
                Los contenidos, el diseño, los logotipos y los materiales de este sitio son propiedad de Estudio Popnest o de sus respectivos titulares, y están protegidos por la legislación aplicable. No se permite su reproducción ni su uso sin autorización.
              </p>
            </Section>

            <Section title="15. Salud, riesgos y limitación de responsabilidad">
              <Clause n="15.1" title="Riesgos propios de la práctica">
                Las actividades físicas y de bienestar, como yoga, pilates, stretching, danza, meditación y sound healing, implican riesgos propios del movimiento y del esfuerzo físico, como lesiones musculares, articulares, caídas o molestias. Al participar en las clases, reconoces esos riesgos y aceptas asumirlos de forma voluntaria.
              </Clause>
              <Clause n="15.2" title="Estado de salud">
                Al reservar, declaras que te encuentras en condiciones de realizar la actividad. Eres responsable de conocer tu estado de salud y tu aptitud para la práctica. Si tienes alguna condición médica, lesión, embarazo, cirugía reciente u otra circunstancia que pueda verse afectada por la actividad física o sonora, te recomendamos consultar a tu médico antes de asistir.
              </Clause>
              <Clause n="15.3" title="Aviso al coach">
                Debes informar al coach, antes de iniciar la clase, cualquier lesión, condición o limitación relevante. El coach podrá sugerir modificaciones, pero no sustituye una valoración médica ni es responsable de condiciones que no se le hayan comunicado.
              </Clause>
              <Clause n="15.4" title="Escucha tu cuerpo">
                Cada alumno practica dentro de sus propios límites. Si sientes dolor, mareo o malestar, detente y avísale al coach. Las indicaciones del coach son una guía, y la decisión de realizar cada postura o ejercicio es tuya. Una lesión o malestar no da lugar a reposición de la clase.
              </Clause>
              <Clause n="15.5" title="Seguimiento de indicaciones">
                Debes seguir las indicaciones del coach y del personal del estudio, así como las reglas de uso de las instalaciones y del material. El estudio no es responsable de lesiones derivadas de no seguir esas indicaciones o de realizar ejercicios, posturas o movimientos por cuenta propia.
              </Clause>
              <Clause n="15.6" title="Material propio">
                El estudio no es responsable de lesiones o daños causados por el material que el alumno lleve a la clase.
              </Clause>
              <Clause n="15.7" title="Objetos personales">
                El estudio no se hace responsable por la pérdida, el robo o el daño de objetos personales dentro de sus instalaciones. Te recomendamos no llevar objetos de valor. Los objetos olvidados se guardan durante 15 días naturales; después de ese plazo, el estudio puede donarlos o desecharlos.
              </Clause>
              <Clause n="15.8" title="Limitación general">
                Estudio Popnest no será responsable de daños indirectos o consecuentes derivados del uso del sitio, de los servicios o de las instalaciones, ni de lesiones o daños que no sean atribuibles a su negligencia. Esta limitación aplica salvo en los casos en que la ley no permita limitar la responsabilidad.
              </Clause>
              <Clause n="15.9" title="Emergencias">
                En caso de una emergencia médica durante la clase, el personal del estudio podrá solicitar servicios de emergencia. Los gastos médicos que resulten corren por cuenta del alumno.
              </Clause>
            </Section>

            <Section title="16. Talleres">
              <Clause n="16.1" title="Organización y pagos">
                Cada taller es organizado por la persona o entidad anunciada como su organizadora. El precio, la forma de pago, las cancelaciones y las reposiciones se rigen por las condiciones particulares que el organizador comunique para ese taller. Las reglas de pagos y reposiciones de clases y paquetes de este documento no aplican a los talleres.
              </Clause>
              <Clause n="16.2" title="Convivencia">
                Quienes asistan a talleres deben tratar con respeto a las demás personas y cumplir las reglas de uso de las instalaciones y de admisión de la sección 12.
              </Clause>
              <Clause n="16.3" title="Material">
                Si un participante necesita rentar material del estudio, se aplica el mismo precio vigente de renta por clase y se paga en efectivo en la caja, sujeto a disponibilidad, conforme a la sección 8.
              </Clause>
              <Clause n="16.4" title="Salud y riesgos">
                Cada participante es responsable de valorar su estado de salud, informar al instructor de sus limitaciones y practicar dentro de sus posibilidades, conforme a la sección 15. El organizador responde por la conducción de su taller. Estudio Popnest no responde por lesiones o daños derivados de la actividad o de condiciones de salud del participante que no le sean atribuibles; se mantienen las responsabilidades que por ley correspondan al estudio.
              </Clause>
            </Section>

            <Section title="17. Modificaciones">
              <p>
                Podemos modificar estos Términos y Condiciones. Los cambios entran en vigor desde su publicación en esta página. Si sigues usando el sitio después de los cambios, aceptas los nuevos términos. Los cambios no afectan el precio que ya pagaste por un paquete vigente.
              </p>
            </Section>

            <Section title="18. Ley aplicable y foro">
              <p>
                Estos Términos y Condiciones se rigen por las <strong>leyes de los Estados Unidos Mexicanos</strong>. Cualquier controversia sobre su interpretación o cumplimiento se someterá a los tribunales competentes de la Ciudad de México. Las partes renuncian a cualquier otro fuero que pudiera corresponderles por su domicilio presente o futuro.
              </p>
            </Section>

            <Section title="19. Contacto y datos del titular">
              <p>
                Si tienes dudas sobre estos Términos y Condiciones, consulta primero a un Coordinador o Coordinadora de Operaciones de Popnest Wellness en el estudio. Si tu duda o problema no se resuelve allí, puedes escalarlo a <Email />.
              </p>
              <p>
                Estudio Popnest Wellness es operado por <strong>FINOVIX S.A.P.I.</strong> · Londres 105, Col. Del Carmen, Coyoacán, CDMX.
              </p>
            </Section>
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
