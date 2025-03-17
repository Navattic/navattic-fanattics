/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,css,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,css,mdx}',
    './components/**/*.{js,ts,jsx,tsx,css,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-suisse)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
