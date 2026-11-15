/**
 * Logo oficial (marca) — `src/assets/logo-nav.webp` (raster ligero de `logo.svg`).
 *
 * Tamanos: sm · base · lg (altura del glifo)
 */

import React from 'react'
import logoSrc from '../../assets/logo-nav.webp'

const heights = {
  sm: '30px',
  base: '40px',
  lg: '52px',
}

export const Logo = ({ size = 'base', className = '' }) => {
  const height = heights[size] || heights.base

  return (
    <div className={`pn-nav__logo pn-nav__logo--official ${className}`}>
      <img
        src={logoSrc}
        alt="Estudio Popnest Wellness"
        style={{
          height,
          width: 'auto',
          maxWidth: '220px',
          display: 'block',
          objectFit: 'contain',
        }}
      />
    </div>
  )
}

export default Logo
