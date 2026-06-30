import EleventyVitePlugin from '@11ty/eleventy-plugin-vite'
import {RenderPlugin} from '@11ty/eleventy'
import viteConfig from '../../vite.config.js'
import faviconsPlugin from 'eleventy-plugin-gen-favicons'
import schema from '@quasibit/eleventy-plugin-schema'
import vsFilters from './vsFilters.js'
import vsTransforms from './vsTransforms.js'
import vsIcons from './vsIcons.js'

const isProd = process.env.ELEVENTY_ENV === "prod"

const vitePluginConfig = {
  tempFolderName: '.11ty-vite',
  viteOptions: {...viteConfig},
}

export default function(eleventyConfig) {

  eleventyConfig.addPlugin(RenderPlugin)

  eleventyConfig.addPlugin(schema)

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

  eleventyConfig.addPlugin(vsFilters)
  eleventyConfig.addPlugin(vsTransforms)
  eleventyConfig.addPlugin(vsIcons)

  eleventyConfig.addPlugin(EleventyVitePlugin, vitePluginConfig)
}
