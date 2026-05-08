import blancaBearPhoto from '../assets/blanca-bear.png'
import brendaGranadosPhoto from '../assets/brenda-granados.png'
import madelineRojasPhoto from '../assets/madeline-rojas.png'
import soundHealingPhoto from '../assets/sound-healing.png'
import yogaRestaurativoPhoto from '../assets/yoga-restaurativo.png'
import taiChiPhoto from '../assets/tai-chi.png'
import yogaVinyasaPhoto from '../assets/yoga-vinyasa.png'
import rocioEncisoPhoto from '../assets/rocio-enciso.png'
import powerYogaPhoto from '../assets/power-yoga.png'
import pilatesPhoto from '../assets/pilates.png'

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
    id: 2,
    name: 'Brenda Granados Segovia',
    specialty: 'Sound Healing',
    image: brendaGranadosPhoto,
    bio: 'Artista sonora y facilitadora de procesos de escucha con formación sólida y multidisciplinaria que integra música, arquitectura, cuerpo y prácticas contemporáneas de sound healing. Años de estudio continuo en musicoterapia, exploración vocal, cuencos y gongs, con certificaciones avaladas por la SEP. Ha desarrollado experiencias sonoras en espacios culturales y museos. Su método se caracteriza por escucha atenta.',
    classes: ['Sound Healing']
  },
  {
    id: 3,
    name: 'Madeline Rojas Givaudan',
    specialty: 'Meditación',
    image: madelineRojasPhoto,
    bio: 'Guía holística y facilitadora de espacios de conexión, conciencia y transformación personal. Su camino comenzó hace más de diez años, a través de cursos y certificaciones en herramientas de crecimiento personal, energía y prácticas meditativas. Actualmente acompaña procesos de transición, expansión y reconexión interna, integrando meditación, trabajo energético y rituales conscientes. Facilita meditaciones grupales.',
    classes: ['Meditación']
  },
  {
    id: 4,
    name: 'Hayde Ortiz',
    specialty: 'Yoga Vinyasa',
    image: yogaVinyasaPhoto,
    bio: 'Maestra de yoga que facilita Vinyasa con un enfoque consciente: el movimiento fluye con la respiración, integrando fuerza, movilidad y pausas para una práctica equilibrada y segura. Certificación Yoga Alliance de 200 horas y formación en alineamiento restaurativo y yoga terapéutico. Imparte clases privadas y en estudio.',
    classes: ['Yoga Vinyasa']
  },
  {
    id: 5,
    name: 'Rocío Enciso',
    specialty: 'Power Yoga · Yoga deportivo',
    image: rocioEncisoPhoto,
    bio: 'Preparadora física y maestra en Hatha Yoga & Fitness con certificación internacional Yoga Alliance (+500 h) y más de quince años de trayectoria. Referente en yoga deportivo: dos veces campeona nacional en México, jefa nacional de entrenadores de la Fundación Mexicana de Yoga y años en el circuito internacional con presencia en el top ten mundial. Formación en Anusara y Vinyasa, Pilates Stott y Total Barre (Akrostudio España), y talleres en pre y postnatal, espalda y rehabilitación. Embajadora oficial de la IYSF.',
    classes: ['Power Yoga']
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
    image: yogaRestaurativoPhoto
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
    image: pilatesPhoto
  },
  {
    id: 'sound-healing',
    name: 'Sound Healing',
    teacher: 'Brenda Granados Segovia',
    teacherId: 2,
    duration: 60,
    description: 'Experiencia de sanación sonora en Coyoacán que utiliza cuencos tibetanos, gongs y vibraciones terapéuticas para facilitar relajación profunda, reducir ansiedad y promover equilibrio energético.',
    fullDescription: 'El Sound Healing o Sanación Sonora es una terapia vibracional que utiliza instrumentos ancestrales como cuencos tibetanos, gongs, campanas, diapasones y la voz para crear frecuencias curativas que resuenan con el cuerpo y la mente.\n\nDurante la sesión, te recostarás cómodamente mientras te envuelves en un baño de sonidos que penetran profundamente en tus células y tejidos. La experiencia es completamente pasiva, permitiendo que el cuerpo entre en un estado de relajación profunda mientras las vibraciones trabajan a nivel celular.\n\nPuedes esperar una experiencia transformadora donde los sonidos te guían hacia estados de conciencia expandida, liberando tensiones físicas y emocionales almacenadas.\n\nEl Sound Healing reduce significativamente el estrés y la ansiedad, mejora la calidad del sueño, equilibra el sistema nervioso, libera bloqueos emocionales y traumas almacenados, reduce el dolor crónico y la inflamación, mejora la concentración y claridad mental, promueve la producción de ondas cerebrales alfa y theta asociadas con la relajación profunda, fortalece el sistema inmunológico, y facilita estados meditativos profundos, proporcionando una experiencia de sanación holística que integra cuerpo, mente y espíritu.',
    image: soundHealingPhoto
  },
  {
    id: 'meditacion',
    name: 'Meditación',
    teacher: 'Madeline Rojas Givaudan',
    teacherId: 3,
    duration: 60,
    description: 'Práctica de meditación guiada en Coyoacán que integra técnicas contemplativas, trabajo energético y rituales conscientes para desarrollar atención plena y reducir estrés.',
    fullDescription: 'La Meditación es una práctica contemplativa milenaria que entrena la mente para desarrollar atención plena, presencia y conciencia del momento presente. En esta clase guiada, explorarás diversas técnicas meditativas que incluyen meditación de atención plena (mindfulness), visualización, trabajo con la respiración, y prácticas de conexión energética.\n\nLa sesión se desarrolla en un ambiente sagrado y acogedor, donde cada práctica se adapta a tu nivel de experiencia. Puedes esperar una experiencia transformadora donde aprenderás herramientas prácticas para calmar la mente, observar tus pensamientos sin juicio, y desarrollar una relación más consciente contigo mismo y con el mundo.\n\nLa meditación reduce significativamente el estrés, la ansiedad y la depresión, mejora la concentración y la memoria, aumenta la capacidad de autorregulación emocional, fortalece el sistema inmunológico, reduce la presión arterial y mejora la salud cardiovascular, promueve la neuroplasticidad y el crecimiento de materia gris en el cerebro, mejora la calidad del sueño, desarrolla la compasión y empatía, y proporciona una sensación de paz interior y bienestar duradero, transformando tu relación con los desafíos de la vida cotidiana.',
    image: madelineRojasPhoto
  },
  {
    id: 'yoga-vinyasa',
    name: 'Yoga Vinyasa',
    teacher: 'Hayde Ortiz',
    teacherId: 4,
    duration: 60,
    description: 'Vinyasa consciente en Coyoacán: secuencias que enlazan movimiento y respiración con fuerza, movilidad y momentos de pausa para una práctica equilibrada y segura.',
    fullDescription: 'El Yoga Vinyasa que facilita Hayde enlaza posturas en fluidez, sincronizadas con la respiración. La clase integra fuerza y movilidad con espacios de contención para mantener una práctica equilibrada y segura, accesible a distintos niveles.\n\nPuedes esperar calentamiento, secuencias dinámicas y cierre con relajación. Es una práctica ideal para quien busca energía y claridad corporal sin renunciar al cuidado y la escucha.',
    image: yogaVinyasaPhoto
  },
  {
    id: 'power-yoga-1',
    name: 'Power Yoga',
    teacher: 'Rocío Enciso',
    teacherId: 5,
    duration: 60,
    description: 'Clase dinámica en Coyoacán que combina fuerza, resistencia y alineación en secuencias exigentes y claras, ideal para quien busca profundizar en posturas y energía atlética con guía experta.',
    fullDescription: 'Power Yoga es una práctica vigorosa en la que el calor y el ritmo sostienen secuencias fluidas entre posturas de pie, equilibrios y trabajo de fuerza. Rocío integra su experiencia en yoga deportivo y preparación física para ofrecer una clase desafiante y ordenada, con atención al detalle y opciones para distintos niveles.\n\nPuedes esperar calentamiento activo, series que desarrollan resistencia y estabilidad, y un cierre que devuelve el cuerpo a la calma. Es una propuesta para quien disfruta del movimiento intenso sin perder la consciencia respiratoria y la integridad articular.',
    image: powerYogaPhoto
  },
  {
    id: 'tai-chi',
    name: 'Tai Chi',
    teacher: 'Blanca Bear',
    teacherId: 1,
    duration: 60,
    description: 'Arte marcial suave y meditativo que integra movimientos fluidos, técnicas de respiración consciente y principios de meditación. Practica Tai Chi en Coyoacán para mejorar equilibrio y bienestar integral.',
    fullDescription: 'El Tai Chi es un arte marcial interno chino que combina movimientos lentos, fluidos y circulares con respiración profunda y meditación en movimiento. Esta práctica milenaria se realiza de pie, ejecutando secuencias de movimientos que fluyen como una danza suave y continua.\n\nDurante la clase, aprenderás formas tradicionales que conectan cuerpo, mente y espíritu en un movimiento armonioso. Puedes esperar una práctica accesible para todos los niveles, donde cada movimiento se enseña paso a paso, permitiendo que desarrolles coordinación, equilibrio y conciencia corporal.\n\nEl Tai Chi mejora significativamente el equilibrio y reduce el riesgo de caídas, aumenta la flexibilidad y rango de movimiento, fortalece las piernas y el core, reduce el estrés y la ansiedad, mejora la concentración y claridad mental, fortalece el sistema cardiovascular de manera suave, alivia dolores articulares y musculares, promueve la circulación sanguínea y linfática, y desarrolla la coordinación y agilidad, ofreciendo beneficios tanto físicos como mentales para personas de todas las edades.',
    image: taiChiPhoto
  }
]

