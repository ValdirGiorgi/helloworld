/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dae8ff',
          200: '#bcd4ff',
          300: '#8db6ff',
          400: '#568fff',
          500: '#2f6bff',
          600: '#1a4bf0',
          700: '#153acb',
          800: '#1731a3',
          900: '#182e80',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          400: '#6b7280',
          600: '#42485a',
          800: '#20232e',
          900: '#14151b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      spacing: {
        18: '4.5rem',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [],
}
