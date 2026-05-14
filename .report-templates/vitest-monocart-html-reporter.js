import fs from 'node:fs';
import path from 'node:path';
import { createCoverageMap } from 'istanbul-lib-coverage';
import { BaseReporter } from 'vitest/reporters';

const DEFAULT_OPTIONS = {
  /**
   * Location for the generated HTML file. Relative to the Vitest root.
   */
  outputFile: 'coverage/monocart-lite.html',
  /**
   * Label shown in the header of the report.
   */
  title: 'Coverage Report',
  /**
   * Percent thresholds for coloring coverage cells.
   */
  thresholds: { good: 90, warn: 75 },
};

/**
 * Vitest reporter that writes a single-file, monocart-inspired coverage report
 * with only vanilla HTML/CSS/JS. It expects coverage data from Istanbul/V8
 * (e.g. `coverage-final.json`) delivered via `onCoverage` or loaded from disk.
 *
 * Example usage (vitest.config.js):
 *
 * export default defineConfig({
 *   test: {
 *     coverage: { reporter: ['json', 'text'] },
 *     reporters: [
 *       'default',
 *       ['./.config/vitest-monocart-html-reporter.js', {
 *         outputFile: 'coverage/monocart-lite.html',
 *         title: 'My Project Coverage'
 *       }]
 *     ],
 *   },
 * });
 */
export default class MonocartLiteReporter extends BaseReporter {
  constructor(options = {}) {
    super();
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.coverageMap = null;
    this.root = process.cwd();
  }

  onInit(ctx) {
    this.ctx = ctx;
    this.root = ctx?.config?.root
      ? path.resolve(ctx.config.root)
      : process.cwd();
  }

  onCoverage(coverageMap) {
    this.coverageMap = coverageMap;
  }

  async onTestRunEnd() {
    try {
      const coverage = await this.resolveCoverageMap();
      if (!coverage) {
        this.log(
          '[monocart-lite] No coverage data found. Enable coverage JSON output.',
        );
        return;
      }

      const reportData = buildReportPayload(coverage, this.root);
      const html = renderHtmlReport(reportData, this.options);
      const outFile = path.resolve(this.root, this.options.outputFile);

      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, html, 'utf8');

      const relativeOutFile = path.relative(this.root, outFile) || outFile;
      this.log(`[monocart-lite] Report written to ${relativeOutFile}`);
    } catch (error) {
      this.error('[monocart-lite] Failed to write coverage report:', error);
    }
  }

  async resolveCoverageMap() {
    if (this.coverageMap) {
      return createCoverageMap(this.coverageMap);
    }

    const fallbackPath = path.resolve(
      this.root,
      'coverage/coverage-final.json',
    );
    if (fs.existsSync(fallbackPath)) {
      const json = fs.readFileSync(fallbackPath, 'utf8');
      return createCoverageMap(JSON.parse(json));
    }

    return null;
  }
}

function buildReportPayload(coverageMap, root) {
  const summary = coverageMap.getCoverageSummary().data;
  const files = coverageMap.files().map((filePath) => {
    const fileCoverage = coverageMap.fileCoverageFor(filePath);
    const fileSummary = fileCoverage.toSummary().data;
    const source = getSource(fileCoverage, filePath);
    const lines = buildLineCoverage(fileCoverage, source);

    return {
      path: path.relative(root, filePath) || filePath,
      metrics: formatMetrics(fileSummary),
      lines,
    };
  });

  files.sort((a, b) => a.path.localeCompare(b.path));

  return {
    generatedAt: new Date().toISOString(),
    root,
    totals: formatMetrics(summary),
    files,
  };
}

function getSource(fileCoverage, filePath) {
  if (Array.isArray(fileCoverage.data?.code) && fileCoverage.data.code.length) {
    return fileCoverage.data.code;
  }

  try {
    const fileText = fs.readFileSync(filePath, 'utf8');
    return fileText.replace(/\r\n/g, '\n').split('\n');
  } catch (error) {
    console.warn(
      `[monocart-lite] Unable to read source for ${filePath}:`,
      error,
    );
    return [];
  }
}

