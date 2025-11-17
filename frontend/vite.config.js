import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config with React
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist'
  }
});
