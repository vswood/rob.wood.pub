import { SkeletonParser } from './skeleton-parser.js';

/**
 * Visual inspector interface that displays live code rendering, visual layout editing, and copy actions.
 */
export class SkeletonInspector {
  constructor() {
    this.active = false;
    this.highlightedEl = null;
    this.selectedEl = null;
    this.shimmer = true;
    this.defaultRows = 3;
    this.parser = new SkeletonParser();
    this.isPreviewing = false;
    
    this.theme = 'sk-dark';
    this.activeTool = 'rect';
    
    this.shapes = [];
    this.selectedShape = null;
    this.isDrawing = false;
    this.isDragging = false;
    this.isResizing = false;
    
    this._injectStyles();
    this._createFab();
    this._createPanel();
    this._bindEvents();
  }

  /**
   * Appends the inspector CSS file directly so it loads in the application context.
   * @private
   */
  _injectStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/skeleton-inspector.css';
    document.head.appendChild(link);
  }

  /**
   * Creates the Floating Action Button.
   * @private
   */
  _createFab() {
    const btn = document.createElement('button');
    btn.className = 'sk-inspector-btn';
    btn.setAttribute('aria-label', 'Toggle Skeleton Inspector');
    btn.title = 'Toggle Skeleton Inspector';
    btn.innerHTML = `
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.904-4.813L21 9l-4-4-7.187 10.904z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l4-4M3 3h.01M21 21h.01M3 21h.01M21 3h.01M12 3h.01M12 21h.01M3 12h.01M21 12h.01"></path>
      </svg>
    `;
    document.body.appendChild(btn);
    this.fab = btn;
  }

  /**
   * Creates the control and visual inspector side-panel.
   * @private
   */
  _createPanel() {
    const panel = document.createElement('div');
    panel.className = 'sk-inspector-panel';
    panel.innerHTML = `
      <div class="sk-panel-header">
        <h2>Skeleton Generator</h2>
        <button class="sk-panel-close" aria-label="Close panel">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="sk-panel-body">
        <div class="sk-config-group">
          <div class="sk-config-row">
            <span class="sk-config-label">Visual Theme Toggle</span>
            <button id="sk-theme-toggle-btn" style="padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.25); color: inherit; font-weight: 600; cursor: pointer;">Dark Theme</button>
          </div>
          <div class="sk-config-row">
            <span class="sk-config-label">Shimmer Animation</span>
            <label class="sk-switch">
              <input type="checkbox" id="sk-shimmer-toggle" checked>
              <span class="sk-slider"></span>
            </label>
          </div>
          <div class="sk-config-row">
            <span class="sk-config-label">Default Paragraph Rows</span>
            <input type="number" id="sk-rows-input" class="sk-input-number" min="1" max="10" value="3">
          </div>
        </div>

        <button class="sk-btn-designer" id="sk-designer-btn">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
          </svg>
          Activate Canvas Drawing Editor
        </button>

        <div class="sk-preview-box">
          <div class="sk-preview-label">Live Container Preview</div>
          <div class="sk-preview-toggle-container">
            <span class="sk-preview-toggle-label">Original</span>
            <label class="sk-switch">
              <input type="checkbox" id="sk-preview-toggle">
              <span class="sk-slider"></span>
            </label>
            <span class="sk-preview-toggle-label">Skeleton</span>
          </div>
        </div>

        <div class="sk-tabs">
          <button class="sk-tab active" data-tab="html">HTML Template</button>
          <button class="sk-tab" data-tab="js">JS Toggle</button>
          <button class="sk-tab" data-tab="css">CSS Help</button>
        </div>

        <div class="sk-tab-content active" id="sk-tab-html">
          <div class="sk-code-container">
            <button class="sk-copy-btn" data-copy="html">Copy</button>
            <pre class="sk-code-block"><code id="sk-code-html"></code></pre>
          </div>
        </div>

        <div class="sk-tab-content" id="sk-tab-js">
          <div class="sk-code-container">
            <button class="sk-copy-btn" data-copy="js">Copy</button>
            <pre class="sk-code-block"><code id="sk-code-js"></code></pre>
          </div>
        </div>

        <div class="sk-tab-content" id="sk-tab-css">
          <div class="sk-code-container">
            <button class="sk-copy-btn" data-copy="css">Copy</button>
            <pre class="sk-code-block"><code id="sk-code-css"></code></pre>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(panel);
    this.panel = panel;
  }

  /**
   * Binds event listeners to components.
   * @private
   */
  _bindEvents() {
    this.fab.addEventListener('click', () => this.toggleActive());
    
    this.panel.querySelector('.sk-panel-close').addEventListener('click', () => this.closePanel());

    document.addEventListener('mouseover', (e) => this._onMouseOver(e));
    document.addEventListener('mouseout', (e) => this._onMouseOut(e));
    document.addEventListener('click', (e) => this._onClick(e), true);

    const themeToggleBtn = this.panel.querySelector('#sk-theme-toggle-btn');
    themeToggleBtn.addEventListener('click', () => {
      if (this.theme === 'sk-dark') {
        this.theme = 'sk-light';
        themeToggleBtn.textContent = 'Light Theme';
        themeToggleBtn.style.background = 'rgba(255, 255, 255, 0.6)';
        themeToggleBtn.style.color = '#0f172a';
        themeToggleBtn.style.borderColor = 'rgba(0, 0, 0, 0.15)';
        this.panel.classList.add('sk-light-theme');
      } else {
        this.theme = 'sk-dark';
        themeToggleBtn.textContent = 'Dark Theme';
        themeToggleBtn.style.background = '';
        themeToggleBtn.style.color = '';
        themeToggleBtn.style.borderColor = '';
        this.panel.classList.remove('sk-light-theme');
      }
      this._updateGeneratedOutput();
    });

    const shimmerToggle = this.panel.querySelector('#sk-shimmer-toggle');
    shimmerToggle.addEventListener('change', (e) => {
      this.shimmer = e.target.checked;
      this.parser.options.shimmer = this.shimmer;
      this._updateGeneratedOutput();
    });

    const rowsInput = this.panel.querySelector('#sk-rows-input');
    rowsInput.addEventListener('change', (e) => {
      this.defaultRows = parseInt(e.target.value, 10) || 3;
      this.parser.options.defaultRows = this.defaultRows;
      this._updateGeneratedOutput();
    });

    const previewToggle = this.panel.querySelector('#sk-preview-toggle');
    previewToggle.addEventListener('change', (e) => {
      this._toggleLivePreview(e.target.checked);
    });

    const designerBtn = this.panel.querySelector('#sk-designer-btn');
    designerBtn.addEventListener('click', () => {
      this._activateDesignerMode();
    });

    const tabs = this.panel.querySelectorAll('.sk-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const contents = this.panel.querySelectorAll('.sk-tab-content');
        contents.forEach(c => c.classList.remove('active'));
        
        const activeContent = this.panel.querySelector(`#sk-tab-${tab.dataset.tab}`);
        if (activeContent) {
          activeContent.classList.add('active');
        }
      });
    });

    const copyBtns = this.panel.querySelectorAll('.sk-copy-btn');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.copy;
        let text = '';
        if (type === 'html') {
          text = this.panel.querySelector('#sk-code-html').textContent;
        } else if (type === 'js') {
          text = this.panel.querySelector('#sk-code-js').textContent;
        } else if (type === 'css') {
          text = this.panel.querySelector('#sk-code-css').textContent;
        }
        
        navigator.clipboard.writeText(text).then(() => {
          const originalText = btn.textContent;
          btn.textContent = 'Copied!';
          btn.style.background = 'rgba(99, 102, 241, 0.4)';
          btn.style.color = '#fff';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.color = '';
          }, 2000);
        });
      });
    });

    document.addEventListener('keydown', (e) => {
      if (this.canvasActive && (e.key === 'Delete' || e.key === 'Backspace')) {
        this._deleteSelectedShape();
      }
    });
  }

  /**
   * Toggles the overall inspector mode activation.
   */
  toggleActive() {
    this.active = !this.active;
    if (this.active) {
      this.fab.classList.add('active');
      this.fab.style.background = 'rgba(99, 102, 241, 0.9)';
    } else {
      this.fab.classList.remove('active');
      this.fab.style.background = '';
      this._clearHighlight();
      this.closePanel();
    }
  }

  /**
   * Closes the side panel.
   */
  closePanel() {
    this.panel.classList.remove('open');
    if (this.selectedEl && this.isPreviewing) {
      this._toggleLivePreview(false);
      const previewToggle = this.panel.querySelector('#sk-preview-toggle');
      previewToggle.checked = false;
    }
    if (this.canvasActive) {
      if (this.canvasEl) {
        this.canvasEl.remove();
      }
      if (this.toolbarEl) {
        this.toolbarEl.remove();
      }
      this.canvasActive = false;
      this.shapes = [];
      this.selectedShape = null;
      if (this.selectedEl && this.selectedEl.dataset.restoreStaticPosition === 'true') {
        this.selectedEl.style.position = '';
        delete this.selectedEl.dataset.restoreStaticPosition;
      }
    }
    this.selectedEl = null;
  }

  /**
   * Processes element hovering when in active inspector mode.
   * @param {MouseEvent} e
   * @private
   */
  _onMouseOver(e) {
    if (!this.active || this.panel.classList.contains('open') || this.canvasActive) return;

    const target = e.target.closest('[data-skeleton-container]');
    if (!target) {
      this._clearHighlight();
      return;
    }

    if (this.highlightedEl !== target) {
      this._clearHighlight();
      this.highlightedEl = target;
      this.highlightedEl.classList.add('sk-target-highlight');
    }
  }

  /**
   * Removes highlight classes from elements.
   * @param {MouseEvent} e
   * @private
   */
  _onMouseOut(e) {
    if (!this.active || !this.highlightedEl || this.canvasActive) return;

    const target = e.target.closest('[data-skeleton-container]');
    if (!target || target !== this.highlightedEl) {
      this._clearHighlight();
    }
  }

  /**
   * Handles visual selection clicks.
   * @param {MouseEvent} e
   * @private
   */
  _onClick(e) {
    if (!this.active || this.canvasActive) return;

    const target = e.target.closest('[data-skeleton-container]');
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    this._clearHighlight();
    this.selectedEl = target;
    
    const previewToggle = this.panel.querySelector('#sk-preview-toggle');
    previewToggle.checked = false;
    this.isPreviewing = false;

    this._updateGeneratedOutput();
    this.panel.classList.add('open');
  }

  /**
   * Clears the current highlighted target.
   * @private
   */
  _clearHighlight() {
    if (this.highlightedEl) {
      this.highlightedEl.classList.remove('sk-target-highlight');
      this.highlightedEl = null;
    }
  }

  /**
   * Recalculates and redraws the output files in the sidebar.
   * @private
   */
  _updateGeneratedOutput() {
    if (!this.selectedEl) return;

    if (this.customSkeletonHtml) {
      this.panel.querySelector('#sk-code-html').textContent = this.customSkeletonHtml;
      
      const id = this.selectedEl.id ? `#${this.selectedEl.id}` : `.${this.selectedEl.className.split(' ')[0]}`;
      const selector = id && id !== '.' ? id : '[data-skeleton-container]';
      const toggleScript = this.parser.generateToggleScript(selector, this.customSkeletonHtml);
      this.panel.querySelector('#sk-code-js').textContent = toggleScript;
      return;
    }

    const template = this.parser.generateTemplate(this.selectedEl, this.theme);
    this.panel.querySelector('#sk-code-html').textContent = template;

    const id = this.selectedEl.id ? `#${this.selectedEl.id}` : `.${this.selectedEl.className.split(' ')[0]}`;
    const selector = id && id !== '.' ? id : '[data-skeleton-container]';
    
    const toggleScript = this.parser.generateToggleScript(selector, template);
    this.panel.querySelector('#sk-code-js').textContent = toggleScript;

    const cssHelp = `/* Include skeleton.css inside your styles block */
/* Standard layout styling override if required */
${selector} .sk-container {
  display: ${window.getComputedStyle(this.selectedEl).display};
  width: 100%;
}

/* Optional styling to ensure custom shimmer speeds or colors */
.sk-custom-shimmer::after {
  animation-duration: 1s;
}`;
    this.panel.querySelector('#sk-code-css').textContent = cssHelp;

    if (this.isPreviewing) {
      this._toggleLivePreview(true);
    }
  }

  /**
   * Handles swapping the real element with the parsed skeleton rendering.
   * @param {boolean} show
   * @private
   */
  _toggleLivePreview(show) {
    if (!this.selectedEl) return;
    this.isPreviewing = show;

    if (show) {
      if (this.selectedEl.dataset.originalHtml !== undefined) {
        const html = this.customSkeletonHtml || this.parser.generateTemplate(this.selectedEl, this.theme);
        this.selectedEl.innerHTML = html;
        return;
      }
      this.selectedEl.dataset.originalHtml = this.selectedEl.innerHTML;
      const html = this.customSkeletonHtml || this.parser.generateTemplate(this.selectedEl, this.theme);
      this.selectedEl.innerHTML = html;
    } else {
      if (this.selectedEl.dataset.originalHtml === undefined) return;
      this.selectedEl.innerHTML = this.selectedEl.dataset.originalHtml;
      delete this.selectedEl.dataset.originalHtml;
    }
  }

  /**
   * Initializes the Visual Canvas Editor layout over the container.
   * @private
   */
  _activateDesignerMode() {
    if (!this.selectedEl) return;
    
    this.panel.classList.remove('open');
    this.canvasActive = true;
    this.shapes = [];
    this.selectedShape = null;

    const computed = window.getComputedStyle(this.selectedEl);
    if (computed.position === 'static') {
      this.selectedEl.style.position = 'relative';
      this.selectedEl.dataset.restoreStaticPosition = 'true';
    }

    const canvas = document.createElement('div');
    canvas.className = 'sk-designer-canvas';
    this.selectedEl.appendChild(canvas);
    this.canvasEl = canvas;

    const toolbar = document.createElement('div');
    toolbar.className = 'sk-designer-toolbar';
    toolbar.innerHTML = `
      <button class="sk-toolbar-btn active" id="sk-btn-rect">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2"></rect>
        </svg>
        Rectangle
      </button>
      <button class="sk-toolbar-btn" id="sk-btn-circle">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9"></circle>
        </svg>
        Circle
      </button>
      <span class="sk-toolbar-divider"></span>
      <button class="sk-toolbar-btn danger" id="sk-btn-del-shape">Delete Selection</button>
      <button class="sk-toolbar-btn danger" id="sk-btn-clear-canvas">Clear All</button>
      <span class="sk-toolbar-divider"></span>
      <button class="sk-toolbar-btn success" id="sk-btn-compile-canvas">Compile & Done</button>
    `;
    document.body.appendChild(toolbar);
    this.toolbarEl = toolbar;

    this._bindCanvasEvents();
  }

  /**
   * Binds absolute mouse events to the drawing canvas grid.
   * @private
   */
  _bindCanvasEvents() {
    const rectBtn = this.toolbarEl.querySelector('#sk-btn-rect');
    const circleBtn = this.toolbarEl.querySelector('#sk-btn-circle');
    
    rectBtn.addEventListener('click', () => {
      this.activeTool = 'rect';
      rectBtn.classList.add('active');
      circleBtn.classList.remove('active');
    });

    circleBtn.addEventListener('click', () => {
      this.activeTool = 'circle';
      circleBtn.classList.add('active');
      rectBtn.classList.remove('active');
    });

    this.toolbarEl.querySelector('#sk-btn-del-shape').addEventListener('click', () => {
      this._deleteSelectedShape();
    });

    this.toolbarEl.querySelector('#sk-btn-clear-canvas').addEventListener('click', () => {
      this.shapes.forEach(shape => shape.el.remove());
      this.shapes = [];
      this.selectedShape = null;
    });

    this.toolbarEl.querySelector('#sk-btn-compile-canvas').addEventListener('click', () => {
      this._compileCanvasLayout();
    });

    this.canvasEl.addEventListener('mousedown', (e) => this._onCanvasMouseDown(e));
    this.canvasEl.addEventListener('mousemove', (e) => this._onCanvasMouseMove(e));
    window.addEventListener('mouseup', () => this._onCanvasMouseUp());
  }

  /**
   * Tracks click positioning to draw or select elements.
   * @param {MouseEvent} e
   * @private
   */
  _onCanvasMouseDown(e) {
    const canvasRect = this.canvasEl.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    const handle = e.target.closest('.sk-canvas-handle');
    if (handle) {
      this.isResizing = true;
      this.selectedShape = this.shapes.find(s => s.el === handle.parentElement);
      this._selectShape(this.selectedShape);
      return;
    }

    const clickedShapeEl = e.target.closest('.sk-canvas-shape');
    if (clickedShapeEl) {
      this.isDragging = true;
      this.selectedShape = this.shapes.find(s => s.el === clickedShapeEl);
      this._selectShape(this.selectedShape);
      
      const shapeRect = clickedShapeEl.getBoundingClientRect();
      this.dragOffset = {
        x: e.clientX - shapeRect.left,
        y: e.clientY - shapeRect.top
      };
      return;
    }

    this._selectShape(null);

    this.isDrawing = true;
    this.drawStart = { x, y };

    const drawingEl = document.createElement('div');
    drawingEl.className = 'sk-canvas-shape';
    if (this.activeTool === 'circle') {
      drawingEl.classList.add('sk-circle');
    }
    drawingEl.style.left = `${x}px`;
    drawingEl.style.top = `${y}px`;
    drawingEl.style.width = '0px';
    drawingEl.style.height = '0px';
    this.canvasEl.appendChild(drawingEl);

    this.tempDrawingEl = drawingEl;
  }

  /**
   * Handles shape dragging, resizing, or drawing rendering.
   * @param {MouseEvent} e
   * @private
   */
  _onCanvasMouseMove(e) {
    const canvasRect = this.canvasEl.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - canvasRect.left, canvasRect.width));
    const y = Math.max(0, Math.min(e.clientY - canvasRect.top, canvasRect.height));

    if (this.isDrawing && this.tempDrawingEl) {
      const left = Math.min(this.drawStart.x, x);
      const top = Math.min(this.drawStart.y, y);
      const width = Math.abs(this.drawStart.x - x);
      const height = Math.abs(this.drawStart.y - y);

      this.tempDrawingEl.style.left = `${left}px`;
      this.tempDrawingEl.style.top = `${top}px`;
      this.tempDrawingEl.style.width = `${width}px`;
      this.tempDrawingEl.style.height = `${height}px`;
    } else if (this.isDragging && this.selectedShape) {
      const left = Math.max(0, Math.min(x - this.dragOffset.x, canvasRect.width - parseFloat(this.selectedShape.el.style.width)));
      const top = Math.max(0, Math.min(y - this.dragOffset.y, canvasRect.height - parseFloat(this.selectedShape.el.style.height)));

      this.selectedShape.el.style.left = `${left}px`;
      this.selectedShape.el.style.top = `${top}px`;
    } else if (this.isResizing && this.selectedShape) {
      const shapeLeft = parseFloat(this.selectedShape.el.style.left);
      const shapeTop = parseFloat(this.selectedShape.el.style.top);
      const width = Math.max(10, x - shapeLeft);
      const height = Math.max(10, y - shapeTop);

      this.selectedShape.el.style.width = `${width}px`;
      this.selectedShape.el.style.height = `${height}px`;
    }
  }

  /**
   * Finalizes actions and creates static bounding blocks.
   * @private
   */
  _onCanvasMouseUp() {
    if (this.isDrawing && this.tempDrawingEl) {
      const width = parseFloat(this.tempDrawingEl.style.width);
      const height = parseFloat(this.tempDrawingEl.style.height);

      if (width < 6 || height < 6) {
        this.tempDrawingEl.remove();
      } else {
        const newShape = {
          el: this.tempDrawingEl,
          type: this.activeTool
        };
        
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'sk-canvas-handle';
        newShape.el.appendChild(resizeHandle);
        
        this.shapes.push(newShape);
        this._selectShape(newShape);
      }
      this.tempDrawingEl = null;
      this.isDrawing = false;
    }
    
    this.isDragging = false;
    this.isResizing = false;
  }

  /**
   * Marks a canvas element as active.
   * @param {Object|null} shape
   * @private
   */
  _selectShape(shape) {
    this.shapes.forEach(s => s.el.classList.remove('selected'));
    this.selectedShape = shape;
    if (this.selectedShape) {
      this.selectedShape.el.classList.add('selected');
    }
  }

  /**
   * Deletes the currently selected shape.
   * @private
   */
  _deleteSelectedShape() {
    if (!this.selectedShape) return;
    this.selectedShape.el.remove();
    this.shapes = this.shapes.filter(s => s !== this.selectedShape);
    this.selectedShape = null;
  }

  /**
   * Processes the drawn dimensions and compiles an absolute responsive HTML skeleton output.
   * @private
   */
  _compileCanvasLayout() {
    if (this.shapes.length === 0) {
      this.canvasEl.remove();
      this.toolbarEl.remove();
      this.canvasActive = false;
      this.customSkeletonHtml = null;
      
      if (this.selectedEl && this.selectedEl.dataset.restoreStaticPosition === 'true') {
        this.selectedEl.style.position = '';
        delete this.selectedEl.dataset.restoreStaticPosition;
      }
      
      this._updateGeneratedOutput();
      this.panel.classList.add('open');
      return;
    }

    const containerRect = this.canvasEl.getBoundingClientRect();
    const shimmerClass = this.shimmer ? ' sk-shimmer' : '';
    const themeClass = this.theme ? ` ${this.theme}` : '';

    const lines = [];
    lines.push(`<div class="sk-container${shimmerClass}${themeClass}" style="position: relative; width: 100%; aspect-ratio: ${(containerRect.width / containerRect.height).toFixed(3)}; min-height: ${containerRect.height.toFixed(0)}px;">`);

    this.shapes.forEach(shape => {
      const left = parseFloat(shape.el.style.left);
      const top = parseFloat(shape.el.style.top);
      const width = parseFloat(shape.el.style.width);
      const height = parseFloat(shape.el.style.height);

      const leftPercent = ((left / containerRect.width) * 100).toFixed(1);
      const topPercent = ((top / containerRect.height) * 100).toFixed(1);
      const widthPercent = ((width / containerRect.width) * 100).toFixed(1);
      const heightPercent = ((height / containerRect.height) * 100).toFixed(1);

      if (shape.type === 'circle') {
        const diameterPercent = Math.min(widthPercent, heightPercent);
        lines.push(`  <div class="sk-block sk-circle${shimmerClass}" style="position: absolute; left: ${leftPercent}%; top: ${topPercent}%; width: ${diameterPercent}%; aspect-ratio: 1;"></div>`);
      } else {
        lines.push(`  <div class="sk-rect${shimmerClass}" style="position: absolute; left: ${leftPercent}%; top: ${topPercent}%; width: ${widthPercent}%; height: ${heightPercent}%; border-radius: 6px;"></div>`);
      }
    });

    lines.push('</div>');

    this.customSkeletonHtml = lines.join('\n');

    this.canvasEl.remove();
    this.toolbarEl.remove();
    this.canvasActive = false;

    if (this.selectedEl && this.selectedEl.dataset.restoreStaticPosition === 'true') {
      this.selectedEl.style.position = '';
      delete this.selectedEl.dataset.restoreStaticPosition;
    }

    this._updateGeneratedOutput();
    this.panel.classList.add('open');
  }
}
