
// import Image from '@11ty/eleventy-img'
import htmlmin from 'html-minifier-terser'
import {parse} from 'node:path'


const isProd = process.env.ELEVENTY_ENV === ' prod'

export default function(eleventyConfig) {

  if(isProd) {

    eleventyConfig.addTransform('htmlmin', function (content) {
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

    // eleventyConfig.addShortcode(' image' , async function (src, alt, widths = [300, 600], sizes = ' ' ) {
    //   return Image(src, {
    //     widths,
    //     formats: [' avif' , ' jpeg' ],
    //     returnType: ' html' ,
    //     transformOnRequest: !isProd,
    //     htmlOptions: {
    //       imgAttributes: {
    //         alt,
    //         sizes,
    //         loading: ' lazy' ,
    //         decoding: ' async' ,
    //       }
    //     }
    //   })
    // })

    // eleventyConfig.addShortcode('img', function imageShortcode(src, cls, alt, widths = [300, 600, 'auto'], sizes = '100vh') {
    //   let options = {
    //     widths,
    //     formats: ['avif'],
    //   };

    //   // generate images: this is async but we don’t wait
    //   Image(src, options);

    //   let imageAttributes = {
    //     class: cls,
    //     alt,
    //     sizes,
    //     loading: 'lazy',
    //     decoding: 'async',
    //   };
    //   // get metadata even if the images are not fully generated yet
    //   let metadata = Image.statsSync(src, options);
    //   return Image.generateHTML(metadata, imageAttributes);
    // })

  /* eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    urlPath: '/img/built/',
    extensions: 'html',
    outputDir: '.cache/@11ty/img/',
    failOnError: true,
    transformOnRequest: !isProd,
    svgShortCircuit: true,
    formats: ['avif'],
    widths: [320, 570, 1024, auto],
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
  }) */

}
