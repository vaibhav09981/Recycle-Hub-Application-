/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx", 
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
    "./context/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#10B981',
        primaryDark: '#047857',
        primaryLight: '#D1FAE5',
        background: '#F8FAFC', // Softer slate background
        card: '#FFFFFF',
        textPrimary: '#0F172A', // Deeper blue-gray for text
        textSecondary: '#475569',
        textTertiary: '#94A3B8',
        border: '#E2E8F0',
        warning: '#F59E0B',
        error: '#EF4444',
        success: '#22C55E',
        info: '#3B82F6',
        teal: '#14B8A6',
        earth: '#78350F',
      },
      fontFamily: {
        poppins: ['Poppins_400Regular'],
        'poppins-medium': ['Poppins_500Medium'],
        'poppins-semibold': ['Poppins_600SemiBold'],
        'poppins-bold': ['Poppins_700Bold'],
        sans: ['Poppins_400Regular'],
      },
    },
  },
  plugins: [],
}