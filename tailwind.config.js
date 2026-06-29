/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#07070d',
          50: '#0f0f18',
          100: '#14141f',
          200: '#1a1a28',
          300: '#222233',
        },
        volt: {
          DEFAULT: '#c8ff00',
          dim: '#a3cc00',
          glow: 'rgba(200, 255, 0, 0.15)',
        },
        coral: {
          DEFAULT: '#ff4d6d',
          glow: 'rgba(255, 77, 109, 0.15)',
        },
        iris: {
          DEFAULT: '#7c5cff',
          glow: 'rgba(124, 92, 255, 0.15)',
        },
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.03)',
          hover: 'rgba(255, 255, 255, 0.06)',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-strong': 'rgba(255, 255, 255, 0.14)',
        },
        mist: {
          DEFAULT: '#f4f4f5',
          muted: '#a1a1aa',
          dim: '#71717a',
        },
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#c8ff00',
          600: '#a3cc00',
          700: '#7a9900',
          800: '#526600',
          900: '#293300',
        },
      },
      fontFamily: {
        display: ['Syne', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
        'spin-slow': 'spin 12s linear infinite',
        'grain': 'grain 8s steps(10) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-2%, -3%)' },
          '30%': { transform: 'translate(1%, 2%)' },
          '50%': { transform: 'translate(-1%, 1%)' },
          '70%': { transform: 'translate(2%, -1%)' },
          '90%': { transform: 'translate(-1%, -2%)' },
        },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        volt: '0 0 40px rgba(200, 255, 0, 0.2), 0 0 80px rgba(200, 255, 0, 0.05)',
        coral: '0 0 40px rgba(255, 77, 109, 0.2)',
        iris: '0 0 40px rgba(124, 92, 255, 0.2)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'glass-lg': '0 24px 64px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      },
    },
  },
  plugins: [],
}
