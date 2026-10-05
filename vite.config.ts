import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` -> dist/ (GitHub Pages).  base './' so it works under any repo name.
// `npm run build:preview-file` -> dist-file/index.html, one self-contained file you can double-click.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'singlefile' ? [react(), viteSingleFile()] : [react()],
  build: mode === 'singlefile' ? { outDir: 'dist-file', emptyOutDir: true } : { outDir: 'dist', chunkSizeWarningLimit: 1200 },
  test: { include: ['tests/**/*.test.ts'] },
}));
