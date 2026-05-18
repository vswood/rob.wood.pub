import pluginWebc from '@11ty/eleventy-plugin-webc'
import EleventyVitePlugin from '@11ty/eleventy-plugin-vite'
import {RenderPlugin} from '@11ty/eleventy'
import viteConfig from './vite.config.js'
import faviconsPlugin from 'eleventy-plugin-gen-favicons'
import schema from '@quasibit/eleventy-plugin-schema'
import {minify} from 'terser'
import {eleventyImageTransformPlugin} from '@11ty/eleventy-img'
import {cpSync, readdirSync, readFileSync} from 'node:fs'
import {join, parse, dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
// import {inspect} from 'node:util'
// import pageIcons from './src/html/data/pageIcons.js'
// import { parse as svgParse } from 'svg-parser';
// import {filter} from 'unist-util-filter'
// import {toHtml} from 'hast-util-to-html'
// import {matches, select, selectAll} from 'unist-util-select'
import pluginIcons from 'eleventy-plugin-icons'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const vitePluginConfig = {
  tempFolderName: '.11ty-vite',
  viteOptions: {...viteConfig},
}

export default function (eleventyConfig) {

  eleventyConfig.addPlugin(EleventyVitePlugin, vitePluginConfig)

  eleventyConfig.addPlugin(pluginIcons, {
    mode: 'sprite',
    sources: [
      {
        name: 'main',
        path: './src/html/content/icons/',
        default: true,
      },
    ],
    icon: {
      shortcode: 'icon',
      attributes: {
        'aria-hidden': 'true',
      },
      class: (name, source) => ``,
    },
    sprite: {
      shortcode: 'spriteSheet',
      attributes: {
        'aria-hidden': 'true',
        xmlns: 'http://www.w3.org/2000/svg',
      },
      writeFile: false,
      extraIcons: {
        icons: [
          {
            name:'architect',
            source: 'main',
          },
          {
            name: 'cloud-circle',
            source: 'main',
          },
          {
            name: 'cloud-governance',
            source: 'main',
          },
          {
            name: 'cloud-network',
            source: 'main',
          },
          {
            name: 'devops',
            source: 'main',
          },
          {
            name: 'disconnect',
            source: 'main',
          },
          {
            name: 'executive',
            source: 'main',
          },
          {
            name: 'leadership',
            source: 'main',
          },
          {
            name: 'mentor',
            source: 'main',
          },
          {
            name: 'money',
            source: 'main',
          },
          {
            name: 'optimization',
            source: 'main',
          },
          {
            name: 'product',
            source: 'main',
          },
          {
            name: 'question-duck',
            source: 'main',
          },
          {
            name: 'rising-graph',
            source: 'main',
          },
          {
            name: 'strategy-plan',
            source: 'main',
          },
          {
            name: 'speech-bubble-square',
            source: 'main',
          },
          {
            name: 'team-leader',
            source: 'main',
          },
          {
            name: 'triage',
            source: 'main',
          },
          {
            name: 'uptime',
            source: 'main',
          },
          {
            name: 'github',
            source: 'main',
          },
          {
            name: 'x',
            source: 'main',
          },
          {
            name: 'facebook',
            source: 'main',
          },
          {
            name: 'instagram',
            source: 'main',
          },
          {
            name: 'youtube',
            source: 'main',
          },
          {
            name: 'substack',
            source: 'main',
          },
          {
            name: 'medium',
            source: 'main',
          },
          {
            name: 'linkedin',
            source: 'main',
          },
        ],
      }
    },
  })

  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    urlPath: '/img/built/',
    extensions: 'html',
    outputDir: '.cache/@11ty/img/',
    failOnError: false,
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
      const {name} = path.parse(src)
      return `${name}-${width}w.${format}`
    },
  })

  eleventyConfig.on('eleventy.after', () => {
    cpSync('.cache/@11ty/img/', join(eleventyConfig.directories.output, '/img/built/'), {
      recursive: true
    })
  })

  eleventyConfig.setDataFileSuffixes(['.data', ''])

  //eleventyConfig.addPassthroughCopy('src/img/icon/skills-sprite.svg')

  eleventyConfig.addPlugin(schema)

  eleventyConfig.addPlugin(pluginWebc, {
    components: ['./src/html/component/**/*.webc'],
  })
  eleventyConfig.addPlugin(RenderPlugin)


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
    const content = collection.getFilteredByTag('sections')
    content.sort(
      (content1, content2) =>
        content1.data.displayOrder - content2.data.displayOrder,
    )
  })


  /*eleventyConfig.addCollection("icons", function () {
    const iconDir = join(__dirname, "src/html/content/icons") // Your SVG path

    // Read the directory and filter for .svg files
    const usedIcons = Array.from(pageIcons.icons).map(i => i[0])
    const icons = readdirSync(iconDir)
      .filter(file => {
        return file.endsWith(".svg") && usedIcons.includes(file.replace('.svg', ''))
      })
      .map(file => {
        const name = parse(file).name.replace('.svg', '')
        const data = readFileSync(join(iconDir, file), "utf8")

        const parsed = svgParse(data)
        // const children = parsed.children
        const viewBox = parsed.children[0].properties.viewBox

        const groups = selectAll('[tagName="g"]', parsed)
        const paths = selectAll('[tagName="path"]', parsed)
        console.dir(groups, {depth:null})
        console.dir(paths, {depth:null})
        let els = paths
        if(groups.length > 0) {
          els = groups
        }

        const symbol = `<symbol id="icon-${name}" viewBox="${viewBox}">${toHtml(els)}</symbol>`
        return {
          name,
          symbol,
        }
      })
    return icons
  })*/

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

  /* eleventyConfig.addShortcode('icon', function (name, width, height) {
    const icon = {
      name,
      width,
      height,
    }
    pageIcons.icons.set(name, icon)
    return `<svg role='img' aria-hidden='true' width='${width}' height='${height}'><use href='#icon-${name}'></use>
      </svg>`
  }) */

  eleventyConfig.addFilter("keys", obj => Object.keys(obj).sort())

  // Advanced debug filter using Node's util.inspect
  eleventyConfig.addFilter("debug", (obj) => {
    return inspect(obj, {depth: 3})
  })

  return {
    templateFormats: ['md', 'njk', 'html', 'liquid', 'webc'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",
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
