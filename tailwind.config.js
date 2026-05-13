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
        background: '#050505',
        surface: '#0A0A0A',
        primary: '#F3F4F6',
        muted: '#A3A3A3',
        border: '#1F1F1F',
        accent: '#00E5FF',
        'accent-dark': '#00B3CC',
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(to right, #1F1F1F 1px, transparent 1px), linear-gradient(to bottom, #1F1F1F 1px, transparent 1px)`,
      },
    },
  },
  plugins: [],
}
