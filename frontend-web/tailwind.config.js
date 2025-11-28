/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores Salesianos
        salesiano: {
          azul: {
            50: '#e6f0ff',
            100: '#cce0ff',
            200: '#99c2ff',
            300: '#66a3ff',
            400: '#3385ff',
            500: '#0066cc', // Azul principal salesiano
            600: '#0052a3',
            700: '#003d7a',
            800: '#002952',
            900: '#001429',
          },
          amarillo: {
            50: '#fffef0',
            100: '#fffce0',
            200: '#fff9c2',
            300: '#fff5a3',
            400: '#fff285',
            500: '#ffd700', // Amarillo dorado salesiano
            600: '#ccac00',
            700: '#998100',
            800: '#665600',
            900: '#332b00',
          },
        },
        // Alias para facilitar uso
        primary: {
          50: '#e6f0ff',
          100: '#cce0ff',
          200: '#99c2ff',
          300: '#66a3ff',
          400: '#3385ff',
          500: '#0066cc',
          600: '#0052a3',
          700: '#003d7a',
          800: '#002952',
          900: '#001429',
        },
        secondary: {
          50: '#fffef0',
          100: '#fffce0',
          200: '#fff9c2',
          300: '#fff5a3',
          400: '#fff285',
          500: '#ffd700',
          600: '#ccac00',
          700: '#998100',
          800: '#665600',
          900: '#332b00',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'custom': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
