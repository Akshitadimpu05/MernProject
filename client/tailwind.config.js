/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-pink': '#ff16ac',
        'secondary-pink': '#FE59D7',
        'accent-pink': '#ff6fd0',
        'dark-bg': '#121212',
        'dark-surface': '#1E1E1E',
        'text-secondary': '#B0B0B0',
      }
    },
  },
  plugins: [],
}
