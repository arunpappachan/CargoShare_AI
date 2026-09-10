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
        orbitReverse: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.6' },
          '100%': { transform: 'scale(4)', opacity: '0' },
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
        orbitReverse: 'orbitReverse 28s linear infinite',
        'orbit-fast': 'orbit 20s linear infinite',
        'orbit-fast-reverse': 'orbitReverse 20s linear infinite',
        ripple: 'ripple 0.6s linear',
        shimmer: 'shimmer 2.5s infinite',
      }
    },
  },
  plugins: [],
}
