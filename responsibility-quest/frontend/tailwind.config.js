/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        'brand': {
          orange: '#FF6B35',
          'orange-light': '#FF8C5A',
          'orange-dark': '#E55A2B',
        },
        // Game colors
        'game': {
          dark: '#0F0F1A',
          darker: '#0A0A12',
          surface: '#1A1A2E',
          'surface-light': '#252540',
          accent: '#FF6B35',
          gold: '#FFD700',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        },
        // Pile colors
        'pile': {
          handled: '#10B981',
          'handled-bg': 'rgba(16, 185, 129, 0.1)',
          'need-help': '#F59E0B',
          'need-help-bg': 'rgba(245, 158, 11, 0.1)',
          unknown: '#6B7280',
          'unknown-bg': 'rgba(107, 114, 128, 0.1)',
          unassigned: '#3B82F6',
          'unassigned-bg': 'rgba(59, 130, 246, 0.1)',
        },
        // Category colors for dominoes
        'category': {
          leadership: '#8B5CF6',
          governance: '#EC4899',
          security: '#EF4444',
          infrastructure: '#3B82F6',
          cloud: '#06B6D4',
          support: '#10B981',
          data: '#F59E0B',
          applications: '#84CC16',
          projects: '#F97316',
          assets: '#6366F1',
        },
      },
      fontFamily: {
        'display': ['Space Grotesk', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'confetti': 'confetti 5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 107, 53, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 107, 53, 0.8)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        confetti: {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)' },
        },
      },
      boxShadow: {
        'game': '0 4px 30px rgba(0, 0, 0, 0.3)',
        'game-lg': '0 8px 50px rgba(0, 0, 0, 0.4)',
        'glow-orange': '0 0 30px rgba(255, 107, 53, 0.3)',
        'glow-gold': '0 0 30px rgba(255, 215, 0, 0.3)',
        'inner-light': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-game': 'linear-gradient(135deg, #0F0F1A 0%, #1A1A2E 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
