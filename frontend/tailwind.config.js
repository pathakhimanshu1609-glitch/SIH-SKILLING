/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#FFFFFF',
        'bg-section': '#F8F9FA',
        primary: {
          DEFAULT: '#D2691E',
          hover: '#B85814',
          light: '#FDEEE0',
          border: '#D2691E',
        },
        navy: {
          DEFAULT: '#0B3D6B',
          dark: '#072847',
          light: '#14538E',
        },
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        border: '#E5E7EB',
        'banner-peach': {
          DEFAULT: '#FDEEE0',
          border: '#F8D3B8',
        },
        'banner-lavender': {
          DEFAULT: '#E8ECFB',
          border: '#D1DBF7',
        },
        'badge-blue': {
          DEFAULT: '#E0E7FF',
          text: '#1D4ED8',
        },
        success: {
          DEFAULT: '#10B981',
          hover: '#059669',
        },
        saffron: {
          DEFAULT: '#D2691E',
          hover: '#B85814',
          light: '#FDEEE0',
          border: '#D2691E',
        },
        sid: {
          orange: '#D2691E',
          'orange-hover': '#B85814',
          'orange-light': '#FDEEE0',
          navy: '#0B3D6B',
          'navy-dark': '#072847',
          'navy-light': '#14538E',
          neutral: '#F8F9FA',
          border: '#E5E7EB',
        },
        govt: {
          navy: '#0B3D6B',
          'navy-dark': '#072847',
          'navy-light': '#14538E',
          orange: '#D2691E',
          'orange-hover': '#B85814',
          'orange-light': '#FDEEE0',
          gold: '#C9A227',
          bg: '#F8F9FA',
          border: '#E5E7EB'
        }
      },
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Poppins"', 'sans-serif'],
        heading: ['"Poppins"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        roboto: ['"Inter"', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],       // 12px (labels/meta/eyebrows)
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],                            // 14px (body compact)
        'base': ['1rem', { lineHeight: '1.5rem' }],                               // 16px (body default)
        'lg': ['1.125rem', { lineHeight: '1.625rem' }],                           // 18px (card titles)
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],                             // 20px (card headers)
        '2xl': ['1.5rem', { lineHeight: '2rem' }],                                // 24px (subsections)
        '3xl': ['1.75rem', { lineHeight: '2.25rem' }],                            // 28px (section headers)
        '4xl': ['2rem', { lineHeight: '2.5rem' }],                                // 32px (large section headers)
        '5xl': ['2.5rem', { lineHeight: '3rem', letterSpacing: '-0.02em' }],      // 40px (display titles)
        '6xl': ['3rem', { lineHeight: '3.5rem', letterSpacing: '-0.02em' }],      // 48px (hero headlines)
        '7xl': ['3.5rem', { lineHeight: '4rem', letterSpacing: '-0.025em' }],     // 56px (max hero headlines)
      },
      borderRadius: {
        'none': '0px',
        'sm': '2px',
        'DEFAULT': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '10px',
        '2xl': '12px',
        '3xl': '16px',
        'full': '9999px',
      },
      boxShadow: {
        'none': 'none',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'sid-card': '0 2px 8px rgba(11, 61, 107, 0.06)',
        'sid-hover': '0 8px 24px rgba(11, 61, 107, 0.12)',
        'govt-card': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'govt-sidebar': 'none',
        'govt-header': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'modal': '0 20px 35px -5px rgba(0, 0, 0, 0.25), 0 10px 15px -6px rgba(0, 0, 0, 0.15)',
        'dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
