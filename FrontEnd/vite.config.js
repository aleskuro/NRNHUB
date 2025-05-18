import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  theme: {
    extend: {
      keyframes: {
        glow: {
          '0%, 100%': { 
            textShadow: '0 0 5px rgba(196, 161, 255, 0.5)',
            color: '#C4A1FF'
          },
          '50%': { 
            textShadow: '0 0 15px rgba(196, 161, 255, 0.8)',
            color: '#9370DB'
          }
        }
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite'
      }
    },
  },

   server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/Uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});