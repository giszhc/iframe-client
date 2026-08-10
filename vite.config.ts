import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'IframeClient',
      fileName: 'iframe-client'
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    sourcemap: false,
    minify: false
  },
  resolve: {
    alias: {
      '@giszhc/iframe-client': resolve(__dirname, 'src/index.ts')
    }
  }
})
