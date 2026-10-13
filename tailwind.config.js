/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        background: 'rgb(var(--c-background) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        primary: 'rgb(var(--c-primary) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        border: 'rgb(var(--c-border) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
