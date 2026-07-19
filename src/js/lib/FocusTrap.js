import vsApp from './VirtualStyleApp.js'

export default class FocusTrap {
  #firstEl
  #lastEl

  constructor(firstEl, lastEl) {
    this.#firstEl = firstEl
    this.#lastEl = lastEl
    window.addEventListener('menu:opened', this)
  }

  handleEvent(e) {
    this[`${e.type.replaceAll(':', '')}Handler`](e)
  }

  menuopenedHandler() {
    this.enable()
  }

  menuclosedHandler() {
    this.disable()
  }

  keydownHandler(e) {
    // if (e.key === 'Escape') {
    //   console.log('Escape key pressed')
    //   this.disable()
    // }

    if (e.key === 'Tab' && !e.shiftKey) {
      if(e.currentTarget === this.#lastEl) {
        this.#firstEl.focus()
      }
    }

    else if (e.key === 'Tab' && e.shiftKey) {
      if(e.currentTarget === this.#firstEl) {
        this.#lastEl.focus()
      }
    }
  }

  enable() {
    document.addEventListener('keydown', this)
    window.addEventListener('menu:closed', this)
  }

  disable() {
    document.removeEventListener('keydown', this)
    window.removeEventListener('menu:closed', this)
  }
}
