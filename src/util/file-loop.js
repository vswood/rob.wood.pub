import {existsSync,readFileSync} from 'node:fs'

export default (files, open = '', close = '') => {
  const output = files.map(file => {
    if (existsSync(file)) {
      return `${open}${readFileSync(file, 'utf8').replace('@charset "UTF-8";', '').replace('/*# sourceMappingURL=bootstrap.min.css.map */', '')}${close}`
    }
  }).join('\n\n')
  return output
}
