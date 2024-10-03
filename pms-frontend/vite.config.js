import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // Alias '@' to the 'src' directory
    },
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        entryFileNames: 'static/js/[name].[hash].js',
        chunkFileNames: 'static/js/[name].[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(css)$/.test(name ?? '')) {
            return 'static/css/[name].[hash].[ext]';
          }
          if (/\.(png|jpe?g|gif|svg)$/.test(name ?? '')) {
            return 'static/media/[name].[hash].[ext]';
          }
          return 'static/[name].[hash].[ext]';
        },
      },
    },
  },
});
