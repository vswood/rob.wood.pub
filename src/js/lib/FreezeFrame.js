export default class FreezeFrame {
  #target
  #clone
  #isFrozen = false
  #originalScrollY = 0
  #keys
  #cloneId
  #extraClass

  constructor({
    target = 'body',
    activeKeys =[
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'PageUp',
      'PageDown',
      'Home',
      'End',
    ],
    cloneId = 'viewport-overlay-clone',
    extraClass,
  } = {}) {
    this.#target = target
    this.#keys = activeKeys
    this.#cloneId = cloneId
    this.#extraClass = extraClass
  }

  toggleViewportFreeze() {
    if (this.#isFrozen) {
      this.unfreezeViewport()
    } else {
      this.freezeViewport()
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
      e.preventDefault()
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

  freezeViewport() {
    if (this.#isFrozen) return

    this.#originalScrollY = this.#target.scrollTop

    this.#clone = this.#target.cloneNode(true)
    this.#clone.id = this.#cloneId

    const scripts = this.#clone.querySelectorAll('script, iframe, object, embed')
    scripts.forEach(script => script.remove())

    Object.assign(this.#clone.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '999999',
        overflow: 'hidden',
        pointerEvents: 'none',
        filter: 'blur(1px)',
    })
    this.#clone.inert = true
    this.#target.replaceWith(this.#clone)
    this.#clone.scrollTop = this.#originalScrollY
    setTimeout(() => {
      if(this.#extraClass) {
       this.#clone.classList.add(this.#extraClass)
      }
    }, 150)

    this.#disableScrollMethods()
    this.#isFrozen = true
  }

  unfreezeViewport() {
    if (!this.#isFrozen) return
    if (this.#clone) {
      this.#target.classList.add(this.#extraClass)
      this.#target.scrollTop = this.#originalScrollY
      this.#clone.replaceWith(this.#target)

      setTimeout(() => {
        if(this.#extraClass) {
         this.#target.classList.remove(this.#extraClass)
        }
      }, 150)
    }

    this.#enableScrollMethods()

    this.#target.scrollTo(0, this.#originalScrollY)
    this.#isFrozen = false;
    this.#originalScrollY = 0
  }
}
