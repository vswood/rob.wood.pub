
import {eleventyImageTransformPlugin} from '@11ty/eleventy-img'
import htmlmin from 'html-minifier-terser'
import {parse} from 'node:path'


const isProd = process.env.ELEVENTY_ENV === "prod"

export default function(eleventyConfig) {

  if(isProd) {

    eleventyConfig.addTransform('htmlmin', function (content) {
      // String conversion to handle `permalink: false`
      if ((this.page.outputPath || '').endsWith('.html') && !this.page.outputPath.includes('single-page')) {
        let minified = htmlmin.minify(content, {
          useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true,
        })

        return minified
      }
      return content
    })

  }

  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    urlPath: '/img/built/',
    extensions: 'html',
    outputDir: '.cache/@11ty/img/',
    failOnError: false,
    transformOnRequest: true,
    svgShortCircuit: true,
    // output image formats
    formats: ['svg', 'avif', 'webp', 'jpeg'],

    // output image widths
    // widths: ['auto'],
    widths: [320, 570, 880, 1024, 1248],

    // optional, attributes assigned on <img> nodes override these values
    htmlOptions: {
      imgAttributes: {
        loading: 'lazy',
        decoding: 'async',
      },
      pictureAttributes: {}
    },
    filenameFormat: (id, src, width, format) => {
      const {name} = parse(src)
      return `${name}-${width}w.${format}`
    },
  })

}
