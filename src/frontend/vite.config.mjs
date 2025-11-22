// vite.config.mjs
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,           // ouvre automatiquement le navigateur
    cors: true,           // autorise toutes les requêtes cross-origin
  },
  resolve: {
    alias: {
      '@': '/src',        // tu peux importer les fichiers depuis src facilement
    },
  },
  build: {
    outDir: 'dist',
  },
});
