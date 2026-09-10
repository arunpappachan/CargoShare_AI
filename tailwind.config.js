//** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      keyframes: {
        sail: {
          '0%': { transform: 'translateX(-20%)' },
          '100%': { transform: 'translateX(120%)' },
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.8 },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        orbitSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        orbitReverse: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        orbitReverseSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        dashMove: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.6' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        popIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        sail: 'sail 20s linear infinite',
        bob: 'bob 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 4s ease-in-out infinite',
        orbit: 'orbit 28s linear infinite',
        orbitSlow: 'orbitSlow 32s linear infinite',
        orbitReverse: 'orbitReverse 28s linear infinite',
        orbitReverseSlow: 'orbitReverseSlow 32s linear infinite',
        'orbit-fast': 'orbit 20s linear infinite',
        'orbit-fast-reverse': 'orbitReverse 20s linear infinite',
        dashMove: 'dashMove 20s linear infinite',
        ripple: 'ripple 0.6s linear',
        popIn: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        slideInRight: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        shimmer: 'shimmer 2.5s infinite',
      }
    },
  },
  plugins: [],
}
