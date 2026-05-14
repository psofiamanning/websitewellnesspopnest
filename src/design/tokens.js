/**
 * POPNEST DESIGN TOKENS
 * Version JavaScript del sistema de diseno.
 * Util para componentes que necesiten acceder a tokens programaticamente.
 *
 * Uso:
 *   import { tokens } from './design/tokens'
 *   <div style={{ color: tokens.color.primary }}>
 */

export const tokens = {
  color: {
    // Brand
    primary: '#b73d37',
    primaryHover: '#9d342e',
    secondary: '#c76661',
    tertiary: '#d48d88',

    // Text
    text: '#2d2e35',
    textSoft: '#4a4a4f',
    textMuted: '#6b6960',
    textSubtle: '#7a6b54',
    textFaint: '#998f7e',

    // Backgrounds
    bgBase: '#f4ede2',
    bgElevated: '#fbf6ec',
    bgSecondary: '#ede4d2',
    bgTertiary: '#e4d9c3',
    bgWarm: '#d8c5af',
    bgDark: '#2d2e35',

    // Borders
    border: '#c9bda6',
    borderSoft: '#d9cdb8',
    borderStrong: '#b8a886',

    // Practices (color-coding system)
    practice: {
      yoga: '#b73d37',
      pilates: '#c76661',
      meditation: '#374151',
      sound: '#d48d88',
      taichi: '#a89a82',
    },

    // States
    successBg: '#ede4d2',
    successText: '#5a4d39',
    errorBg: '#fbe5e3',
    errorText: '#b73d37',

    // On dark
    onDark: '#f4ede2',
    onDarkSoft: '#d8c5af',
    onDarkMuted: '#e6dcc6',
  },

  font: {
    sans: "'DM Sans', system-ui, -apple-system, sans-serif",
    serif: "'Instrument Serif', Georgia, 'Times New Roman', serif",
  },

  text: {
    // Desktop sizes
    displayXl: '88px',
    displayLg: '72px',
    display: '54px',
    h1: '52px',
    h2: '42px',
    h3: '32px',
    h4: '26px',
    lg: '18px',
    base: '15px',
    sm: '14px',
    xs: '13px',
    eyebrow: '11px',
    micro: '10px',

    // Mobile sizes
    mobile: {
      displayXl: '56px',
      displayLg: '54px',
      display: '42px',
      h1: '36px',
      h2: '32px',
      h3: '26px',
    },
  },

  weight: {
    regular: 400,
    medium: 500,
  },

  leading: {
    tight: 0.95,
    snug: 1.15,
    normal: 1.55,
    relaxed: 1.7,
  },

  tracking: {
    tight: '-0.035em',
    snug: '-0.02em',
    base: '0',
    wide: '0.04em',
    wider: '0.18em',
    widest: '0.22em',
    formal: '0.3em',
  },

  space: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '14px',
    5: '18px',
    6: '22px',
    7: '28px',
    8: '32px',
    9: '40px',
    10: '48px',
    11: '56px',
    12: '64px',
    13: '72px',
    14: '80px',
    15: '88px',
  },

  layout: {
    sectionPaddingX: '32px',
    sectionPaddingY: '80px',
    sectionPaddingXMobile: '24px',
    sectionPaddingYMobile: '40px',
    containerMax: '1280px',
    containerNarrow: '760px',
  },

  border: {
    thin: '0.5px solid #c9bda6',
    soft: '0.5px solid #d9cdb8',
    strong: '1px solid #7a6b54',
    accent: '3px solid #b73d37',
  },

  radius: {
    none: '0',
    pill: '100px',
  },

  shadow: {
    focus: '0 0 0 3px rgba(183, 61, 55, 0.08)',
  },

  image: {
    grading: 'grayscale(0.3) sepia(0.12)',
    gradingStrong: 'grayscale(0.5) sepia(0.1) contrast(1.05)',
    gradingSoft: 'grayscale(0.2) sepia(0.12) brightness(0.95)',
    gradingDark: 'grayscale(0.4) brightness(0.55)',
  },

  transition: {
    fast: '150ms ease',
    base: '200ms ease',
    slow: '250ms ease',
    image: '600ms ease',
  },
}

export default tokens
