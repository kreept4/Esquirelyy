/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#2B2622',
          light: '#3D372F',
          muted: '#8A8073',
        },
        cream: {
          DEFAULT: '#FFFFFF',
          dark: '#F1EBE2',
          border: '#E3DDD3',
        },
        mist: {
          DEFAULT: '#F6F3EF',
        },
        ink: {
          DEFAULT: '#B5645A',
          light: '#9C5049',
          muted: '#D9A79D',
        },
        butter: {
          DEFAULT: '#F5D76E',
          light: '#F0D98C',
          dark: '#D9A91F',
        },
        verified: '#2D6A4F',
        closing: '#C1521B',
        new: '#B5645A',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      letterSpacing: {
        widest: '0.2em',
        'ultra-wide': '0.3em',
      },
      borderWidth: {
        '0.5': '0.5px',
      },
      animation: {
        'ticker': 'ticker 12s linear infinite',
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
