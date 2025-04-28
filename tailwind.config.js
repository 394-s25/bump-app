/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lightBeige:  '#ffffff',  
        lightBeige2: '#f9fafb',  
        darkBg:    '#1f2937',
        darkCard:  '#374151',
        darkText:  '#d1d5db',
        darkBg2:   '#2C3A4D',
      }
    },
  },
  plugins: [],
}
