/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        background: '#030303',
        card: 'rgba(255,255,255,0.025)',
        'card-solid': '#0a0a0a',
        'card-hover': 'rgba(255,255,255,0.04)',
        border: 'rgba(255,255,255,0.05)',
        'border-light': 'rgba(255,255,255,0.08)',
        accent: {
          DEFAULT: '#6366f1',
          hover: '#818cf8',
          glow: 'rgba(99, 102, 241, 0.25)'
        },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#f43f5e'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace']
      }
    }
  },
  plugins: []
};
