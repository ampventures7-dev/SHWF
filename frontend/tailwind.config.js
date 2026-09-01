/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'shwf-navy': {
          DEFAULT: '#002868',
          dark: '#001a44',
          light: '#0d47a1',
          subtle: '#eef4fc',
        },
        'shwf-green': {
          DEFAULT: '#008037',
          dark: '#005a26',
          light: '#2e7d32',
          subtle: '#e8f5e9',
        },
        'shwf-orange': {
          DEFAULT: '#f37021',
          dark: '#d85404',
          light: '#ff9800',
          subtle: '#fff3e0',
        },
        'shwf-gold': {
          DEFAULT: '#c69214',
          light: '#fef9e7',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      boxShadow: {
        'card-hover': '0 20px 30px -10px rgba(0, 40, 104, 0.18)',
        'glow-orange': '0 0 20px rgba(243, 112, 33, 0.35)',
        'glow-green': '0 0 20px rgba(0, 128, 55, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulseGlow 2.5s infinite',
        'spin-fast': 'spin 0.8s linear infinite',
      }
    },
  },
  plugins: [],
}
