import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Fitness-Health-Tracker/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
});
