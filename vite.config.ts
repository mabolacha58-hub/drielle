import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist', // Diretório de saída do build
    chunkSizeWarningLimit: 1000, // Aumenta o limite para evitar avisos
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
});
