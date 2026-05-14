import {resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

export default function config({
  configOverrides = {},
  name = `virtualStyle Test Coverage`,
  lcov = true,
  outputDir = resolve(process.cwd(), 'docs/coverage'),
} = {}) {
  const rootDir = resolve(fileURLToPath(new URL('..', import.meta.url)))
  const customReporterPath = resolve(
    rootDir,
    '.report-templates/custom-v8-html-reporter.js',
  )
  const templatePath = resolve(
    rootDir,
    '.report-templates/monocart-template.html',
  )

  return {
    name,
    lcov,
    outputDir,
    clean: true,
    cleanCache: true,
    sourceFilter: sourcePath => sourcePath.search(/src\/.+/) !== -1,
    sourcePath: (sourcePath) => {
      if (!sourcePath.startsWith('src') && !sourcePath.startsWith('test')) {
        const newPath = `../${sourcePath}`
        return newPath
      }
      return sourcePath
    },
    reports: [
      ['console-details'],
      [
        customReporterPath,
        {
          type: 'v8',
          outputFile: 'index.html',
          templatePath,
          // head: '<link rel="stylesheet" href="report.css">',
          assetsPath: 'custom-assets',
          mountSelector: '#coverage-root',
        },
      ],
      ['html'],
      ['lcovonly'],
    ],
    onEnd: results => {
      console.log(`Coverage report generated at: ${results.reportPath}`)
      results.files = results.files.map(f => {
        f.url = f.url.replaceAll(/src\/js\/coverage/gm, '')
        return f
      })
    },
  }
}
