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
        background: '#F9FAFB',
        card: '#FFFFFF',
        textPrimary: '#1F2937',
        textSecondary: '#6B7280',
        textTertiary: '#9CA3AF',
        border: '#E5E7EB',
        warning: '#F59E0B',
        error: '#EF4444',
        success: '#22C55E',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: 'Poppins',
      },
    },
  },
  plugins: [],
}