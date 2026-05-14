/**
 * Heading - titulo editorial con acento serif italic opcional.
 *
 * Patron clave del sistema: sans + serif italic en la misma linea.
 *   <Heading level={1}>Respirar, mover, <Heading.Accent>reconectar.</Heading.Accent></Heading>
 *
 * Niveles:
 *   - display: 88px (hero principal)
 *   - display-lg: 72px (hero secundario)
 *   - 1: 52px (h1)
 *   - 2: 42px (h2 seccion)
 *   - 3: 32px (h3 subseccion)
 *   - 4: 26px (h4)
 */

import React from 'react'

const classMap = {
  display: 'pn-display',
  'display-lg': 'pn-display-lg',
  1: 'pn-h1',
  2: 'pn-h2',
  3: 'pn-h3',
  4: 'pn-h4',
}

const defaultTag = {
  display: 'h1',
  'display-lg': 'h1',
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
}

const HeadingComponent = ({ children, level = 2, as, className = '' }) => {
  const Tag = as || defaultTag[level] || 'h2'
  const classes = [classMap[level], className].filter(Boolean).join(' ')

  return <Tag className={classes}>{children}</Tag>
}

const Accent = ({ children, className = '' }) => (
  <span
    className={`pn-serif ${className}`}
    style={{ color: 'var(--pn-color-primary)' }}
  >
    {children}
  </span>
)

HeadingComponent.Accent = Accent

export const Heading = HeadingComponent
export default Heading