// Horarios disponibles por clase
export const classSchedules = {
  'hatha-yoga': {
    days: ['Martes', 'Jueves'],
    times: ['10:30', '19:30'],
    timesByDay: {
      Martes: ['10:30', '19:30'],
      Jueves: ['10:30', '19:30']
    }
  },
  'tai-chi': {
    days: ['Sábado'],
    times: ['11:30']
  },
  'pilates': {
    days: ['Martes', 'Jueves'],
    times: ['09:30'],
    timesByDay: {
      Martes: ['09:30'],
      Jueves: ['09:30']
    }
  },
  'sound-healing': {
    days: ['Sábado', 'Domingo'],
    times: ['08:00', '10:00'],
    // Sábado solo 10:00; Domingo mantiene ambos horarios
    timesByDay: { 'Sábado': ['10:00'], 'Domingo': ['08:00', '10:00'] }
  },
  'meditacion': {
    days: ['Lunes', 'Miércoles'],
    times: ['08:00', '19:00']
  },
  'yoga-vinyasa': {
    days: ['Martes', 'Jueves'],
    times: ['07:00']
  },
  'power-yoga-1': {
    days: ['Lunes', 'Martes', 'Miércoles', 'Jueves'],
    times: [],
    timesByDay: {
      'Lunes': ['07:00'],
      'Martes': ['08:30'],
      'Miércoles': ['07:00'],
      'Jueves': ['08:30']
    }
  }
}

