/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  test: {
    // ---------------------------------------------------------------------------
    // Environment
    // ---------------------------------------------------------------------------
    environment: 'jsdom',
    globals: true,

    // Global setup file — registers matchers, starts MSW, stubs browser APIs
    setupFiles: ['./src/test/setup.ts'],

    // ---------------------------------------------------------------------------
    // File patterns
    // ---------------------------------------------------------------------------
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next', '.turbo'],

    // ---------------------------------------------------------------------------
    // Pool — use 'forks' for full process isolation between test files
    // ---------------------------------------------------------------------------
    pool: 'forks',

    // ---------------------------------------------------------------------------
    // Coverage — v8 provider with enforced thresholds
    // ---------------------------------------------------------------------------
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',

      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/**/*.d.ts',
        'src/**/index.ts',
        'node_modules',
      ],

      // Fail CI when coverage drops below these thresholds
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
  },
});
