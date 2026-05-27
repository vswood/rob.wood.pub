import vsEleventyPlugin from './src/config/vsEleventyPlugin.js'
import pluginWebc from '@11ty/eleventy-plugin-webc'
import dirOutputPlugin from '@11ty/eleventy-plugin-directory-output'

export default function (eleventyConfig) {

  eleventyConfig.addPlugin(vsEleventyPlugin)

  // eleventyConfig.addBundle("css")
  // eleventyConfig.addBundle("js")

  eleventyConfig.addPlugin(pluginWebc, {
    components: ['./src/html/component/**/*.webc'],
  })

  eleventyConfig.setServerPassthroughCopyBehavior('passthrough')

  eleventyConfig.setQuietMode(true);
	eleventyConfig.addPlugin(dirOutputPlugin)

  eleventyConfig.setServerOptions({
    port: 8081,
    /*https: {
      key: './.ssl/localhost.key',
      cert: './.ssl/localhost.cert',
    },*/
  })

  return {
    templateFormats: ['md', 'njk', 'html', 'liquid', 'webc', '11ty.js'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    // passthroughFileCopy: true,
    dir: {
      input: 'src',
      output: 'dist',
      includes: 'html/include',
      layouts: 'html/layout',
      data: 'html/data',
    },
  }

}
