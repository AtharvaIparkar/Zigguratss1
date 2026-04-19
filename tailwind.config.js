/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dialect-bg': '#030303',
        'dialect-accent': '#ffcc00',
        'dialect-text': '#ffffff',
        'dialect-body': '#a0a0a0',
      },
      fontFamily: {
        display: ['"Inter Tight"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      transitionTimingFunction: {
        'dialect': 'cubic-bezier(0.85, 0, 0.15, 1)',
        'elastic': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
      }
    },
  },
  plugins: [],
}
