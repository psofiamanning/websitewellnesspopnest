import blancaBearPhoto from '../assets/blanca-bear.png'
import rocioEncisoPhoto from '../assets/rocio-enciso.png'
import classIconHatha from '../assets/class-hatha-yoga.png'
import classIconPilates from '../assets/class-pilates.png'
import classIconSound from '../assets/class-sound-healing.png'
import classIconPower from '../assets/class-power-yoga.png'
import classIconTaiChi from '../assets/class-tai-chi.png'

// TODO(íconos): Belly Dance y Stretching usan íconos placeholder (Tai Chi / Pilates)
//   hasta tener arte propio. Reemplazar `image` cuando lleguen los archivos definitivos.

// Configuración de clases y coaches (`teachers` en código)
export const teachers = [
  {
    id: 1,
    name: 'Blanca Bear',
    specialty: 'Movimiento y Yoga',
    image: blancaBearPhoto,
    bio: 'Maestra de movimiento con más de diez años de experiencia y una formación profunda y continua en yoga, tai chi, meditación, pilates y movimiento somático. Su práctica une estructura y sensibilidad, observando con atención, ajustando con cuidado y acompañando cada práctica desde la escucha corporal. Sus clases se sienten contenidas, claras y humanas, invitando al movimiento con presencia, estabilidad y confianza.',
    classes: ['Hatha Yoga', 'Pilates', 'Tai Chi']
  },
  {
    id: 5,
    name: 'Rocío Enciso',
    specialty: 'Power Yoga · Yoga deportivo',
    image: rocioEncisoPhoto,
    bio: 'Preparadora física y maestra en Hatha Yoga & Fitness con certificación internacional Yoga Alliance (+500 h) y más de quince años de trayectoria. Referente en yoga deportivo: dos veces campeona nacional en México, jefa nacional de entrenadores de la Fundación Mexicana de Yoga y años en el circuito internacional con presencia en el top ten mundial. Formación en Anusara y Vinyasa, Pilates Stott y Total Barre (Akrostudio España), y talleres en pre y postnatal, espalda y rehabilitación. Embajadora oficial de la IYSF.',
    classes: ['Power Yoga', 'Stretching']
  },
  {
    id: 6,
    name: 'Nadia Navarrete',
    specialty: 'Belly Dance Wellness',
    image: null, // Sin foto por ahora — la tarjeta muestra un avatar con iniciales.
    bio: 'Bailarina y facilitadora de danza árabe con más de 25 años de trayectoria y 22 años impartiendo clases grupales y particulares, presenciales y en línea, en academias, gimnasios, centros culturales y espacios independientes. Fundadora del programa Bellydance Wellness y creadora de Mujeres Inspiración, una comunidad de apoyo y bienestar femenino a través de la danza y el movimiento. Se ha presentado en foros como el Teatro Ana María Hernández, el Teatro Coyoacán y la Feria del Hogar, y participó en la Gala de Clausura Copa Qatar–México 2021 y en proyectos culturales de la UAM y la UNAM. Su formación incluye estudios con Tamalyn Dallal, el percusionista Hossam Ramzy y el compositor Francisco Bringas, además de una base desde la infancia en gimnasia rítmica, danza regional y jazz, y más de diez años de práctica continua de yoga y entrenamiento funcional. Sus clases integran técnica, coordinación y expresión corporal para fortalecer el cuerpo, mejorar la postura y reconectar con la confianza y la feminidad.',
    classes: ['Belly Dance']
  },
  {
    id: 7,
    name: 'Juan Martínez',
    specialty: 'Sound Healing',
    image: null, // Sin foto por ahora — la tarjeta muestra un avatar con iniciales.
    bio: 'Facilitador de Sound Healing. Acompaña sesiones de sanación sonora con cuencos, gongs y vibraciones para una relajación profunda.', // TODO: bio definitiva pendiente.
    classes: ['Sound Healing']
  }
]

