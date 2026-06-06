/**
 * Options for the skeleton parser.
 * @typedef {Object} ParserOptions
 * @property {boolean} shimmer - Whether to apply the shimmer animation.
 * @property {number} defaultRows - Default rows to generate for text block containers.
 * @property {string} ignoreAttribute - The attribute used to ignore elements.
 * @property {string} typeAttribute - The attribute used to force a skeleton type.
 */

/**
 * Parses a target DOM container and generates an aligned, responsive skeleton loader.
 */
export class SkeletonParser {
  /**
   * @param {ParserOptions} [options]
   */
  constructor(options = {}) {
    this.options = {
      shimmer: true,
      defaultRows: 3,
      ignoreAttribute: 'data-skeleton-ignore',
      typeAttribute: 'data-skeleton-type',
      ...options
    };
  }

  /**
   * Generates a structural and placeholder HTML template from a container element.
   * @param {HTMLElement} container
   * @param {string} [theme=''] - Force a theme ('sk-light' or 'sk-dark').
   * @returns {string} The generated HTML template literal.
   */
  generateTemplate(container, theme = '') {
    if (!container) {
      return '';
    }

    const structure = this._parseNode(container, true);
    const shimmerClass = this.options.shimmer ? ' sk-shimmer' : '';
    const themeClass = theme ? ` ${theme}` : '';
    
    return `<div class="sk-container${shimmerClass}${themeClass}" style="${structure.styles}">
  ${structure.children}
</div>`;
  }

  /**
   * Generates the toggle script code.
   * @param {string} containerSelector
   * @param {string} templateLiteral
   * @returns {string} The complete toggle script code.
   */
  generateToggleScript(containerSelector, templateLiteral) {
    return `/**
 * Toggles the skeleton loader for the target container.
 * @param {HTMLElement|string} target - The container element or selector.
 * @param {boolean} show - True to display skeleton, false to restore original content.
 * @param {string} [theme=''] - Optional force theme ('sk-light' or 'sk-dark').
 */
export function toggleSkeleton(target, show, theme = '') {
  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (!container) return;

  if (show) {
    if (container.dataset.originalHtml !== undefined) return;
    container.dataset.originalHtml = container.innerHTML;
    
    let html = \`${templateLiteral}\`;
    if (theme) {
      html = html.replace('class="sk-container', \`class="sk-container \${theme}\`);
    }
    
    container.innerHTML = html;
  } else {
    if (container.dataset.originalHtml === undefined) return;
    container.innerHTML = container.dataset.originalHtml;
    delete container.dataset.originalHtml;
  }
}`;
  }

  /**
   * Analyzes an individual DOM node and returns its skeleton mapping.
   * @param {Element} node
   * @param {boolean} isRoot
   * @returns {{children: string, styles: string}}
   * @private
   */
  _parseNode(node, isRoot = false) {
    if (node.hasAttribute && node.hasAttribute(this.options.ignoreAttribute)) {
      return { children: '', styles: '' };
    }

    const computed = window.getComputedStyle(node);
    if (computed.display === 'none' || computed.visibility === 'hidden') {
      return { children: '', styles: '' };
    }

    const rect = node.getBoundingClientRect();
    if (!isRoot && (rect.width === 0 || rect.height === 0)) {
      return { children: '', styles: '' };
    }

    const styles = this._extractLayoutStyles(computed, node, isRoot);
    const customType = node.getAttribute ? node.getAttribute(this.options.typeAttribute) : null;

    if (customType) {
      return this._generateCustomPlaceholder(customType, node, styles);
    }

    const tagName = node.tagName.toLowerCase();
    
    if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
      return this._generateInputPlaceholder(node, computed, styles);
    }

    if (tagName === 'label') {
      return {
        children: this._generateTextLines(node, computed, 40),
        styles: ''
      };
    }

    if (tagName === 'li') {
      return this._generateListItemPlaceholder(node, computed, styles);
    }

    const hasDirectText = this._hasVisibleText(node);
    const childElements = Array.from(node.children);

    if (childElements.length === 0 || this._isMediaElement(node)) {
      return this._generateLeafPlaceholder(node, computed, styles);
    }

    if (hasDirectText && childElements.length > 0) {
      const childrenHtml = childElements
        .map(child => this._parseNode(child).children)
        .filter(Boolean)
        .join('\n  ');
      
      const textPlaceholder = this._generateTextLines(node, computed);
      return {
        children: `${textPlaceholder}\n  ${childrenHtml}`,
        styles
      };
    }

    const childrenHtml = childElements
      .map(child => this._parseNode(child).children)
      .filter(Boolean)
      .join('\n  ');

    if (!childrenHtml) {
      return this._generateLeafPlaceholder(node, computed, styles);
    }

    const cleanTag = ['ul', 'ol', 'div', 'section', 'article', 'nav', 'footer', 'header', 'main'].includes(tagName)
      ? tagName
      : 'div';

