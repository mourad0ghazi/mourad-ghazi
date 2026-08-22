/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Preflight désactivé : LifeOS possède son propre reset CSS (design system "smoke").
  // Tailwind est utilisé en complément pour les utilitaires (pages, bannières…).
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        smoke: {
          dark: '#343A40',
          medium: '#495057',
          light: '#6C757D',
          muted: '#ADB5BD',
        },
        surface: {
          0: '#FFFFFF',
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
        },
        ink: {
          900: '#212529',
          800: '#343A40',
          700: '#495057',
          600: '#6C757D',
          500: '#ADB5BD',
        },
        success: '#28A745',
        warning: '#FFC107',
        danger: '#DC3545',
        info: '#17A2B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
        modal: '0 25px 50px -12px rgba(0,0,0,0.25)',
        chatbot: '0 8px 32px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        card: '16px',
        modal: '20px',
        chat: '24px',
      },
    },
  },
  plugins: [],
};
