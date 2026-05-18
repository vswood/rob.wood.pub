import {resolve, dirname, relative, extname} from 'node:path'
import glob from 'fast-glob'
import {fileURLToPath} from 'node:url'
import eslint from 'vite-plugin-eslint2'
import { fontless } from 'fontless'
import PluginCritical from 'rollup-plugin-critical'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/* eslint-disable sonarjs/cognitive-complexity */

export default {
  plugins: [
    fontless({
      provider: 'google',
    }),
    eslint({
      lintOnStart: false,
      fix: true,
      include: ['./*.js', './src/**/*.js'],
    }),
    PluginCritical({
      criticalUrl: './src/css/index.css',
      criticalBase: './src/css/',
  }),
  ],
  clearScreen: false,
  // assetsInclude: ['**/*.xml', '**/*.txt'],
  mode: 'production',
  optimizeDeps: {
    exclude: [
      // '*critical.css',
      'fsevents',
      'chromium-bidi',
    ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@css': resolve(__dirname, './src/css'),
      '@js': resolve(__dirname, './src/js'),
      '@img': resolve(__dirname, './src/img'),
      '@media': resolve(__dirname, './src/media'),
      '@html': resolve(__dirname, './src/html'),
      '@sb': resolve(__dirname, './src/stories'),
      '~bootstrap': resolve(__dirname, '../../node_modules/bootstrap'),
      '~nm': resolve(__dirname, '../../node_modules'),
    },
  },
  server: {mode: 'development', middlewareMode: true},
  appType: 'custom',
  build: {
    emptyOutDir: true,
    outDir: 'dist',
    modulePreload: false,
    sourcemap: false,
    manifest: true,
    license: true,
    cssCodeSplit: true,
    rolldownOptions: {
      input: {
        ...Object.fromEntries(
          glob
            .sync([resolve(__dirname, './.11ty-vite/**/*.html')])
            .map(file => [
              relative(
                __dirname,
                file.slice(0, file.length - extname(file).length),
              ),
              fileURLToPath(new URL(file, import.meta.url)),
            ]),
        ),
        ...Object.fromEntries(
          glob
            .sync([resolve(__dirname, './src/js/**/*.js')])
            .map(file => [
              relative(
                __dirname,
                file.slice(0, file.length - extname(file).length),
              ),
              fileURLToPath(new URL(file, import.meta.url)),
            ]),
        ),
        ...Object.fromEntries(
          glob
            .sync([resolve(__dirname, './src/css/**/*.css')])
            .map(file => [
              relative(
                __dirname,
                file.slice(0, file.length - extname(file).length),
              ),
              fileURLToPath(new URL(file, import.meta.url)),
            ]),
        ),
      },
      output: {
        entryFileNames: `js/[name]-[hash].js`,
        chunkFileNames: `js/[name]-[hash].js`,
        assetFileNames: assetInfo => {
          let dir = ''
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            dir = 'css/'
          }
          if (
            assetInfo.name &&
            /\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/.test(assetInfo.name)
          ) {
            dir = 'img/'
          }
          if (
            assetInfo.name &&
            /\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)
          ) {
            dir = 'fonts/'
          }
          if (
            assetInfo.name &&
            /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/.test(assetInfo.name)
          ) {
            dir = 'media/'
          }
          return `${dir}[name]-[hash][extname]`
        },
        manualChunks: id => {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
          if (id.includes('non-critical')) {
            return 'non-critical'
          }
          if (id.includes('critical')) {
            return 'critical'
          }
        },
      },
      plugins: [],
    },
  },
}
