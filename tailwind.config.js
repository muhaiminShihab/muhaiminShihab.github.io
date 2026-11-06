/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./assets/js/main.js"],
  theme: {
    extend: {
      colors: {
        ink: '#0B0B0F',
        surface: '#121218',
        raised: '#1C1C24',
        line: {
          DEFAULT: '#26262E',
          strong: '#3F3F46',
        },
        fg: {
          DEFAULT: '#F4F4F5',
          soft: '#D4D4D8',
          muted: '#A1A1AA',
        },
        accent: {
          DEFAULT: '#C8F560',
          strong: '#B5E83D',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
                mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        page: '80rem',
      },
      borderRadius: {
        tile: '1.75rem',
      },
    },
  },
  plugins: [],
}
