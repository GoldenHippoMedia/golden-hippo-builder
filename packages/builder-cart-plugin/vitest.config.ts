import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

// Mirror the tsconfig path aliases so tests can import modules that use them.
// `@goldenhippo/*` packages resolve via node_modules (built workspace deps).
export default defineConfig({
  resolve: {
    alias: {
      '@application': resolve(__dirname, 'src/application'),
      '@components': resolve(__dirname, 'src/components'),
      '@core': resolve(__dirname, 'src/core'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
