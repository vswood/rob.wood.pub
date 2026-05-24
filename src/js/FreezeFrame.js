export default class FreezeFrame {
  #isFrozen = false
  #originalScrollY = 0
  #originalScrollX = 0
  #keys
  #cloneId

  constructor({activeKeys =[
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'PageUp',
    'PageDown',
    'Home',
    'End',
  ], cloneId = 'viewport-overlay-clone'} = {}) {
    this.#keys = activeKeys
    this.#cloneId = cloneId
  }

  toggleViewportFreeze() {
    if (this.#isFrozen) {
      unfreezeViewport()
    } else {
      freezeViewport()
    }
  }

  handleEvent(e) {
    this[`${e.type}Handler`](e)
  }

  wheelHandler(e) {
    e.preventDefault()
  }

  touchmoveHandler(e) {
    e.preventDefault()
  }

  keydownHandler(e) {
    if (this.#keys[e.key]) {
      preventDefault(e)
    }
  }

  #disableScrollMethods() {
    window.addEventListener('wheel', this, { passive: false })
    window.addEventListener('touchmove', this, { passive: false })
    window.addEventListener('keydown', this)
  }

  #enableScrollMethods() {
      window.removeEventListener('wheel', this)
      window.removeEventListener('touchmove', this)
      window.removeEventListener('keydown', this)
  }

  #freezeViewport() {
    if (this.#isFrozen) return

    this.#originalScrollX = window.pageXOffset || document.documentElement.scrollLeft
    this.#originalScrollY = window.pageYOffset || document.documentElement.scrollTop

    const clone = document.documentElement.cloneNode(true)
    clone.id = this.#cloneId

    clone.removeAttribute('id')
    const scripts = clone.querySelectorAll('script, iframe, object, embed')
    scripts.forEach(script => script.remove())

    Object.assign(clone.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '999999',
        overflow: 'hidden',
        pointerEvents: 'none',
    })

    document.body.appendChild(clone)
    document.documentElement.style.overflow = 'hidden'

    this.#disableScrollMethods()
    this.#isFrozen = true
  }

  #unfreezeViewport() {
    if (!this.#isFrozen) return

    const existingClone = document.body.getElementById(this.#cloneId)
    if (existingClone) {
        existingClone.remove()
    }
    document.documentElement.style.overflow = ''

    this.#enableScrollMethods()

    window.scrollTo(this.#originalScrollX, this.#originalScrollY)
    this.#isFrozen = false;
    this.#originalScrollX = 0
    this.#originalScrollY = 0
  }
}