    return {
      children: `<${cleanTag} style="${styles}">\n  ${childrenHtml}\n</${cleanTag}>`,
      styles
    };
  }

  /**
   * Extracts essential positioning and grid/flex layout parameters.
   * @param {CSSStyleDeclaration} computed
   * @param {Element} node
   * @param {boolean} isRoot
   * @returns {string}
   * @private
   */
  _extractLayoutStyles(computed, node, isRoot) {
    const properties = [];

    if (isRoot) {
      properties.push(`position: relative`);
      properties.push(`width: 100%`);
      if (computed.display === 'grid' || computed.display === 'flex') {
        properties.push(`display: ${computed.display}`);
        properties.push(`gap: ${computed.gap}`);
        if (computed.display === 'flex') {
          properties.push(`flex-direction: ${computed.flexDirection}`);
          properties.push(`justify-content: ${computed.justifyContent}`);
          properties.push(`align-items: ${computed.alignItems}`);
        } else if (computed.display === 'grid') {
          properties.push(`grid-template-columns: ${computed.gridTemplateColumns}`);
          properties.push(`grid-template-rows: ${computed.gridTemplateRows}`);
        }
      }
      return properties.join('; ');
    }

    const display = computed.display;
    if (display === 'flex' || display === 'grid') {
      properties.push(`display: ${display}`);
      properties.push(`gap: ${computed.gap}`);
      if (display === 'flex') {
        properties.push(`flex-direction: ${computed.flexDirection}`);
        properties.push(`justify-content: ${computed.justifyContent}`);
        properties.push(`align-items: ${computed.alignItems}`);
      } else if (display === 'grid') {
        properties.push(`grid-template-columns: ${computed.gridTemplateColumns}`);
        properties.push(`grid-template-rows: ${computed.gridTemplateRows}`);
      }
    }

    if (computed.flex !== '0 1 auto' && computed.flex !== 'none') {
      properties.push(`flex: ${computed.flex}`);
    }

    const rect = node.getBoundingClientRect();
    const parentRect = node.parentElement ? node.parentElement.getBoundingClientRect() : rect;
    
    if (computed.width.includes('%') || computed.width === 'auto') {
      const percentageWidth = parentRect.width > 0 ? ((rect.width / parentRect.width) * 100).toFixed(1) : 100;
      properties.push(`width: ${percentageWidth}%`);
    } else {
      properties.push(`width: ${computed.width}`);
    }

    if (computed.height !== 'auto' && computed.height !== '0px') {
      properties.push(`height: ${computed.height}`);
    }

    if (computed.aspectRatio && computed.aspectRatio !== 'auto') {
      properties.push(`aspect-ratio: ${computed.aspectRatio}`);
    }

    if (computed.margin !== '0px') {
      properties.push(`margin: ${computed.margin}`);
    }

    if (computed.padding !== '0px') {
      properties.push(`padding: ${computed.padding}`);
    }

    if (computed.borderRadius !== '0px') {
      properties.push(`border-radius: ${computed.borderRadius}`);
    }

    return properties.join('; ');
  }

  /**
   * Determines if a node is a media element that should be represented as a rect or circle.
   * @param {Element} node
   * @returns {boolean}
   * @private
   */
  _isMediaElement(node) {
    const tagName = node.tagName.toLowerCase();
    return ['img', 'svg', 'picture', 'video', 'canvas', 'iframe'].includes(tagName);
  }

  /**
   * Verifies if the element contains non-empty text content.
   * @param {Element} node
   * @returns {boolean}
   * @private
   */
  _hasVisibleText(node) {
    const text = node.textContent ? node.textContent.trim() : '';
    if (!text) return false;

    const childElements = Array.from(node.childNodes);
    return childElements.some(child => child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0);
  }

  /**
   * Generates input, textarea, and select fields skeletons.
   * @param {Element} node
   * @param {CSSStyleDeclaration} computed
   * @param {string} styles
   * @returns {{children: string, styles: string}}
   * @private
   */
  _generateInputPlaceholder(node, computed, styles) {
    const shimmerClass = this.options.shimmer ? ' sk-shimmer' : '';
    const tagName = node.tagName.toLowerCase();
    const type = node.getAttribute('type') || 'text';
    
    if (type === 'checkbox' || type === 'radio') {
      const isRadio = type === 'radio';
      const roundStyle = isRadio ? '; border-radius: 50%' : '';
      return {
        children: `<div class="sk-block${shimmerClass}" style="width: 16px; height: 16px${roundStyle}"></div>`,
        styles: ''
      };
    }

    let height = '36px';
    if (tagName === 'textarea') {
      height = '80px';
    }

    return {
      children: `<div class="sk-block${shimmerClass}" style="${styles}; height: ${height}; border-radius: 6px;"></div>`,
      styles: ''
    };
  }

  /**
   * Generates custom presets for list items (e.g. icon bullet + text layout).
   * @param {Element} node
   * @param {CSSStyleDeclaration} computed
   * @param {string} styles
   * @returns {{children: string, styles: string}}
   * @private
   */
  _generateListItemPlaceholder(node, computed, styles) {
    const shimmerClass = this.options.shimmer ? ' sk-shimmer' : '';
    const childElements = Array.from(node.children);

    if (childElements.length === 0) {
      return {
        children: `<div style="display: flex; align-items: center; gap: 8px; width: 100%; margin-top: 4px; margin-bottom: 4px;">
  <div class="sk-block sk-circle${shimmerClass}" style="width: 8px; height: 8px; flex-shrink: 0;"></div>
  <div class="sk-text${shimmerClass}" style="width: ${Math.floor(Math.random() * 20) + 70}%; margin: 0;"></div>
</div>`,
        styles: ''
      };
    }

    const childrenHtml = childElements
      .map(child => this._parseNode(child).children)
      .filter(Boolean)
      .join('\n  ');

    return {
      children: `<li style="${styles}">\n  ${childrenHtml}\n</li>`,
      styles: ''
    };
  }

  /**
   * Generates a custom placeholder based on visual markers.
   * @param {string} type
   * @param {Element} node
   * @param {string} styles
   * @returns {{children: string, styles: string}}
   * @private
   */
  _generateCustomPlaceholder(type, node, styles) {
    const shimmerClass = this.options.shimmer ? ' sk-shimmer' : '';
    if (type === 'circle') {
      return {
        children: `<div class="sk-block sk-circle${shimmerClass}" style="${styles}"></div>`,
        styles: ''
      };
    }
    if (type === 'rect') {
      return {
        children: `<div class="sk-rect${shimmerClass}" style="${styles}"></div>`,
        styles: ''
      };
    }
    if (type === 'text') {
      const computed = window.getComputedStyle(node);
      return {
        children: this._generateTextLines(node, computed),
        styles: ''
      };
    }
    return {
      children: `<div class="sk-block${shimmerClass}" style="${styles}"></div>`,
      styles: ''
    };
  }

  /**
   * Generates placeholder components for leaf nodes.
   * @param {Element} node
   * @param {CSSStyleDeclaration} computed
   * @param {string} styles
   * @returns {{children: string, styles: string}}
   * @private
   */
  _generateLeafPlaceholder(node, computed, styles) {
    const tagName = node.tagName.toLowerCase();
    const isCircular = computed.borderRadius.includes('50%') || 
                      (computed.width === computed.height && parseFloat(computed.borderRadius) > 100);
    const shimmerClass = this.options.shimmer ? ' sk-shimmer' : '';

    if (isCircular) {
      return {
        children: `<div class="sk-block sk-circle${shimmerClass}" style="${styles}"></div>`,
        styles: ''
      };
    }

    if (this._isMediaElement(node)) {
      return {
        children: `<div class="sk-rect${shimmerClass}" style="${styles}"></div>`,
        styles: ''
      };
    }

    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button'].includes(tagName) || this._hasVisibleText(node)) {
      return {
        children: this._generateTextLines(node, computed),
        styles: ''
      };
    }

    return {
      children: `<div class="sk-block${shimmerClass}" style="${styles}"></div>`,
      styles: ''
    };
  }

  /**
   * Generates multiple text lines representing text layouts.
   * @param {Element} node
   * @param {CSSStyleDeclaration} computed
   * @param {number} [forceWidth=0] - If set, forces the generated width percentage.
   * @returns {string}
   * @private
   */
  _generateTextLines(node, computed, forceWidth = 0) {
    const tagName = node.tagName.toLowerCase();
    const fontSize = computed.fontSize;
    const shimmerClass = this.options.shimmer ? ' sk-shimmer' : '';
    
    let isHeading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName);
    let headingClass = isHeading ? ' sk-heading' : '';
    let rowCount = 1;

    let heightStyle = '';
    if (isHeading) {
      let emVal = '1.4em';
      if (tagName === 'h1') emVal = '2.2em';
      else if (tagName === 'h2') emVal = '1.8em';
      else if (tagName === 'h3') emVal = '1.5em';
      else if (tagName === 'h4') emVal = '1.3em';
      else if (tagName === 'h5') emVal = '1.1em';
      
      heightStyle = `height: ${emVal};`;
    }

    if (tagName === 'p' || (node.textContent && node.textContent.length > 120)) {
      const explicitRows = node.getAttribute ? node.getAttribute('data-skeleton-rows') : null;
      rowCount = explicitRows ? parseInt(explicitRows, 10) : this.options.defaultRows;
    }

    const lines = [];
    for (let i = 0; i < rowCount; i++) {
      let width = '100%';
      if (forceWidth > 0) {
        width = `${forceWidth}%`;
      } else if (rowCount > 1) {
        if (i === rowCount - 1) {
          width = `${Math.floor(Math.random() * 25) + 55}%`;
        } else {
          width = `${Math.floor(Math.random() * 10) + 90}%`;
        }
      } else {
        if (tagName === 'span' || tagName === 'a') {
          const textLength = node.textContent ? node.textContent.trim().length : 10;
          width = `${Math.min(100, Math.max(20, textLength * 1.2))}%`;
        } else if (isHeading) {
          width = `${Math.floor(Math.random() * 15) + 70}%`;
        }
      }

      const style = `width: ${width}; font-size: ${fontSize}; ${heightStyle} margin-top: 4px; margin-bottom: 4px;`;
      lines.push(`<div class="sk-text${headingClass}${shimmerClass}" style="${style}"></div>`);
    }

    return lines.join('\n');
  }
}
