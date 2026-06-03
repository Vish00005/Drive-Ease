/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        surface: {
          light: 'rgba(255,255,255,0.7)',
          dark: 'rgba(15,20,40,0.7)',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        'dark-gradient': 'linear-gradient(135deg, #0a0d1a 0%, #111827 100%)',
        'indigo-gradient': 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        'cyan-gradient': 'linear-gradient(135deg, #06b6d4, #0284c7)',
        'emerald-gradient': 'linear-gradient(135deg, #10b981, #059669)',
        'amber-gradient': 'linear-gradient(135deg, #f59e0b, #d97706)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(31, 38, 135, 0.15)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.5)',
        '3d': '0 20px 60px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)',
        '3d-dark': '0 20px 60px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)',
        'neon': '0 0 20px rgba(99, 102, 241, 0.5)',
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.5)',
        'card-hover': '0 25px 50px rgba(79, 70, 229, 0.2)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.6s ease forwards',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(30px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
