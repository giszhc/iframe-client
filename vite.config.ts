import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'iframe-client',
      fileName: 'iframe-client'
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    sourcemap: true,
    minify: false
  },
  resolve: {
    alias: {
      '@giszhc/iframe-client': resolve(__dirname, 'src/index.ts')
    }
  }
})
