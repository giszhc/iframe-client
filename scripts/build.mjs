/**
 * 库构建脚本
 *
 * 产出三份产物，覆盖 npm 与 CDN 两种使用场景：
 *
 *   dist/iframe-client.js         ESM 格式（不压缩）       —— module 字段（打包器使用）
 *   dist/iframe-client.umd.cjs    UMD 格式（不压缩）       —— main 字段（Node require）
 *   dist/iframe-client.umd.min.js UMD 格式（压缩）         —— unpkg / jsdelivr 字段（CDN <script> 直接引入）
 *
 * 全局变量名：IframeClient（浏览器中可通过 window.IframeClient 访问）
 */
import { build } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const entry = resolve(root, 'src/index.ts')

/** 各轮构建的公共配置 */
const baseConfig = {
  // 不读取 vite.config.ts，避免配置互相干扰
  configFile: false,
  root,
  resolve: {
    alias: {
      '@giszhc/iframe-client': entry
    }
  }
}

/** 1. ESM（不压缩）→ dist/iframe-client.js */
await build({
  ...baseConfig,
  build: {
    lib: {
      entry,
      name: 'IframeClient',
      formats: ['es'],
      fileName: () => 'iframe-client.js'
    },
    minify: false,
    sourcemap: false,
    emptyOutDir: true
  }
})

/** 2. UMD（不压缩）→ dist/iframe-client.umd.cjs（Node require / 调试） */
await build({
  ...baseConfig,
  build: {
    lib: {
      entry,
      name: 'IframeClient',
      formats: ['umd'],
      fileName: () => 'iframe-client.umd.cjs'
    },
    minify: false,
    sourcemap: false,
    emptyOutDir: false
  }
})

/** 3. UMD（压缩）→ dist/iframe-client.umd.min.js（CDN <script> 直接引入） */
await build({
  ...baseConfig,
  build: {
    lib: {
      entry,
      name: 'IframeClient',
      formats: ['umd'],
      fileName: () => 'iframe-client.umd.min.js'
    },
    minify: true,
    sourcemap: false,
    emptyOutDir: false
  }
})

console.log('\n✅ 构建完成：')
console.log('   dist/iframe-client.js')
console.log('   dist/iframe-client.umd.cjs')
console.log('   dist/iframe-client.umd.min.js')
