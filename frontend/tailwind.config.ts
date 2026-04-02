import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#C5A880',
        primaryDark: '#8B6A43',
        secondary: '#1A1A1A',
        accent: '#D4AF37',       // Gold accent
        background: '#0D0D0D',   // Deep dark background
        surface: '#1E1E1E',      // Slightly lighter for cards
        glass: 'rgba(255, 255, 255, 0.05)',
        glassBorder: 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        cairo: ['Cairo', 'sans-serif'],    // good for Arabic/English mixed contexts
      },
      backgroundImage: {
        'gradient-damascus': 'linear-gradient(135deg, #1A1A1A 0%, #0D0D0D 100%)',
        'gradient-gold': 'linear-gradient(135deg, #C5A880 0%, #D4AF37 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'slow-zoom': 'slowZoom 20s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slowZoom: {
          '0%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1.15)' },
        },
      }
    },
  },
  plugins: [],
} satisfies Config
