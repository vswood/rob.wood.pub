import autoprefixer from 'autoprefixer'
import postcssNested from 'postcss-nested'
import postcssImport from 'postcss-import'
import postcssUrl from 'postcss-url'
import postcssClassApply from 'postcss-class-apply/dist/index.js'
import cssnano from 'cssnano'
import discardComments from 'postcss-discard-comments'

const config = {
  plugins: [
    postcssImport,
    postcssUrl,
    postcssNested,
    discardComments,
    postcssClassApply,
    autoprefixer,
    cssnano({preset: 'default'}),
  ],
}

export default config
