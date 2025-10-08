import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: [
        'src/main/services/sessionManager.ts',
        'src/main/services/fileManager.ts',
      ],
      exclude: [
        'src/**/*.d.ts',
        'src/**/index.ts',
        'src/**/types/**',
        'src/renderer/src/main.tsx',
        'src/renderer/src/App.tsx',
        'src/renderer/src/context/**',
        'src/renderer/src/components/**',
        'src/renderer/src/hooks/**',
        'src/renderer/src/store/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@renderer': new URL('./src/renderer/src', import.meta.url).pathname,
    },
  },
});

