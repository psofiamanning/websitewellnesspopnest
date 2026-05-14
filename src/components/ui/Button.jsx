/**
 * Button - componente reutilizable del sistema Popnest
 *
 * Variantes:
 *   - primary (default): CTA rojo solido
 *   - ghost: outline oscuro (para fondos claros)
 *   - ghost-light: outline blanco (para fondos oscuros)
 *
 * Tamanos: sm, base (default), lg
 * Block: ocupa todo el ancho del contenedor
 */

import React from 'react'

export const Button = ({
  children,
  variant = 'primary',
  size = 'base',
  block = false,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}) => {
  const classes = [
    'pn-btn',
    `pn-btn--${variant}`,
    size !== 'base' && `pn-btn--${size}`,
    block && 'pn-btn--block',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button
