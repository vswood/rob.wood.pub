import fileLoop from '../util/file-loop.js'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default class VendorCSS {
  async data() {
    return {
      permalink: '/css/vendor.css',
      eleventyExcludeFromCollections: true
    }
  }

  async render() {
    const files = [
      'bootstrap/dist/css/bootstrap.min.css',
      'glightbox/dist/css/glightbox.min.css',
      'swiper/swiper-bundle.css',
      'open-props/palette.min.css',
      'lenis/dist/lenis.css',
    ].map(f => join(__dirname, '../../node_modules/', f))
    return fileLoop(files, '@layer external {\n', '\n}')
  }
}
