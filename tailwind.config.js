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
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#f2fbf9',
          100: '#d3f4ed',
          200: '#a7e9db',
          300: '#6ddbca',
          400: '#44c4b2',
          500: '#25a898',
          600: '#198a7c',
          700: '#176f65',
          800: '#155751',
          900: '#134744',
        },
        accent: {
          50: '#fff9eb',
          100: '#ffedc6',
          200: '#ffd88a',
          300: '#ffba45',
          400: '#ff9d1a',
          500: '#f7800a',
          600: '#db5c02',
          700: '#b63e06',
          800: '#932f0d',
          900: '#792a0e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 14px 0 rgba(0, 0, 0, 0.05)',
        'medium': '0 6px 24px 0 rgba(0, 0, 0, 0.09)',
        'hard': '0 10px 40px 0 rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
} 