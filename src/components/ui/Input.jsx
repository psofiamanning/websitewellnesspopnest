/**
 * Input - campo de formulario con label uppercase eyebrow.
 *
 * Patron clave: label en estilo eyebrow (mayusculas espaciado tracking-wider),
 * input con fondo crema que se vuelve blanco al focus, anillo rojo sutil.
 */

import React from 'react'

export const Input = ({
  label,
  hint,
  rightSlot,
  containerClassName = '',
  className = '',
  ...rest
}) => {
  return (
    <div className={`pn-field ${containerClassName}`}>
      {label && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <label className="pn-field__label">{label}</label>
          {rightSlot}
        </div>
      )}
      <input className={`pn-field__input ${className}`} {...rest} />
      {hint && <span className="pn-field__hint">{hint}</span>}
    </div>
  )
}

export default Input
