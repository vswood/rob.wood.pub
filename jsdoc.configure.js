export default ({
  title,
  version = '0.1.0',
  description,
  menuLinks = [
      {
          label: 'virtualStyle',
          url: 'https://virtualstyle.us'
      },
      {
          label: 'GitHub',
          url: 'https://github.com/virtualstyle'
      },
      {
          label: 'Rob Wood',
          url: 'https://rob.wood.pub'
      },
      {
          label: 'GitHub',
          url: 'https://github.com/vswood'
      },
  ],
} = {}) => {
  return {
    plugins: [
      '@alphanull/jsdoc-plugin-esnext',
      'plugins/markdown',
      'plugins/summarize'
    ],
    metadata: {
      title,
      logo: './static/logo.svg'
    },
    recurseDepth: 10,
    sourceType: 'module',
    templates: {
      cleverLinks: false,
      monospaceLinks: false,
      default: {
        outputSourcePath: false,
        staticFiles: {
          paths: [
            './static'
          ],
          include: [
            './'
          ],
          includePattern: '\/static\/.*'
        }
      },
      title,
      showTitleOnHomepage: false,
      description,
      sort: false,
      logoText: false,
      logo: './static/logo.svg',
      logoDark: './static/logo-dark.svg',
      favicon: './static/favicon.svg',
      // css: './scripts/docs/vision-player.css',
      css: './docs-support/custom.css',
      footer: `<p><b>${title} ${version}</b> &copy; 2026 Rob Wood</p>`,
      skin: 'grayscale',
      skinLabel: 'Grayscale Skin',
      showFolded: true,
      showPrivates: true,
      showSkinSelector: true,
      showFontSelector: true,
      fontFamily: 'Fira Sans, sans-serif',
      tutorialLabel: 'Guide',
      tutorialLabelPlural: 'Guides',
      tutorialHeader: false,
      tutorialPageNav: false,
      shortModuleLinkNames: true,
      menuLinks,
    },
    opts: {
      template: '@alphanull/jsdoc-vision-theme',
      'prism-theme': 'prism-custom',
      encoding: 'utf8',
      destination: './docs/jsdocs',
      recurse: true,
      displayModuleHeader: true
    },
    markdown: {
      hardwrap: false,
      idInHeadings: true
    },
    tags: {
      allowUnknownTags: true,
      dictionaries: [
        'jsdoc',
        'closure'
      ]
    },
    source: {
      include: [
        './src/js'
      ],
      includePattern: '.js$',
      excludePattern: '(node_modules/|docs|.aws-sam/|code-reports/)'
    }
  }
}
