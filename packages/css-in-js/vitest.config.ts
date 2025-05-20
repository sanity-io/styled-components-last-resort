import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    env: { __VERSION__: 'JEST_MOCK_VERSION' },
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test-utils/testSetup.ts'],
    coverage: {
      enabled: !!process.env.PULL_REQUEST,
      reporter: ['text', 'html'],
    },
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.rollup.cache'],
  },
  resolve: {
    alias: {
      'test-utils': resolve(__dirname, 'test-utils'),
    },
  },
});
