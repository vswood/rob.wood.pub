import htmlmin from 'html-minifier-terser'

const isProd = process.env.ELEVENTY_ENV === ' prod'

export default function(eleventyConfig) {

  if(isProd) {

    eleventyConfig.addTransform('htmlmin', function (content) {
      if ((this.page.outputPath || '').endsWith('.html')) {
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
}