// Horarios disponibles por coach (id = teachers.id)
export const teacherSchedules = {
  1: { // Blanca Bear
    classes: ['hatha-yoga', 'tai-chi', 'pilates'],
    days: ['Martes', 'Jueves', 'Sábado'],
    times: ['09:30', '10:30', '19:30', '11:30']
  },
  2: { // Brenda Granados Segovia - Sábado solo 10:00
    classes: ['sound-healing'],
    days: ['Sábado', 'Domingo'],
    times: ['08:00', '10:00'],
    timesByDay: { 'Sábado': ['10:00'], 'Domingo': ['08:00', '10:00'] }
  },
  3: { // Madeline Rojas Givaudan
    classes: ['meditacion'],
    days: ['Lunes', 'Miércoles'],
    times: ['08:00', '19:00']
  },
  4: { // Hayde Ortiz
    classes: ['yoga-vinyasa'],
    days: ['Martes', 'Jueves'],
    times: ['07:00']
  },
  5: { // Rocío Enciso
    classes: ['power-yoga-1'],
    days: ['Lunes', 'Martes', 'Miércoles', 'Jueves'],
    times: ['07:00', '08:30'],
    timesByDay: {
      'Lunes': ['07:00'],
      'Martes': ['08:30'],
      'Miércoles': ['07:00'],
      'Jueves': ['08:30']
    }
  }
}
