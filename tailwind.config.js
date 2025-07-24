/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "palette-1": "#322401",
        "palette-2": "#745302",
        "palette-3": "#bf8a03",
        "palette-4": "#fbba13",
        "palette-5": "#fdd05e"
      }
    },
  },
  plugins: [],
}