import autoprefixer from 'autoprefixer'
import postcssNested from 'postcss-nested'
import postcssImport from 'postcss-import'
import postcssUrl from 'postcss-url'
import postcssClassApply from 'postcss-class-apply/dist/index.js'
import cssnano from 'cssnano'
import discardComments from 'postcss-discard-comments'
import purgeCSSPlugin from '@fullhuman/postcss-purgecss'
import { glob } from 'glob'

const config = {
  plugins: [
    postcssImport,
    postcssUrl,
    postcssNested,
    discardComments,
    postcssClassApply,
    purgeCSSPlugin({
      content: glob.sync(`./src/**/*`, { nodir: true }),
      rejected: true,
      rejectedCss: true,
    }),
    autoprefixer,
    cssnano({preset: 'default'}),
  ],
}

export default config
