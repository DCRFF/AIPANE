import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss(), { name: 'remove-crossorigin', apply: 'build', transformIndexHtml: (html) => html.replace(/ crossorigin/g, '') }],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
  root: 'src/renderer',
  base: './',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
    modulePreload: false,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
