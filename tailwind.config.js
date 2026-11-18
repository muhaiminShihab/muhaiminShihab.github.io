/** @type {import('tailwindcss').Config} */

// Themed colors read RGB channels from CSS variables (set per theme in input.css),
// so opacity modifiers like bg-surface/85 keep working in both themes.
const themed = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ["./*.html", "./assets/js/main.js"],
  theme: {
    extend: {
      colors: {
        // fixed near-black: text and fills on lime and pastel surfaces, same in both themes
        ink: '#0B0B0F',
        // page background
        canvas: themed('canvas'),
        surface: themed('surface'),
        raised: themed('raised'),
        line: {
          DEFAULT: themed('line'),
          mid: themed('line-mid'),
          strong: themed('line-strong'),
        },
        fg: {
          DEFAULT: themed('fg'),
          soft: themed('fg-soft'),
          muted: themed('fg-muted'),
        },
        // hover tint: white on dark, ink on light (use with an opacity, e.g. hover:bg-wash/5)
        wash: themed('wash'),
        accent: {
          DEFAULT: '#C8F560',
          strong: '#B5E83D',
          // accent used as text or icon color on neutral surfaces (lime is unreadable on white)
          fg: themed('accent-fg'),
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
