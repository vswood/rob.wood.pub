import {readdirSync} from 'node:fs'
import {join, parse, dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import pageIcons from '../html/data/pageIcons.js'
// import { parse as svgParse } from 'svg-parser';
// import {filter} from 'unist-util-filter'
// import {toHtml} from 'hast-util-to-html'
// import {matches, select, selectAll} from 'unist-util-select'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default function(eleventyConfig) {
  eleventyConfig.addShortcode('icon', function (name, attrs = {}) {
    let icon
    let width
    let height
    try {
      const parsedAttrs = JSON.parse(attrs)
      width = parsedAttrs.width
      height = parsedAttrs.height
      icon = {
        name,
        width,
        height,
      }
    } catch (e) {
      console.error(e)
    }
    pageIcons.icons.set(name, icon)
    return `<svg role='img' width="${width}" height="${height}" aria-hidden="true"><use width="${width}" height="${height}" href="#icon-${name}"></use>
      </svg>`
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
}
