import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: process.env.BASE ?? '/', // GitHub Pages serves under /moulu/
  build: {
    target: 'es2020',
    rollupOptions: { input: { main: resolve(__dirname, 'index.html'), privacy: resolve(__dirname, 'privacy.html'), imprint: resolve(__dirname, 'imprint.html') } },
  },
});
