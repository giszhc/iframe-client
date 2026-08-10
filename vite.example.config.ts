import { defineConfig } from 'vite'
import { resolve } from 'path'
import { copyFileSync, mkdirSync } from 'fs'

export default defineConfig({
  // 以 example 目录为站点根，保证 HTML 输出到 docs/ 根目录（根路径可直接访问 index.html）
  root: resolve(__dirname, 'example'),
  plugins: [
    {
      name: 'copy-dist-to-docs',
      // 构建结束后把库的 UMD 产物复制到 docs/dist/，供页面同源兜底引用
      closeBundle() {
        const src = resolve(__dirname, 'dist/iframe-client.umd.min.js')
        const destDir = resolve(__dirname, 'docs/dist')
        mkdirSync(destDir, { recursive: true })
        copyFileSync(src, resolve(destDir, 'iframe-client.umd.min.js'))
      }
    }
  ],
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
