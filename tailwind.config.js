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
          DEFAULT: '#1A1A1A',
          light: '#2C2C2C',
          muted: '#4A4A4A',
        },
        cream: {
          DEFAULT: '#FAF6F0',
          dark: '#F2EBE1',
          border: '#E8E0D5',
        },
        ink: {
          DEFAULT: '#1A1A1A',
          light: '#2C2C2C',
          muted: '#4A4A4A',
        },
        verified: '#2D6A4F',
        closing: '#000000',
        new: '#1A1A1A',
      },
      fontFamily: {
        display: ['Hanken Grotesk', 'sans-serif'],
        serif: ['Hanken Grotesk', 'sans-serif'],
        sans: ['Schibsted Grotesk', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
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
