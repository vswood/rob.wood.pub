import {minify} from 'terser'
import CleanCSS from 'clean-css'
import {inspect} from 'node:util'

const jsMinCache = {}

export default function(eleventyConfig) {

  eleventyConfig.addFilter("keys", obj => Object.keys(obj).sort())

  eleventyConfig.addFilter("inspect", function (value) {
    return inspect(value, {showHidden: false, depth: 4, colors: false})
  })

  eleventyConfig.addFilter('cssmin', function (code) {
    return new CleanCSS({}).minify(code).styles
  })

  eleventyConfig.addFilter("findIndex", (array, key, value) => {
    let found =  array.findIndex(item => item[key] === value)
    if (!found) {
      found = 0
    }
    return found
  })

  const jsMinCache = {}
  eleventyConfig.addNunjucksAsyncFilter('jsmin', async function (code, callback) {
    try {
      if (jsMinCache[code]) {
        callback(null, jsMinCache[code])
      } else {
        const minified = await minify(code)
        jsMinCache[code] = minified.code
        callback(null, minified.code)
      }
    } catch (err) {
      console.error('Terser error: ', err)
      delete jsMinCache[code]
      callback(null, code)
    }
  })

}
