/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,js,html}"],
  theme: {
    extend: {
      colors: {
        cool: {
          50: '#F5F8FA',
          100: '#EBF1F5',
          200: '#D6E2EB',
          300: '#B8CEDB',
          400: '#8FAFC3',
          500: '#648FA8',
          600: '#4A728B',
          700: '#38586D',
          800: '#273C4B',
          900: '#1A2732',
        },
        arctic: {
          blue: '#E0F2FE',
          cyan: '#ECFEFF',
          mint: '#F0FDF4',
          accent: '#0284C7'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(100, 143, 168, 0.08)',
        'luxury': '0 20px 40px -15px rgba(56, 88, 109, 0.07)',
        'glow': '0 0 20px rgba(2, 132, 199, 0.12)'
      },
      backdropBlur: {
        'xs': '2px',
        'subtle': '12px'
      }
    },
  },
  plugins: [],
}
