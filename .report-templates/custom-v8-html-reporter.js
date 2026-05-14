import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

// Use createRequire so we can resolve CJS-only internals from the monocart package
// even though this file is ESM (repo is type: module).
const require = createRequire(import.meta.url);
const requireFromVitest = createRequire(
  require.resolve('vitest-monocart-coverage'),
);
const { deflateSync } = requireFromVitest('lz-utils');

// These are internal helpers used by the built-in V8 HTML reporter.
const mcrRoot = path.dirname(
  requireFromVitest.resolve('monocart-coverage-reports/package.json'),
);
const Util = requireFromVitest(path.join(mcrRoot, 'lib/utils/util.js'));
const assetsMap = requireFromVitest(
  path.join(mcrRoot, 'lib/packages/monocart-coverage-assets.js'),
);

// Minimal default wrapper; swap this out or point to your own template file.
const defaultTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/png"
      href="https://cdn.jsdelivr.net/gh/virtualstyle/dev-base/img/favicon/favicon-96x96.png"
      sizes="96x96" />
    <link rel="icon" type="image/svg+xml"
      href="https://cdn.jsdelivr.net/gh/virtualstyle/dev-base/img/favicon/favicon.svg" />
    <link rel="shortcut icon"
      href="https://cdn.jsdelivr.net/gh/virtualstyle/dev-base/img/favicon/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180"
      href="https://cdn.jsdelivr.net/gh/virtualstyle/dev-base/img/favicon/apple-touch-icon.png" />
    <title>{title}</title>
    {head}
</head>
<body>
{content}
</body>
</html>
`;

/**
 * Custom V8 HTML reporter that reuses the core serialization logic
 * but lets you fully control the HTML wrapper and styling.
 *
 * Usage in your MCR config:
 * {
 *   reports: [
 *     [path.resolve('./examples/custom-v8-html-reporter.js'), {
 *       outputFile: 'my-v8.html',
 *       templatePath: './my-template.html', // or provide `template` inline
 *       head: '<link rel="stylesheet" href="report.css">', // optional extra head content
 *       assetsPath: 'custom-assets', // optional output subdir for JS bundle
 *       appScriptPath: './dist/monocart-coverage-app.js' // optional custom UI bundle
 *     }]
 *   ]
 * }
 */
export default class CustomV8HtmlReporter {
  constructor(options = {}, globalOptions = {}) {
    this.options = {
      outputFile: 'custom-v8.html',
      inline: false,
      assetsPath: 'assets',
      reportDataFile: 'coverage-data.js',
      template: null,
      templatePath: null,
      head: '',
      appScript: null,
      appScriptPath: null,
      appFilename: 'monocart-coverage-app.js',
      ...options,
    };
    this.globalOptions = globalOptions;
  }

  getTemplate() {
    const { template, templatePath } = this.options;
    if (template) {
      return template;
    }
    if (templatePath && fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf8');
    }
    // fall back to the tiny default wrapper
    return defaultTemplate;
  }

  getAppScript() {
    const { appScript, appScriptPath } = this.options;
    if (appScript) {
      return appScript;
    }
    if (appScriptPath) {
      return fs.readFileSync(path.resolve(appScriptPath), 'utf8');
    }
    // reuse the bundled UI from the package so the report behaves the same
    return assetsMap['monocart-coverage-app'];
  }

  async generate(reportData) {
    const {
      outputFile,
      inline,
      assetsPath,
      reportDataFile,
      head,
      appFilename,
    } = this.options;

    const outputDir = this.globalOptions.outputDir;
    const htmlPath = path.resolve(outputDir, outputFile);
    reportData.reportPath = Util.relativePath(htmlPath);

    // compress data exactly like the built-in reporter
    const reportDataCompressed = deflateSync(JSON.stringify(reportData));
    const reportDataStr = `window.reportData = '${reportDataCompressed}';`;

    const appScript = this.getAppScript();
    const eol = Util.getEOL();
    let contentStr = '';

    if (inline) {
      contentStr = ['<script>', reportDataStr, appScript, '</script>'].join(
        eol,
      );
    } else {
      await Util.writeFile(
        path.resolve(outputDir, reportDataFile),
        reportDataStr,
      );

      const assetsDir = path.resolve(outputDir, assetsPath);
      const appPath = path.resolve(assetsDir, appFilename);
      if (!fs.existsSync(appPath)) {
        await Util.writeFile(appPath, appScript);
      }
      const relAssetsDir = Util.relativePath(assetsDir, outputDir);

      contentStr = [
        `<script src="${reportDataFile}"></script>`,
        `<script src="${relAssetsDir}/${appFilename}"></script>`,
      ].join(eol);
    }

    const template = this.getTemplate();
    const html = Util.replace(
      template,
      {
        title: reportData.title || reportData.name || 'Coverage Report',
        head,
        content: contentStr,
      },
      '',
    );

    await Util.writeFile(htmlPath, html);

    // return relative path just like the built-in reporter
    return Util.relativePath(htmlPath);
  }
}
