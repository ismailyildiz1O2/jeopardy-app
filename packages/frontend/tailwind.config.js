/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Core Jeopardy palette
        jeopardy: {
          navy: '#0a0a1a',
          deep: '#0d1030',
          blue: '#1a1a4e',
          royal: '#2020a0',
          bright: '#3b3bff',
          surface: '#12122e',
          card: '#181842',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        neon: {
          blue: '#00d4ff',
          purple: '#a855f7',
          pink: '#ec4899',
          green: '#22c55e',
          orange: '#f97316',
          red: '#ef4444',
          cyan: '#06b6d4',
          yellow: '#eab308',
        },
      },
      // Custom animations for game interactions
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-fast': 'fadeIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.4s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'flip': 'flip 0.6s ease-in-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'bounce-in': 'bounceIn 0.5s ease-out forwards',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'score-pop': 'scorePop 0.4s ease-out forwards',
        'timer-urgent': 'timerUrgent 0.5s ease-in-out infinite',
        'orb-float': 'orbFloat 20s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(59, 59, 255, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(59, 59, 255, 0.6), 0 0 40px rgba(59, 59, 255, 0.3)' },
        },
        flip: {
          '0%': { transform: 'perspective(600px) rotateY(0deg)' },
          '50%': { transform: 'perspective(600px) rotateY(90deg)' },
          '100%': { transform: 'perspective(600px) rotateY(0deg)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        scorePop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        timerUrgent: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        orbFloat: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(30px, -30px) rotate(120deg)' },
          '66%': { transform: 'translate(-20px, 20px) rotate(240deg)' },
          '100%': { transform: 'translate(0, 0) rotate(360deg)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(59, 59, 255, 0.3)',
        'glow-md': '0 0 20px rgba(59, 59, 255, 0.4)',
        'glow-lg': '0 0 30px rgba(59, 59, 255, 0.5), 0 0 60px rgba(59, 59, 255, 0.2)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.4)',
        'glow-neon': '0 0 15px rgba(0, 212, 255, 0.5)',
        'inner-glow': 'inset 0 0 20px rgba(59, 59, 255, 0.2)',
      },
    },
  },
  plugins: [],
};
