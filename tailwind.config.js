/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#faf9f6',
          100: '#f5f0ea',
          200: '#e8dfd5',
          300: '#d4c5b5',
          400: '#b8a38d',
          500: '#9c856b',
        },
        sage: {
          50: '#f4f7f2',
          100: '#e4ebe0',
          200: '#c9d7c1',
          300: '#aec3a2',
          400: '#93af83',
          500: '#789b64',
          600: '#5f7c50',
        },
        stone: {
          50: '#f8f7f5',
          100: '#f0eeea',
          200: '#e1ddd6',
          300: '#d2ccc2',
          400: '#b3aa9b',
          500: '#948874',
          600: '#766d5d',
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'sanctuary-pattern': "url('/sanctuary-pattern.svg')",
      },
    },
  },
  plugins: [],
}
