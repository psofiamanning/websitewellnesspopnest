/**
 * Catálogo de paquetes (UI + checkout). El campo `name` debe coincidir exactamente
 * con `packages.name` en Supabase para que `/api/packages/purchase` cree el registro.
 */
export const PACKAGE_OFFERS = [
  {
    id: 'package-10-classes',
    name: 'Paquete de 10 Clases',
    classes: 10,
    price: 1900,
    originalPrice: 2500,
    description:
      'Ahorra $600 comprando 10 clases. Puedes usar estas clases para cualquier práctica disponible en nuestro estudio.',
    benefits: [
      'Válido para todas las clases',
      'Válido por 2 meses desde la compra',
      'Ahorra $60 por clase frente al precio por clase suelta',
      'Flexibilidad total',
    ],
    popular: true,
  },
  {
    id: 'package-20-classes',
    name: 'Paquete de 20 Clases',
    // $4,500 incluye 2 reservas que no bajan el saldo de clases; máximo 20 reservas en total
    classes: 20,
    price: 4500,
    originalPrice: 5000,
    description:
      'Un solo pago de $4,500 MXN. Puedes reservar hasta 20 clases; las primeras 2 reservas no descuentan de tu saldo de clases del paquete.',
    benefits: [
      'Hasta 20 reservaciones con este paquete',
      'Las primeras 2 reservas no consumen tu saldo de clases',
      'Válido para todas las clases',
      'Válido por 2 meses desde la compra',
      'Flexibilidad total',
    ],
    popular: false,
  },

  // ─── PLANES EN PROPUESTA (revisión interna) ─────────────────────────────────
  // Marcados con `isProposal: true`: ocultos al público hasta aprobar el equipo.
  // `name` debe coincidir EXACTO con packages.name en Supabase
  // (server/sql/add_paquetes_propuesta_2026.sql).
  {
    id: 'paquete-descubre-3',
    name: 'Descubre Popnest',
    classes: 3,
    price: 550,
    originalPrice: 750, // 3 × $250 clase suelta
    validityDays: 30,
    isProposal: true,
    description: '3 clases para conocer nuestras disciplinas. Ideal para nuevos alumnos.',
    benefits: [
      '3 clases para conocer nuestras disciplinas',
      'Ideal para nuevos alumnos',
      'Válido para todas las clases',
      'Vigencia de 30 días',
      'Ahorra $200 frente a clases sueltas',
    ],
    popular: false,
  },
  {
    id: 'paquete-4-clases',
    name: 'Paquete de 4 Clases',
    classes: 4,
    price: 900,
    originalPrice: 1000, // 4 × $250
    validityDays: 30,
    isProposal: true,
    description: 'Perfecto para asistir una vez por semana.',
    benefits: [
      'Perfecto para asistir una vez por semana',
      'Válido para todas las clases',
      'Vigencia de 30 días',
      'Ahorra $100 frente a clases sueltas',
    ],
    popular: false,
  },
  {
    id: 'paquete-8-clases',
    name: 'Paquete de 8 Clases',
    classes: 8,
    price: 1600,
    originalPrice: 2000, // 8 × $250
    validityDays: 30,
    isProposal: true,
    description:
      'Ideal para crear el hábito de entrenar dos veces por semana. Excelente equilibrio entre precio y frecuencia.',
    benefits: [
      'Ideal para entrenar dos veces por semana',
      'Excelente equilibrio entre precio y frecuencia',
      'Válido para todas las clases',
      'Vigencia de 30 días',
      'Ahorra $400 frente a clases sueltas',
    ],
    popular: false,
  },
  {
    id: 'paquete-12-clases',
    name: 'Paquete de 12 Clases',
    classes: 12,
    price: 2200,
    originalPrice: 3000, // 12 × $250
    validityDays: 30,
    isProposal: true,
    description: 'Pensado para quienes buscan resultados más rápidos con tres clases por semana.',
    benefits: [
      'Para entrenar tres veces por semana',
      'Resultados más rápidos',
      'Válido para todas las clases',
      'Vigencia de 30 días',
      'Ahorra $800 frente a clases sueltas',
    ],
    popular: false,
  },
  {
    id: 'paquete-popnest-duo',
    name: 'Popnest Duo',
    classes: 8,
    price: 1750,
    originalPrice: 2000, // 8 × $250
    validityDays: 30,
    isProposal: true,
    description:
      '8 clases para compartir entre dos personas. Úsalas en cualquier combinación (4 y 4, 5 y 3, etc.).',
    benefits: [
      '8 clases para compartir entre dos personas',
      'Ambos pueden asistir a cualquier disciplina',
      'Úsalas en cualquier combinación (4 y 4, 5 y 3, etc.)',
      'Ideal para parejas, amigos o familiares',
      'Vigencia de 30 días',
    ],
    popular: false,
  },
  {
    id: 'paquete-ilimitado-mes',
    name: 'Ilimitado Mensual',
    // `unlimited: true` → se muestra "∞" en vez de un número. En el backend NO
    // descuenta clases: se detecta por nombre ('Ilimitado Mensual') y vale por su
    // vigencia (30 días). En la tabla packages su total_classes es 0.
    classes: 0,
    unlimited: true,
    price: 2990,
    validityDays: 30,
    isProposal: true,
    description: 'Clases ilimitadas durante un mes completo. Acceso a todas las disciplinas.',
    benefits: [
      'Clases ilimitadas',
      'Acceso a todas las disciplinas',
      'Vigencia de 30 días (pago único por mes)',
    ],
    popular: false,
  },
]
