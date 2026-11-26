// Single-file preview build of the VFX lab (used to make a one-page preview).
import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist-single', assetsInlineLimit: 0, chunkSizeWarningLimit: 4000, modulePreload: false,
    rollupOptions: { input: { vfx: 'vfx.html' } },
  },
});
