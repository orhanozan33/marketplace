/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'canada-red': '#EF4444',
        'canada-red-dark': '#DC2626',
      },
    },
  },
  plugins: [],
}


