/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090A0F',
        card: '#11141D',
        border: 'rgba(255, 255, 255, 0.08)',
        accent: '#0284C7',
        accentGlow: '#38BDF8',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Geist', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
