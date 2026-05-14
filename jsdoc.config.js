import config from './jsdoc.configure.js'
import pkg from './package.json' with {type: 'json'}

const options = {
  title: pkg.name,
  version: pkg.version,
  description: pkg.description,
}

const jsDocConfig = config(options)

// console.log(jsDocConfig)

export default jsDocConfig
