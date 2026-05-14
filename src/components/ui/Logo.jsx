/**
 * Logo - el lockup oficial del studio: "e" en serif italic + "STUDIO POPNEST".
 *
 * Tamanos:
 *   - sm: para footer mobile
 *   - base: navegacion standard
 *   - lg: hero / landing
 */

import React from 'react'

const sizes = {
  sm: { e: '24px', name: '10px' },
  base: { e: '30px', name: '11px' },
  lg: { e: '40px', name: '13px' },
}

export const Logo = ({ size = 'base', className = '' }) => {
  const s = sizes[size]

  return (
    <div className={`pn-nav__logo ${className}`}>
      <span
        className="pn-serif pn-nav__logo-e"
        style={{ fontSize: s.e }}
      >
        e
      </span>
      <span
        className="pn-nav__logo-name"
        style={{ fontSize: s.name }}
      >
        studio popnest
      </span>
    </div>
  )
}

export default Logo
