/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                vanguard: ['Orbitron', 'sans-serif'],
                technical: ['Rajdhani', 'monospace'],
                body: ['Inter', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'entrance': 'entrance 0.8s ease-out forwards',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'flow-1': 'flow 15s linear infinite',
                'flow-2': 'flow 20s linear infinite reverse',
                'flow-3': 'flow 25s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                entrance: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                flow: {
                    '0%': { strokeDashoffset: '1000' },
                    '100%': { strokeDashoffset: '0' }
                }
            }
        },
    },
    plugins: [],
}
