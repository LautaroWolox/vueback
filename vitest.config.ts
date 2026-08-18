import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig as any,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      exclude: [...configDefaults.exclude, 'cypress/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      clearMocks: true,
      restoreMocks: true,
      mockReset: true,
    }
  })
)