export const classTypes = [
  {
    id: 'hatha-yoga',
    name: 'Hatha Yoga',
    teacher: 'Blanca Bear',
    teacherId: 1,
    duration: 60,
    description:
      'Práctica tradicional de Hatha Yoga en Coyoacán para equilibrar cuerpo y mente con posturas, respiración y atención consciente.',
    fullDescription:
      'Hatha Yoga es una práctica clásica que integra posturas sostenidas, respiración consciente y pausas de atención para fortalecer el cuerpo y calmar la mente. El ritmo es claro y accesible, ideal para construir base técnica y presencia.\n\nPuedes esperar una secuencia progresiva con movilidad suave, trabajo de alineación, respiración guiada y cierre de relajación. Es una práctica equilibrada para cultivar estabilidad, flexibilidad y enfoque.',
    image: classIconHatha,
  },
  {
    id: 'pilates',
    name: 'Pilates',
    teacher: 'Blanca Bear',
    teacherId: 1,
    duration: 60,
    description:
      'Clase de Pilates en Coyoacán enfocada en core, alineación y control del movimiento. Ideal para fortalecer el centro del cuerpo, mejorar postura y ganar estabilidad con guía experta.',
    fullDescription:
      'En esta sesión trabajamos desde los principios del método: respiración, precisión y fluidez. La clase integra ejercicios en colchoneta y opciones progresivas para distintos niveles, con atención a la columna y la pelvis.\n\nPuedes esperar calentamiento articular, series de fortalecimiento del abdomen y espalda, y cierre con estiramientos. Es una práctica clara y contenida, pensada para sentir el cuerpo con más consciencia y sin prisa.',
    image: classIconPilates,
  },
  {
    id: 'tai-chi',
    name: 'Tai Chi',
    teacher: 'Blanca Bear',
    teacherId: 1,
    duration: 60,
    description: 'Arte marcial suave y meditativo que integra movimientos fluidos, técnicas de respiración consciente y principios de meditación. Practica Tai Chi en Coyoacán para mejorar equilibrio y bienestar integral.',
    fullDescription: 'El Tai Chi es un arte marcial interno chino que combina movimientos lentos, fluidos y circulares con respiración profunda y meditación en movimiento. Esta práctica milenaria se realiza de pie, ejecutando secuencias de movimientos que fluyen como una danza suave y continua.\n\nDurante la clase, aprenderás formas tradicionales que conectan cuerpo, mente y espíritu en un movimiento armonioso. Puedes esperar una práctica accesible para todos los niveles, donde cada movimiento se enseña paso a paso, permitiendo que desarrolles coordinación, equilibrio y conciencia corporal.\n\nEl Tai Chi mejora significativamente el equilibrio y reduce el riesgo de caídas, aumenta la flexibilidad y rango de movimiento, fortalece las piernas y el core, reduce el estrés y la ansiedad, mejora la concentración y claridad mental, fortalece el sistema cardiovascular de manera suave, alivia dolores articulares y musculares, promueve la circulación sanguínea y linfática, y desarrolla la coordinación y agilidad, ofreciendo beneficios tanto físicos como mentales para personas de todas las edades.',
    image: classIconTaiChi,
  },
  {
    id: 'power-yoga-1',
    name: 'Power Yoga',
    teacher: 'Rocío Enciso',
    teacherId: 5,
    duration: 60,
    description: 'Clase dinámica en Coyoacán que combina fuerza, resistencia y alineación en secuencias exigentes y claras, ideal para quien busca profundizar en posturas y energía atlética con guía experta.',
    fullDescription: 'Power Yoga es una práctica vigorosa en la que el calor y el ritmo sostienen secuencias fluidas entre posturas de pie, equilibrios y trabajo de fuerza. Rocío integra su experiencia en yoga deportivo y preparación física para ofrecer una clase desafiante y ordenada, con atención al detalle y opciones para distintos niveles.\n\nPuedes esperar calentamiento activo, series que desarrollan resistencia y estabilidad, y un cierre que devuelve el cuerpo a la calma. Es una propuesta para quien disfruta del movimiento intenso sin perder la consciencia respiratoria y la integridad articular.',
    image: classIconPower,
  },
  {
    id: 'sound-healing',
    name: 'Sound Healing',
    teacher: 'Juan Martínez',
    teacherId: 7,
    duration: 60,
    description: 'Experiencia de sanación sonora en Coyoacán que utiliza cuencos tibetanos, gongs y vibraciones terapéuticas para facilitar relajación profunda, reducir ansiedad y promover equilibrio energético.',
    fullDescription: 'El Sound Healing o Sanación Sonora es una terapia vibracional que utiliza instrumentos ancestrales como cuencos tibetanos, gongs, campanas, diapasones y la voz para crear frecuencias curativas que resuenan con el cuerpo y la mente.\n\nDurante la sesión, te recostarás cómodamente mientras te envuelves en un baño de sonidos que penetran profundamente en tus células y tejidos. La experiencia es completamente pasiva, permitiendo que el cuerpo entre en un estado de relajación profunda mientras las vibraciones trabajan a nivel celular.\n\nPuedes esperar una experiencia transformadora donde los sonidos te guían hacia estados de conciencia expandida, liberando tensiones físicas y emocionales almacenadas.\n\nEl Sound Healing reduce significativamente el estrés y la ansiedad, mejora la calidad del sueño, equilibra el sistema nervioso, libera bloqueos emocionales y traumas almacenados, reduce el dolor crónico y la inflamación, mejora la concentración y claridad mental, promueve la producción de ondas cerebrales alfa y theta asociadas con la relajación profunda, fortalece el sistema inmunológico, y facilita estados meditativos profundos, proporcionando una experiencia de sanación holística que integra cuerpo, mente y espíritu.',
    image: classIconSound,
  },
  {
    id: 'belly-dance',
    name: 'Belly Dance',
    teacher: 'Nadia Navarrete',
    teacherId: 6,
    duration: 60,
    description:
      'Clase de danza árabe en Coyoacán que combina técnica, coordinación y expresión corporal. Fortalece el cuerpo, mejora la postura y reconecta con tu confianza. No necesitas experiencia previa.',
    fullDescription:
      'La clase de Belly Dance es una práctica de danza árabe que combina técnica, coordinación y expresión corporal. A través de movimientos fluidos y dinámicos, fortalecerás el cuerpo, mejorarás tu postura y conectarás con tu confianza y feminidad.\n\nCada sesión integra calentamiento, trabajo de aislamientos y desplazamientos, y una secuencia final para disfrutar el movimiento. No necesitas experiencia previa: la práctica se adapta a todos los niveles.',
    image: classIconTaiChi, // TODO: ícono placeholder — reemplazar por arte de Belly Dance.
  },
  {
    id: 'stretching',
    name: 'Stretching',
    teacher: 'Rocío Enciso',
    teacherId: 5,
    duration: 60,
    description:
      'Clase de estiramiento en Coyoacán para mejorar flexibilidad, movilidad y postura mediante estiramientos conscientes y progresivos. Apta para todos los niveles.',
    fullDescription:
      'Stretching es una clase enfocada en mejorar la flexibilidad, la movilidad y la postura mediante estiramientos conscientes y progresivos. Libera la tensión acumulada, amplía tu rango de movimiento y disfruta una sensación de ligereza y bienestar.\n\nLa sesión avanza de forma gradual, con respiración guiada y opciones para cada cuerpo. Es una práctica apta para todos los niveles, ideal para complementar tu entrenamiento o para tus días de recuperación.',
    image: classIconPilates, // TODO: ícono placeholder — reemplazar por arte de Stretching.
  },
]

