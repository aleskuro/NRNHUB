// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'], // Required for Tailwind
      theme: {
        extend: {
          keyframes: {
            glow: {
              '0%, 100%': {
                textShadow: '0 0 5px rgba(196, 161, 255, 0.5)',
                color: '#C4A1FF',
              },
              '50%': {
                textShadow: '0 0 15px rgba(196, 161, 255, 0.8)',
                color: '#9370DB',
              },
            },
          },
          animation: {
            glow: 'glow 2s ease-in-out infinite',
          },
        },
      },
    }),
  ],

  resolve: {
    alias: {
      // Keep TinyMCE working
      tinymce: path.resolve(__dirname, 'node_modules/tinymce'),

      // NEW: Allow import from root/utilis/
      '@utilis': path.resolve(__dirname, 'utilis'),
    },
  },

  build: {
    assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.ttf', '**/*.otf', '**/*.css'],
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split('.').pop();
          if (/woff|woff2|ttf|otf/.test(extType)) {
            return `assets/fonts/[name].[hash][extname]`;
          }
          if (extType === 'css') {
            return `assets/css/[name].[hash][extname]`;
          }
          return `assets/[name].[hash][extname]`;
        },
      },
    },
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: true,
    },
    // Fix: "Blocked host" on production domain
    allowedHosts: ['nrnhub.com.np', 'www.nrnhub.com.np', 'localhost', '.localhost'],

    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      '/Uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },

  // Optional: Optimize deps for faster cold start
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});