import vsEleventyPlugin from './src/config/vsEleventyPlugin.js'
import pluginWebc from '@11ty/eleventy-plugin-webc'
import dirOutputPlugin from '@11ty/eleventy-plugin-directory-output'
import ejsPlugin from '@11ty/eleventy-plugin-ejs'

export default function (eleventyConfig) {

  eleventyConfig.addPlugin(ejsPlugin)

  eleventyConfig.addPlugin(vsEleventyPlugin)

  eleventyConfig.addPlugin(pluginWebc, {
    components: ['./src/html/component/**/*.webc'],
  })

  // eleventyConfig.setServerPassthroughCopyBehavior('copy')

  eleventyConfig.setServerOptions({
    port: 8081,
  })

  return {
    templateFormats: ['md', 'njk', 'html', 'liquid', 'webc', '11ty.js'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    dir: {
      input: 'src',
      output: 'dist',
      includes: 'html/include',
      layouts: 'html/layout',
      data: 'html/data',
    },
  }

}