// Horarios disponibles por clase
export const classSchedules = {
  'hatha-yoga': {
    days: ['Jueves', 'Domingo'],
    times: ['08:00', '20:30'],
    timesByDay: {
      Jueves: ['20:30'],
      Domingo: ['08:00']
    }
  },
  'pilates': {
    days: ['Lunes', 'Martes', 'Miércoles', 'Jueves'],
    times: ['08:30', '09:30', '19:30'],
    timesByDay: {
      Lunes: ['08:30'],
      Martes: ['09:30', '19:30'],
      Miércoles: ['08:30'],
      Jueves: ['09:30']
    }
  },
  'tai-chi': {
    days: ['Lunes', 'Miércoles', 'Sábado'],
    times: ['10:30', '19:30'],
    timesByDay: {
      Lunes: ['19:30'],
      Miércoles: ['19:30'],
      Sábado: ['10:30']
    }
  },
  'power-yoga-1': {
    days: ['Martes'],
    times: ['08:30']
  },
  'sound-healing': {
    days: ['Martes', 'Miércoles', 'Domingo'],
    times: ['09:00', '20:30'],
    timesByDay: {
      Martes: ['20:30'],
      Miércoles: ['20:30'],
      Domingo: ['09:00']
    }
  },
  'belly-dance': {
    days: ['Miércoles', 'Viernes'],
    times: ['18:00'],
    timesByDay: {
      Miércoles: ['18:00'],
      Viernes: ['18:00']
    }
  },
  'stretching': {
    days: ['Viernes', 'Sábado'],
    times: ['08:30', '09:00'],
    timesByDay: {
      Viernes: ['08:30'],
      Sábado: ['09:00']
    }
  }
}

// Horarios disponibles por coach (id = teachers.id). Nota: no se consume en la app
// hoy; se mantiene sincronizado con classSchedules como referencia.
export const teacherSchedules = {
  1: { // Blanca Bear
    classes: ['pilates', 'hatha-yoga', 'tai-chi'],
    days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Sábado', 'Domingo'],
    times: ['08:00', '08:30', '09:30', '10:30', '19:30', '20:30'],
    timesByDay: {
      Lunes: ['08:30', '19:30'],
      Martes: ['09:30', '19:30'],
      Miércoles: ['08:30', '19:30'],
      Jueves: ['09:30', '20:30'],
      Sábado: ['10:30'],
      Domingo: ['08:00']
    }
  },
  5: { // Rocío Enciso
    classes: ['power-yoga-1', 'stretching'],
    days: ['Martes', 'Viernes', 'Sábado'],
    times: ['08:30', '09:00'],
    timesByDay: {
      Martes: ['08:30'],
      Viernes: ['08:30'],
      Sábado: ['09:00']
    }
  },
  6: { // Nadia Navarrete
    classes: ['belly-dance'],
    days: ['Miércoles', 'Viernes'],
    times: ['18:00'],
    timesByDay: {
      Miércoles: ['18:00'],
      Viernes: ['18:00']
    }
  },
  7: { // Juan Martínez
    classes: ['sound-healing'],
    days: ['Martes', 'Miércoles', 'Domingo'],
    times: ['09:00', '20:30'],
    timesByDay: {
      Martes: ['20:30'],
      Miércoles: ['20:30'],
      Domingo: ['09:00']
    }
  }
}
