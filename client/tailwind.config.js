/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dtn: {
          dark: '#0e272b',
          teal: '#12373d',
          tealLight: '#1d4f57',
          cyan: '#00b4d8',
          gold: '#e59836',
          goldHover: '#d08628',
          red: '#d92626',
          redHover: '#b81e1e',
          surface: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}
