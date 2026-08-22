import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// LifeOS – configuration Vite
// host: true -> écoute sur 0.0.0.0 (nécessaire pour l'aperçu en direct)
// allowedHosts: true -> accepte le nom d'hôte du proxy d'aperçu
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
  },
});
