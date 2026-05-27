import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174 // Completely forces separation away from Project 1 (5173) to run cleanly simultaneously!
  }
});