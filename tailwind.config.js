/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Hanken Grotesk', 'sans-serif'],
        'body': ['Epilogue', 'sans-serif'],
      },
      colors: {
        primary: '#B73D37',
        secondary: '#C76661',
        tertiary: '#D48D88',
        quaternary: '#E5B3B0',
        body: '#374151',
        white: '#FFFFFF',
        'grey-placeholder': '#B5AEAE',
        neutral: '#DED5D5',
      },
      fontSize: {
        'h1': ['40px', { lineHeight: '1.1', fontWeight: '700' }],
        'h2': ['30px', { lineHeight: '1.4', fontWeight: '700' }],
        'h3': ['26px', { lineHeight: '1.4', fontWeight: '700' }],
        'h4': ['40px', { lineHeight: '1.1', fontWeight: '700' }],
        'h5': ['18px', { lineHeight: '1.1', fontWeight: '700' }],
        'h6': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
}
