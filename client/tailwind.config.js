/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFEBEE',
          100: '#FFCDD2',
          200: '#EF9A9A',
          300: '#E57373',
          400: '#EF5350',
          500: '#D32F2F', // Màu chủ đạo theo yêu cầu
          600: '#C62828',
          700: '#B71C1C',
          800: '#8E0000',
          900: '#5F0000',
        },
        surface: {
          light: '#F8FAFC', // Nền xám nhạt hiện đại
          card: '#FFFFFF',
          border: '#E2E8F0',
        },
        status: {
          safe: '#16A34A',
          warning: '#F59E0B',
          critical: '#DC2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px', // Bo góc chuẩn 12px theo yêu cầu
        'btn': '12px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(211, 47, 47, 0.35)',
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.75 },
        }
      }
    },
  },
  plugins: [],
}
