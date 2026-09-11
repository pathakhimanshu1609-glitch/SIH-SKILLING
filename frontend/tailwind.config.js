/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        govt: {
          navy: '#0B3D6B',
          'navy-dark': '#072847',
          'navy-light': '#14538E',
          orange: '#FF6B00',
          'orange-hover': '#E05E00',
          'orange-light': '#FFF0E6',
          gold: '#FFC72C',
          bg: '#F4F7FA',
          border: '#D1D5DB'
        }
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        sans: ['Roboto', 'sans-serif']
      },
      boxShadow: {
        'govt-card': '0 4px 6px -1px rgba(11, 61, 107, 0.08), 0 2px 4px -1px rgba(11, 61, 107, 0.04)',
        'govt-header': '0 2px 10px rgba(7, 40, 71, 0.15)',
        'govt-sidebar': '2px 0 10px rgba(11, 61, 107, 0.05)',
      }
    },
  },
  plugins: [],
}
