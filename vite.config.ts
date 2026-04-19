import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// For GitHub Pages project sites the app is served under /<repo>/.
// Set VITE_BASE (e.g. "/merge-request-status/") in CI; defaults to "/" locally.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  server: { port: 5173 },
  preview: { port: 5173 },
});
