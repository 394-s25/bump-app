// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',         // added dark mode
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lightBeige: '#fff7d5',
          //testing dark mode
        darkBg:    '#1f2937',
        darkCard:  '#374151',
        darkText:  '#e5e7eb',
      }
    },
  },
  plugins: [],
}