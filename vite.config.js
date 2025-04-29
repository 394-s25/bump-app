import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',  // Explicitly use 127.0.0.1 instead of localhost
    port: 5173,
    open: true,         // Automatically open the browser
  },
  test: {
    globals: true,
    environment: 'jsdom',
  }
});