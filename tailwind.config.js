/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: '#10B981',
        primaryDark: '#059669',
        primaryLight: '#34D399',
        emerald: {
          50: '#F0FDF4',
          500: '#10B981',
          600: '#059669',
          400: '#34D399',
        },
      },
    },
  },
  plugins: [],
};
