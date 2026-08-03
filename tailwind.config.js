/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'xs': ['12px', '16px'],
        'sm': ['14px', '20px'],
        'base': ['18px', '24px'],
        'lg': ['20px', '28px'],
        'xl': ['24px', '32px'],
        '2xl': ['28px', '36px'],
        '3xl': ['32px', '40px'],
        '4xl': ['40px', '48px'],
      },
      colors: {
        senior: {
          light: '#F5F5F0',
          dark: '#1A1A1A',
          accent: '#2563EB',
          success: '#059669',
          warning: '#D97706',
          error: '#DC2626',
        }
      },
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
      }
    },
  },
  plugins: [],
}
