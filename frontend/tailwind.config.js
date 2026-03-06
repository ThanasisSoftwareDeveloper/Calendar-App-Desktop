/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#080808',
          secondary: '#0d0d0d',
          tertiary: '#111111',
          card: '#131313',
          hover: '#181818',
          border: '#1e1e1e',
          'border-bright': '#2a2a2a',
        },
        accent: {
          DEFAULT: '#00ff88',
          dim: '#00cc6a',
          glow: 'rgba(0,255,136,0.15)',
          subtle: 'rgba(0,255,136,0.08)',
        },
        text: {
          primary: '#f0f0f0',
          secondary: '#999',
          muted: '#555',
          inverse: '#080808',
        },
        priority: {
          low: '#3a7bd5',
          medium: '#f59e0b',
          high: '#ef4444',
          urgent: '#ff2d55',
        },
        status: {
          pending: '#555',
          in_progress: '#00ff88',
          completed: '#3a7bd5',
          cancelled: '#ef4444',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0,255,136,0.15)',
        'glow-sm': '0 0 10px rgba(0,255,136,0.1)',
        'card': '0 2px 8px rgba(0,0,0,0.4)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease',
        'slide-up': 'slideUp 0.3s ease',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0,255,136,0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(0,255,136,0.3)' },
        },
      },
    },
  },
  plugins: [],
}
