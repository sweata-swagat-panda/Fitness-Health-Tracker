/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./js/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'neon-blue': '#3B82F6',
        'neon-green': '#10B981',
        'dark-bg': '#1F2937',
        'darker-bg': '#111827',
        'bmi-underweight': '#FCD34D',
        'bmi-normal': '#10B981',
        'bmi-overweight': '#F59E0B',
        'bmi-obese': '#EF4444'
      }
    }
  },
  plugins: []
}
