import {cpSync, copyFileSync} from 'node:fs'
import {join} from 'node:path'

export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy('src/css/*.css')
  eleventyConfig.addPassthroughCopy('src/js')
  eleventyConfig.addPassthroughCopy('src/img')
  // eleventyConfig.addPassthroughCopy('src/media')
  /*eleventyConfig.addPassthroughCopy({
    './node_modules/open-props/palette.min.css': 'css/palette.min.css',
  })
  eleventyConfig.addPassthroughCopy({
    './node_modules/bootstrap/dist/css/bootstrap.min.css.map': 'css//vendor/bootstrap.min.css.map',
  })
  eleventyConfig.addPassthroughCopy({
    './node_modules/swiper/swiper-bundle.css': 'css/swiper-bundle.css',
  })
  eleventyConfig.addPassthroughCopy({
    './node_modules/glightbox/dist/css/glightbox.min.css': 'css/glightbox.min.css',
  })*/

  eleventyConfig.on('eleventy.after', () => {
    /*cpSync(join(eleventyConfig.directories.output, '/vendor-css/'), join(eleventyConfig.directories.output, '/css/vendor/'), {
      recursive: true
    })*/
    cpSync('.cache/@11ty/img/', join(eleventyConfig.directories.output, '/img/built/'), {
      recursive: true
    })

    // copyFileSync(`${join(eleventyConfig.directories.output, '/vendor-css/')}bootstrap.min.css`, `${join(eleventyConfig.directories.output, '/css/')}bootstrap.min.css`)
  })
}
