/**
 * PracticeDot - punto de color que identifica el tipo de practica.
 * Pilar del sistema visual de Popnest, presente en horario, listas,
 * tarjetas, filtros, etc.
 */

import React from 'react'

export const practiceLabels = {
  yoga: 'Yoga',
  pilates: 'Pilates',
  meditation: 'Meditacion',
  sound: 'Sound Healing',
  taichi: 'Tai Chi',
  dance: 'Belly Dance',
  stretching: 'Stretching',
}

export const PracticeDot = ({
  practice,
  size,
  className = '',
  style,
}) => {
  const customStyle = {
    ...(size && { width: `${size}px`, height: `${size}px` }),
    ...style,
  }

  return (
    <span
      className={`pn-dot pn-dot--${practice} ${className}`}
      style={customStyle}
    />
  )
}

export default PracticeDot
