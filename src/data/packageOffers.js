/**
 * Catálogo de paquetes (UI + checkout). El campo `name` debe coincidir exactamente
 * con `packages.name` en Supabase para que `/api/packages/purchase` cree el registro.
 */
export const PACKAGE_OFFERS = [
  {
    id: 'package-10-classes',
    name: 'Paquete de 10 Clases',
    classes: 10,
    price: 1800,
    originalPrice: 2000,
    description:
      'Ahorra $200 comprando 10 clases. Puedes usar estas clases para cualquier práctica disponible en nuestro estudio.',
    benefits: [
      'Válido para todas las clases',
      'Válido por 2 meses desde la compra',
      'Ahorra $20 por clase',
      'Flexibilidad total',
    ],
    popular: true,
  },
  {
    id: 'package-20-classes',
    name: 'Paquete de 20 Clases',
    // $3,600 incluye 2 reservas que no bajan el saldo de clases; máximo 20 reservas en total
    classes: 20,
    price: 3600,
    originalPrice: 4000,
    description:
      'Un solo pago de $3,600 MXN. Puedes reservar hasta 20 clases; las primeras 2 reservas no descuentan de tu saldo de clases del paquete.',
    benefits: [
      'Hasta 20 reservaciones con este paquete',
      'Las primeras 2 reservas no consumen tu saldo de clases',
      'Válido para todas las clases',
      'Válido por 2 meses desde la compra',
      'Flexibilidad total',
    ],
    popular: false,
  },
]
