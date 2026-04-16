/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      colors: {
        jarvis: {
          50: '#e0fffe',
          100: '#b3fffd',
          200: '#80fffc',
          300: '#4dfffb',
          400: '#1afffa',
          500: '#00f0ff',
          600: '#00c8d6',
          700: '#009eab',
          800: '#007580',
          900: '#004d55',
          950: '#002a2e',
        },
        hud: {
          bg: '#0a0e17',
          panel: '#0d1321',
          border: 'rgba(0, 240, 255, 0.2)',
          'border-bright': 'rgba(0, 240, 255, 0.4)',
        },
        cyan: {
          DEFAULT: '#00f0ff',
          dim: 'rgba(0, 240, 255, 0.15)',
          glow: 'rgba(0, 240, 255, 0.4)',
        },
        hud_red: '#ff3860',
        hud_green: '#00e676',
        hud_orange: '#ff9100',
        hud_purple: '#b388ff',
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(0, 240, 255, 0.4)',
        'cyan-glow-sm': '0 0 10px rgba(0, 240, 255, 0.3)',
        'cyan-glow-lg': '0 0 40px rgba(0, 240, 255, 0.5)',
      },
    },
  },
  plugins: [],
};
