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
      containers: {
        sm: '300px',
      },
    },
  },
  plugins: [require('@tailwindcss/container-queries')],
  corePlugins: {
    containerQueries: true,
  },
}

export default config
