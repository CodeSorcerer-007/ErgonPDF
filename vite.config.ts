import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('pdfjs-dist')) return 'vendor-pdfjs';
          if (id.includes('tesseract.js')) return 'vendor-tesseract';
          if (id.includes('pdf-lib') || id.includes('@pdfsmaller') || id.includes('jszip')) return 'vendor-pdflib';
          if (id.includes('react') || id.includes('lucide-react')) return 'vendor-react';
        },
      },
    },
  },
});
