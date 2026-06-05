import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Stellar Learn brand palette
        brand: {
          purple:    '#7b5ea7',
          'purple-light': '#9b7ec7',
          gold:      '#e8d5b7',
          'gold-bright': '#ffd700',
          dark:      '#0d0d2b',
          'dark-2':  '#1a1a2e',
          'dark-3':  '#16213e',
          'dark-4':  '#0f3460',
        },
        stellar: {
          blue:      '#3d5afe',
          teal:      '#00bcd4',
          green:     '#4caf50',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        mono:  ['JetBrains Mono', 'monospace'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'star-field':      'radial-gradient(ellipse at center, #1a1a2e 0%, #0d0d2b 100%)',
      },
      animation: {
        'float':        'float 3s ease-in-out infinite',
        'pulse-glow':   'pulse-glow 2s ease-in-out infinite',
        'slide-up':     'slide-up 0.3s ease-out',
        'xp-flash':     'xp-flash 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px #7b5ea7' },
          '50%':      { boxShadow: '0 0 25px #7b5ea7, 0 0 50px #7b5ea7' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'xp-flash': {
          '0%':   { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-40px) scale(1.3)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
