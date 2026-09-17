import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/**/*.d.ts', 'src/main.tsx', 'src/vite-env.d.ts', 'src/mocks/**', 'src/**/*.stories.*'],
      // Ratchet: floor of the real coverage (2026-09-17: ~21/15/16/25).
      // Raise toward 70 only with real tests, never lower.
      thresholds: {
        lines: 24,
        functions: 14,
        branches: 15,
        statements: 20,
      },
    },
  },

})
