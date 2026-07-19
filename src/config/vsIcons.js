import pageIcons from '../html/data/pageIcons.js'

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
}
