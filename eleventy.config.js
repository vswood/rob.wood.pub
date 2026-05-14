import pluginWebc from '@11ty/eleventy-plugin-webc'
import EleventyVitePlugin from '@11ty/eleventy-plugin-vite'
import {RenderPlugin} from '@11ty/eleventy'
import viteConfig from './vite.config.js'
import faviconsPlugin from 'eleventy-plugin-gen-favicons'
import schema from '@quasibit/eleventy-plugin-schema'
import {minify} from 'terser'

const vitePluginConfig = {
  tempFolderName: '.11ty-vite',
  viteOptions: {...viteConfig},
}

export default function (eleventyConfig) {
  eleventyConfig.setDataFileSuffixes([".data", ""])

  eleventyConfig.addPlugin(schema)

  eleventyConfig.addPlugin(pluginWebc, {
    components: ['./src/html/component/**/*.webc'],
  })
  eleventyConfig.addPlugin(RenderPlugin)

  eleventyConfig.addPlugin(EleventyVitePlugin, vitePluginConfig)

  eleventyConfig.addPlugin(faviconsPlugin, {
    outputDir: 'dist',
    manifestData: {
      name: 'rob.wood.pub',
      short_name: 'rob.wood.pub',
      description: 'The professional portfolio website of Rob Wood.',
      background_color: '#ffffff',
      theme_color: '#0d6eaf',
    },
  })

  /* eleventyConfig.addFilter('cssmin', function (code) {
    return new CleanCSS({}).minify(code).styles
  }) */

  eleventyConfig.addNunjucksAsyncFilter(
    'jsmin',
    async function (code, callback) {
      try {
        const minified = await minify(code)
        return callback(null, minified.code)
      } catch (err) {
        console.error('Terser error: ', err)
        return callback(null, code)
      }
    },
  )

  // eleventyConfig.addPlugin(eleventyImageTransformPlugin)

  eleventyConfig.addPassthroughCopy('src/css')
  eleventyConfig.addPassthroughCopy('src/js')
  eleventyConfig.addPassthroughCopy('src/img')
  eleventyConfig.addPassthroughCopy('src/media')
  eleventyConfig.addPassthroughCopy({
    './node_modules/open-props/palette.min.css': 'css/palette.min.css',
  })

  eleventyConfig.addCollection('sortedContent', function (collection) {
    const content = collection.getFilteredByTag('content')
    content.sort(
      (content1, content2) =>
        content1.data.displayOrder - content2.data.displayOrder,
    )
  })
  /* eleventyConfig.addTransform('htmlmin', function (content) {
    // String conversion to handle `permalink: false`
    if ((this.page.outputPath || '').endsWith('.html') && !this.page.outputPath.includes('single-page')) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      })

      return minified
    }

    // If not an HTML output, return content as-is
    return content
  }) */

  eleventyConfig.addCollection("sortedHomeContent", function(collection) {
    const content = collection.getFilteredByTag("home");
    content.sort((content1, content2) => content1.data.displayOrder - content2.data.displayOrder)
    return content
  })

  return {
    templateFormats: ['md', 'njk', 'html', 'liquid', 'webc'],
    htmlTemplateEngine: 'njk',
    passthroughFileCopy: true,
    dir: {
      input: 'src',
      output: 'dist',
      includes: 'html/include',
      layouts: 'html/layout',
      data: 'html/data',
    },
  }
}
