/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'glitch': 'glitch 0.3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'border-flow': 'border-flow 4s ease infinite',
        'flicker': 'flicker 3s linear infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { textShadow: '0 0 5px rgba(0,255,255,0.5), 0 0 10px rgba(0,255,255,0.3)' },
          '50%': { textShadow: '0 0 20px rgba(0,255,255,0.8), 0 0 30px rgba(0,255,255,0.5)' },
        },
        glitch: {
          '0%, 100%': { transform: 'skew(0deg, 0deg)' },
          '33%': { transform: 'skew(5deg, 2deg)' },
          '66%': { transform: 'skew(-3deg, -1deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'border-flow': {
          '0%, 100%': { borderColor: '#00ffff' },
          '33%': { borderColor: '#a855f7' },
          '66%': { borderColor: '#ec4899' },
        },
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.3 },
        }
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      }
    },
  },
  plugins: [],
}