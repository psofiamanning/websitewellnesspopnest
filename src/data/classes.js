import blancaBearPhoto from '../assets/blanca-bear.png'
import brendaGranadosPhoto from '../assets/brenda-granados.png'
import madelineRojasPhoto from '../assets/madeline-rojas.png'
import soundHealingPhoto from '../assets/sound-healing.png'
import yogaRestaurativoPhoto from '../assets/yoga-restaurativo.png'
import hathaPhoto from '../assets/hatha.png'
import taiChiPhoto from '../assets/tai-chi.png'

// Configuración de clases y profesores
export const teachers = [
  {
    id: 1,
    name: 'Blanca Bear',
    specialty: 'Movimiento y Yoga',
    image: blancaBearPhoto,
    bio: 'Maestra de movimiento con más de diez años de experiencia y una formación profunda y continua en yoga, tai chi, meditación, pilates y movimiento somático. Su práctica une estructura y sensibilidad, observando con atención, ajustando con cuidado y acompañando cada práctica desde la escucha corporal. Sus clases se sienten contenidas, claras y humanas, invitando al movimiento con presencia, estabilidad y confianza.',
    classes: ['Yoga Restaurativo', 'Hatha Yoga', 'Tai Chi']
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
  }
]

export const classTypes = [
  {
    id: 'yoga-restaurativo',
    name: 'Yoga Restaurativo',
    teacher: 'Blanca Bear',
    teacherId: 1,
    duration: 60,
    description: 'Práctica de yoga restaurativo en Coyoacán diseñada para liberar tensión física y mental mediante posturas pasivas sostenidas con soportes. Ideal para reducir estrés y promover relajación profunda.',
    fullDescription: 'El Yoga Restaurativo es una práctica terapéutica diseñada para activar el sistema nervioso parasimpático y promover una relajación profunda. Durante la clase, te sumergirás en posturas pasivas sostenidas durante varios minutos, utilizando soportes como cojines, mantas y bloques que permiten que el cuerpo se libere completamente de la tensión.\n\nLa práctica se realiza en un ambiente tranquilo y acogedor, con iluminación suave y música relajante. Puedes esperar una experiencia de descanso activo donde el cuerpo se regenera mientras la mente encuentra calma.\n\nEsta práctica es especialmente beneficiosa para reducir el estrés crónico, aliviar la ansiedad, mejorar la calidad del sueño, disminuir la presión arterial, aliviar dolores de espalda y cuello, fortalecer el sistema inmunológico y promover una sensación general de bienestar y equilibrio emocional.',
    image: yogaRestaurativoPhoto
  },
  {
    id: 'hatha',
    name: 'Hatha Yoga',
    teacher: 'Blanca Bear',
    teacherId: 1,
    duration: 60,
    description: 'Práctica de yoga tradicional que equilibra cuerpo y mente a través de posturas y respiración',
    fullDescription: 'El Hatha Yoga es una práctica milenaria que equilibra las energías del cuerpo mediante la combinación de posturas físicas (asanas) y técnicas de respiración (pranayama). En esta clase tradicional, explorarás secuencias de posturas que fortalecen y flexibilizan el cuerpo mientras desarrollas conciencia corporal y mental.\n\nLa práctica se desarrolla a un ritmo moderado, permitiendo que cada postura se explore con atención y precisión. Puedes esperar una clase estructurada que comienza con calentamiento, continúa con posturas de pie, sentadas y acostadas, y culmina con una relajación final.\n\nEsta práctica equilibra el sistema nervioso, mejora la flexibilidad y fuerza muscular, aumenta la capacidad pulmonar, reduce el estrés y la ansiedad, mejora la postura y alineación corporal, fortalece el sistema inmunológico, promueve la concentración y claridad mental, y ayuda a equilibrar las emociones, proporcionando una sensación de armonía y bienestar integral.',
    image: hathaPhoto
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
  }
]

// Horarios disponibles por clase
export const classSchedules = {
  'yoga-restaurativo': {
    days: ['Martes', 'Jueves'],
    times: ['10:00']
  },
  'hatha': {
    days: ['Martes', 'Jueves'],
    times: ['19:30']
  },
  'tai-chi': {
    days: ['Sábado'],
    times: ['11:30']
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
  }
}

// Horarios disponibles por profesor
export const teacherSchedules = {
  1: { // Blanca Bear
    classes: ['yoga-restaurativo', 'hatha', 'tai-chi'],
    days: ['Martes', 'Jueves', 'Sábado'],
    times: ['10:00', '11:30', '19:30']
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
  }
}
