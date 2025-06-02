// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media'
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sky: { // Example custom color if you don't have full Tailwind palette
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
        }
      }
    },
  },
  plugins: [],
}