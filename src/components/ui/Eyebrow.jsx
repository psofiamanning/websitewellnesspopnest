/**
 * Eyebrow - etiqueta uppercase espaciada que va arriba de los titulos.
 * Es uno de los elementos firma del sistema editorial.
 *
 * Variantes:
 *   - default: gris terroso
 *   - red: rojo brand (para enfasis)
 *   - on-dark: para fondos oscuros
 *
 * withLines: agrega las lineas decorativas a los lados (- Texto -)
 */

import React from 'react'

export const Eyebrow = ({
  children,
  variant = 'default',
  withLines = false,
  className = '',
}) => {
  const classes = [
    'pn-eyebrow',
    variant === 'red' && 'pn-eyebrow--red',
    variant === 'on-dark' && 'pn-eyebrow--on-dark',
    withLines && 'pn-divider-editorial',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <span className={classes}>{children}</span>
}

export default Eyebrow
