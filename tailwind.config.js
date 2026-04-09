/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'amber-gold': '#f5c842',
        'deep-black': '#0a0a0a',
        'velvet-black': '#050505',
      },
      fontFamily: {
        lato: ['Lato', 'sans-serif'],
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'serif'],
        mono: ['"Space Mono"', '"Courier New"', 'monospace'],
      },
      letterSpacing: {
        'extreme': '0.4em',
      },
      animation: {
        'scan': 'scan 15s linear infinite',
        'float-up': 'float-up var(--duration) linear infinite',
        'pulse-soft': 'pulse-soft 6s ease-in-out infinite',
        'draw-line': 'draw-line 1.5s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'holographic': 'holographic 3s linear infinite',
        'float-slow': 'float-slow 25s ease-in-out infinite',
        'rgb-shift': 'rgb-shift 0.4s ease-out forwards',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        'float-up': {
          '0%': { transform: 'translateY(110vh) translateX(0)', opacity: 0 },
          '20%': { opacity: 0.15 },
          '80%': { opacity: 0.15 },
          '100%': { transform: 'translateY(-10vh) translateX(30px)', opacity: 0 }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: 0.2, transform: 'scale(1)' },
          '50%': { opacity: 0.5, transform: 'scale(1.1)' }
        },
        'draw-line': {
          '0%': { width: '0%', opacity: 0 },
          '100%': { width: '100%', opacity: 1 }
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        holographic: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' }
        },
        'float-slow': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(20px, 15px) rotate(3deg)' },
          '66%': { transform: 'translate(-10px, 20px) rotate(-2deg)' }
        },
        'rgb-shift': {
          '0%': { textShadow: '2px 0 #f00, -2px 0 #0ff', filter: 'blur(2px)' },
          '100%': { textShadow: '0 0 transparent', filter: 'blur(0)' }
        }
      }
    },
  },
  plugins: [],
}
