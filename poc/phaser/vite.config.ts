import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist', assetsInlineLimit: 0, chunkSizeWarningLimit: 2000,
    rollupOptions: { input: { main: 'index.html', vfx: 'vfx.html' } },
  },
  server: { port: 5173 },
});