function buildLineCoverage(fileCoverage, sourceLines) {
  const lineHits = fileCoverage.getLineCoverage
    ? fileCoverage.getLineCoverage()
    : {};
  const branchesByLine = collectBranches(fileCoverage);
  const statementsByLine = collectStatements(fileCoverage);

  return sourceLines.map((text, index) => {
    const lineNumber = index + 1;
    const hits = lineHits[lineNumber] ?? 0;
    const branchInfo = branchesByLine.get(lineNumber);
    const statementHits = statementsByLine.get(lineNumber) || [];

    const hasHitStatement = statementHits.some((count) => count > 0);
    const hasMissedStatement = statementHits.some((count) => count === 0);
    const branchCounts = branchInfo?.flatMap((b) => b.hits) || [];
    const hasBranchHit = branchCounts.some((count) => count > 0);
    const hasBranchMiss = branchCounts.some((count) => count === 0);

    let state = hits > 0 ? 'hit' : 'miss';
    if (
      (hasHitStatement && hasMissedStatement) ||
      (hasBranchHit && hasBranchMiss)
    ) {
      state = 'partial';
    } else if (hasBranchMiss && !hasBranchHit) {
      state = 'miss';
    }

    return {
      n: lineNumber,
      t: text,
      h: hits,
      s: state,
      b: branchInfo?.map((branch) => ({
        type: branch.type,
        hits: branch.hits,
      })),
    };
  });
}

function collectStatements(fileCoverage) {
  const statements = new Map();
  const statementMap = fileCoverage.data?.statementMap || {};
  const hits = fileCoverage.data?.s || {};

  for (const [id, loc] of Object.entries(statementMap)) {
    const count = hits[id] ?? 0;
    const start = loc?.start?.line || loc?.line || 0;
    const end = loc?.end?.line || start;
    for (let line = start; line <= end; line += 1) {
      const list = statements.get(line) || [];
      list.push(count);
      statements.set(line, list);
    }
  }

  return statements;
}

function collectBranches(fileCoverage) {
  const byLine = new Map();
  const branchMap = fileCoverage.data?.branchMap || {};
  const hits = fileCoverage.data?.b || {};

  for (const [id, branch] of Object.entries(branchMap)) {
    const line = branch?.line || branch?.loc?.start?.line;
    if (!line) continue;

    const branchHits = hits[id];
    if (!branchHits) continue;

    const bucket = byLine.get(line) || [];
    bucket.push({ type: branch.type, hits: branchHits });
    byLine.set(line, bucket);
  }

  return byLine;
}

function formatMetrics(summary) {
  return {
    lines: normalize(summary.lines),
    statements: normalize(summary.statements),
    functions: normalize(summary.functions),
    branches: normalize(summary.branches),
  };
}

function normalize(metric) {
  const pct = typeof metric.pct === 'number' ? metric.pct : 0;
  return {
    pct: Number.isFinite(pct) ? Math.round(pct * 100) / 100 : 0,
    covered: metric.covered ?? 0,
    total: metric.total ?? 0,
    skipped: metric.skipped ?? 0,
  };
}

