/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terracotta: {
          50: '#FDF7F5',
          100: '#FBECE8',
          200: '#F6D5CC',
          300: '#EEB7AA',
          400: '#E49280',
          500: '#E07A5F',
          600: '#CB5C3F',
          700: '#AA482F',
          800: '#8C3D29',
          900: '#733526',
        },
        saffron: {
          500: '#FF6B35',
          600: '#E85A28',
        },
        forest: {
          50: '#F0F7F1',
          100: '#DAEDDC',
          500: '#2E7D32',
          600: '#236027',
          700: '#1C4D20',
        },
        mint: {
          400: '#66D4A3',
          500: '#4CC992',
          600: '#38A875',
        },
        golden: '#FFB300',
        coral: '#FF8A80',
        cream: '#FAF9F6',
        charcoal: '#1F2521',
        softgray: '#F1EDE8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
  plugins: [],
};
