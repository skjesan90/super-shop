/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563EB', 50: '#EFF6FF', 100: '#DBEAFE', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8' },
        success: { DEFAULT: '#10B981', 50: '#ECFDF5', 100: '#D1FAE5', 500: '#10B981', 600: '#059669' },
        danger: { DEFAULT: '#EF4444', 50: '#FEF2F2', 100: '#FEE2E2', 500: '#EF4444', 600: '#DC2626' },
        warning: { DEFAULT: '#F59E0B', 50: '#FFFBEB', 100: '#FEF3C7', 500: '#F59E0B', 600: '#D97706' },
        dark: { DEFAULT: '#0F172A', 800: '#1E293B', 700: '#334155', 600: '#475569' },
        bgLight: '#F8FAFC',
      },
      fontFamily: { sans: ['Plus Jakarta Sans', 'sans-serif'] },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
        glass: '0 8px 32px rgba(31,38,135,0.1)',
      },
      backdropBlur: { xs: '2px' },
    }
  },
  plugins: []
}
