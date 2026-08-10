import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // 以 example 目录为站点根，保证 HTML 输出到 docs/ 根目录（根路径可直接访问 index.html）
  root: resolve(__dirname, 'example'),
  build: {
    outDir: resolve(__dirname, 'docs'),
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'example/index.html'),
        child: resolve(__dirname, 'example/child.html')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].[hash].js',
        assetFileNames: 'assets/[name].[ext]',
        // 移除入口文件的路径前缀
        preserveModules: false,
      }
    },
    sourcemap: false,
    minify: true,
    emptyOutDir: true
  },
  publicDir: '',
  base: './'
})
