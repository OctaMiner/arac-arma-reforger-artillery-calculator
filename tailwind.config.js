/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-primary': '#1a1a2e',
        'bg-secondary': '#16213e',
        'bg-tertiary': '#0f3460',

        // Text
        'text-primary': '#e4e4e4',
        'text-secondary': '#a0a0a0',
        'text-muted': '#6b6b6b',

        // Accents
        'accent-red': '#e94560',
        'accent-green': '#4ecca3',
        'accent-yellow': '#ffd700',
        'accent-blue': '#00d9ff',

        // Borders
        'border-color': '#2a2a4a',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