function renderHtmlReport(payload, options) {
  const safeJson = JSON.stringify(payload).replace(/</g, '\\u003c');
  const { title, thresholds } = options;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/png"
    href="https://cdn.jsdelivr.net/gh/virtualstyle/dev-base/img/favicon/favicon-96x96.png"
    sizes="96x96" />
  <link rel="icon" type="image/svg+xml"
    href="https://cdn.jsdelivr.net/gh/virtualstyle/dev-base/img/favicon/favicon.svg" />
  <link rel="shortcut icon"
    href="https://cdn.jsdelivr.net/gh/virtualstyle/dev-base/img/favicon/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180"
    href="https://cdn.jsdelivr.net/gh/virtualstyle/dev-base/img/favicon/apple-touch-icon.png" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f7f8fa;
      --panel: #ffffff;
      --line: #e5e7eb;
      --text: #111827;
      --muted: #6b7280;
      --accent: #0f172a;
      --good: #16a34a;
      --warn: #d97706;
      --bad: #dc2626;
      --shadow: 0 12px 30px rgba(0,0,0,0.08);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Sora', 'Manrope', 'Inter', 'SF Pro Text', system-ui, sans-serif;
      color: var(--text);
      background: radial-gradient(circle at 20% 20%, rgba(15,23,42,0.04), transparent 35%), radial-gradient(circle at 80% 10%, rgba(22,163,74,0.05), transparent 30%), var(--bg);
      min-height: 100vh;
      padding: 1.5rem;
    }
    header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .title {
      font-size: 1.4rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .meta {
      color: var(--muted);
      font-size: 0.9rem;
    }
    .pill {
      padding: 0.4rem 0.75rem;
      border-radius: 999px;
      background: #0f172a;
      color: white;
      font-weight: 600;
      font-size: 0.85rem;
      letter-spacing: 0.01em;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.9rem;
      width: 100%;
      margin-bottom: 1rem;
    }
    .card {
      background: var(--panel);
      padding: 1rem;
      border-radius: 14px;
      box-shadow: var(--shadow);
      border: 1px solid rgba(15,23,42,0.06);
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .card h3 {
      margin: 0;
      font-size: 0.95rem;
      color: var(--muted);
      font-weight: 600;
    }
    .card .value {
      font-size: 1.6rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .bar {
      height: 8px;
      width: 100%;
      background: var(--line);
      border-radius: 999px;
      overflow: hidden;
    }
    .bar span {
      display: block;
      height: 100%;
      border-radius: inherit;
      transition: width 0.4s ease;
    }
    .layout {
      display: grid;
      grid-template-columns: minmax(280px, 1fr) minmax(320px, 2fr);
      gap: 1rem;
    }
    @media (max-width: 960px) {
      .layout { grid-template-columns: 1fr; }
    }
    .panel {
      background: var(--panel);
      border-radius: 14px;
      padding: 1rem;
      box-shadow: var(--shadow);
      border: 1px solid rgba(15,23,42,0.06);
      min-height: 280px;
    }
    .panel header {
      margin: 0 0 0.75rem;
      padding: 0;
      justify-content: space-between;
    }
    .search {
      display: flex;
      gap: 0.6rem;
      align-items: center;
      margin-bottom: 0.6rem;
    }
    .search input {
      flex: 1;
      padding: 0.6rem 0.75rem;
      border-radius: 10px;
      border: 1px solid var(--line);
      background: #f8fafc;
      font-size: 0.95rem;
    }
    .search input:focus {
      outline: 2px solid rgba(15,23,42,0.1);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.95rem;
    }
    thead {
      position: sticky;
      top: 0;
      background: var(--panel);
      z-index: 2;
    }
    th, td {
      padding: 0.55rem 0.35rem;
      text-align: left;
    }
    th {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: var(--muted);
      cursor: pointer;
      user-select: none;
    }
    tr:hover td {
      background: rgba(15,23,42,0.03);
    }
    tr.selected td {
      background: rgba(15,23,42,0.06);
    }
    .metric {
      padding: 0.2rem 0.55rem;
      border-radius: 8px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.9rem;
    }
    .metric span {
      color: var(--muted);
      font-weight: 600;
    }
    .good { color: var(--good); background: rgba(22,163,74,0.1); }
    .warn { color: var(--warn); background: rgba(217,119,6,0.1); }
    .bad { color: var(--bad); background: rgba(220,38,38,0.12); }
    .code {
      font-family: 'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace;
      background: #0b1224;
      color: #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.05);
      min-height: 200px;
    }
    .code-header {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      align-items: center;
      background: rgba(255,255,255,0.04);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .code-body {
      max-height: 70vh;
      overflow: auto;
      padding: 0.5rem 0.75rem 1rem;
    }
    .line {
      display: grid;
      grid-template-columns: 50px 1fr;
      gap: 0.75rem;
      padding: 0.15rem 0.6rem;
      border-radius: 8px;
      align-items: baseline;
      white-space: pre;
    }
    .line-number {
      color: rgba(255,255,255,0.4);
      font-size: 0.85rem;
      text-align: right;
    }
    .line.hit { background: rgba(22,163,74,0.08); }
    .line.partial { background: rgba(217,119,6,0.08); }
    .line.miss { background: rgba(220,38,38,0.08); }
    .line .text { overflow-x: auto; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
      background: rgba(255,255,255,0.08);
      color: #e5e7eb;
      font-size: 0.85rem;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .empty {
      text-align: center;
      color: var(--muted);
      padding: 1rem;
      font-size: 0.95rem;
    }
  </style>
</head>
<body>
  <header>
    <div>
      <div class="title">${escapeHtml(title)}</div>
      <div class="meta">Generated ${escapeHtml(payload.generatedAt)}</div>
    </div>
    <div class="pill">Monocart-inspired</div>
  </header>

  <section class="cards" id="summary-cards"></section>

  <section class="layout">
    <section class="panel">
      <header>
        <div class="title" style="font-size:1.05rem;">Files</div>
      </header>
      <div class="search">
        <input id="filter" type="search" placeholder="Filter by path..." aria-label="Filter files" />
      </div>
      <div style="overflow:auto; max-height: 70vh;">
        <table id="file-table">
          <thead>
            <tr>
              <th data-key="path">File</th>
              <th data-key="lines">Lines</th>
              <th data-key="statements">Statements</th>
              <th data-key="functions">Functions</th>
              <th data-key="branches">Branches</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </section>

    <section class="panel">
      <div class="code">
        <div class="code-header">
          <div id="file-label" class="badge">Select a file</div>
          <div id="file-metrics" style="display:flex; gap:0.5rem; flex-wrap:wrap;"></div>
        </div>
        <div class="code-body" id="code-view">
          <div class="empty">Choose a file to see annotated source.</div>
        </div>
      </div>
    </section>
  </section>

  <script type="application/json" id="cov-data">${safeJson}</script>
  <script>
    (() => {
      const data = JSON.parse(document.getElementById('cov-data').textContent);
      const thresholds = ${JSON.stringify(thresholds)};
      const state = { sortKey: 'path', sortDir: 'asc', filter: '', selected: null };

      const summaryEl = document.getElementById('summary-cards');
      const tableBody = document.querySelector('#file-table tbody');
      const tableHead = document.querySelector('#file-table thead');
      const filterInput = document.getElementById('filter');
      const codeView = document.getElementById('code-view');
      const fileLabel = document.getElementById('file-label');
      const fileMetrics = document.getElementById('file-metrics');

      function pctClass(pct) {
        if (pct >= thresholds.good) return 'good';
        if (pct >= thresholds.warn) return 'warn';
        return 'bad';
      }

      function formatPct(pct) {
        return Number.isFinite(pct) ? pct.toFixed(1).replace(/\\.0$/, '') + '%' : '0%';
      }

      function renderSummary() {
        const cards = [
          ['Lines', data.totals.lines],
          ['Statements', data.totals.statements],
          ['Functions', data.totals.functions],
          ['Branches', data.totals.branches],
        ];

        summaryEl.innerHTML = cards.map(([label, metric]) => {
          const cls = pctClass(metric.pct);
          return \`
            <article class="card">
              <h3>\${label}</h3>
              <div class="value \${cls}">\${formatPct(metric.pct)}</div>
              <div class="meta">\${metric.covered} / \${metric.total} covered</div>
              <div class="bar"><span class="\${cls}" style="width: \${metric.pct}%"></span></div>
            </article>
          \`;
        }).join('');
      }

      function renderTable() {
        const rows = data.files
          .filter((file) => file.path.toLowerCase().includes(state.filter))
          .sort((a, b) => {
            const key = state.sortKey;
            if (key === 'path') return state.sortDir === 'asc' ? a.path.localeCompare(b.path) : b.path.localeCompare(a.path);
            const av = a.metrics[key].pct || 0;
            const bv = b.metrics[key].pct || 0;
            return state.sortDir === 'asc' ? av - bv : bv - av;
          })
          .map((file) => {
            const active = state.selected === file.path ? 'class="selected"' : '';
            const cells = ['lines','statements','functions','branches'].map((key) => {
              const metric = file.metrics[key];
              const cls = pctClass(metric.pct);
              return \`<td><span class="metric \${cls}">\${formatPct(metric.pct)} <span>\${metric.covered}/\${metric.total}</span></span></td>\`;
            }).join('');
            return \`<tr data-path="\${file.path}" \${active}><td>\${escapeHtml(file.path)}</td>\${cells}</tr>\`;
          }).join('');

        tableBody.innerHTML = rows || '<tr><td colspan="5" class="empty">No files match your filter.</td></tr>';
      }

      function renderFile(path) {
        const file = data.files.find((f) => f.path === path);
        state.selected = path;
        renderTable();
        if (!file) {
          codeView.innerHTML = '<div class="empty">No file selected.</div>';
          fileLabel.textContent = 'Select a file';
          fileMetrics.innerHTML = '';
          return;
        }

        fileLabel.textContent = file.path;
        fileMetrics.innerHTML = ['lines','statements','functions','branches'].map((key) => {
          const metric = file.metrics[key];
          const cls = pctClass(metric.pct);
          return \`<span class="badge \${cls}">\${key[0].toUpperCase() + key.slice(1)} \${formatPct(metric.pct)}</span>\`;
        }).join('');

        const html = file.lines.map((line) => {
          const branches = (line.b || []).map((b) => {
            const total = b.hits.length;
            const covered = b.hits.filter((v) => v > 0).length;
            return \`<span class="badge" style="background:rgba(255,255,255,0.06);">\${b.type} \${covered}/\${total}</span>\`;
          }).join(' ');
          return \`
            <div class="line \${line.s}">
              <div class="line-number">\${line.n}</div>
              <div class="text">\${escapeHtml(line.t || '')} \${branches}</div>
            </div>
          \`;
        }).join('');

        codeView.innerHTML = html || '<div class="empty">No source available.</div>';
      }

      tableHead.addEventListener('click', (event) => {
        const key = event.target.dataset.key;
        if (!key) return;
        if (state.sortKey === key) {
          state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortKey = key;
          state.sortDir = key === 'path' ? 'asc' : 'desc';
        }
        renderTable();
      });

      tableBody.addEventListener('click', (event) => {
        const row = event.target.closest('tr[data-path]');
        if (!row) return;
        renderFile(row.dataset.path);
      });

      filterInput.addEventListener('input', (event) => {
        state.filter = event.target.value.trim().toLowerCase();
        renderTable();
      });

      renderSummary();
      renderTable();
    })();

    function escapeHtml(str) {
      return (str || '').replace(/[&<>\"']/g, (ch) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[ch] || ch);
    }
  </script>
</body>
</html>
`;
}

function escapeHtml(str) {
  return (str || '').replace(
    /[&<>\"']/g,
    (ch) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        ch
      ] || ch,
  );
}
