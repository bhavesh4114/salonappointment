/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'teal-mint': '#4FD1C7', // Teal/mint green accent color
      },
    },
  },
  plugins: [],
}
