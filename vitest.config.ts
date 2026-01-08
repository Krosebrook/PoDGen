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
      // Coverage thresholds aligned with v0.1.0 roadmap goals
      // Initial thresholds are set low to not block development
      // Will be progressively increased in v0.2.0 (80%+)
      lines: 40,        // v0.1.0: 40%, v0.2.0: 60%, v1.0.0: 70%
      functions: 40,    // v0.1.0: 40%, v0.2.0: 60%, v1.0.0: 70%
      branches: 15,     // v0.1.0: 15%, v0.2.0: 50%, v1.0.0: 60%
      statements: 40,   // v0.1.0: 40%, v0.2.0: 60%, v1.0.0: 70%
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
