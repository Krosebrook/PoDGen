import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.config.ts',
        '**/*.config.js',
        '**/types.ts',
        '**/*.d.ts',
        'vite.config.ts',
        'vitest.config.ts',
      ],
      all: true,
      lines: 0,
      functions: 0,
      branches: 0,
      statements: 0,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
