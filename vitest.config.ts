import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      include: ['tests/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
      exclude: [
        'node_modules',
        'dist',
        'dist-electron',
        '.electron-vendors.cache',
        '**/integration/**',
        'tests/integration/**'
      ],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        include: ['src/lib/**/*.ts', 'src/components/**/*.{ts,tsx}', 'src/stores/**/*.ts'],
        exclude: [
          '**/*.d.ts',
          '**/*.test.{ts,tsx}',
          '**/types.ts',
          '**/index.ts',
          '**/*.config.ts',
          'src/lib/**/test.ts',
          'src/lib/**/integration-test.ts',
          'src/lib/**/example.ts',
          'src/lib/**/heightService.test.example.ts'
        ],
        all: true,
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  })
)
