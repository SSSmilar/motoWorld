/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent': '#FF3E00', // Neon Red/Orange
        'dark-bg': '#0A0A0A',
        'card-bg': '#141414',
      },
    },
  },
  plugins: [],
}
