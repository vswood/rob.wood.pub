class VirtualStyleApp {
  #config
  #motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  #prefersReducedMotion

  constructor() {
    this.#prefersReducedMotion = Boolean(this.#motionQuery.matches)
  }

  emit(event, options) {
    const config = {}
    if(options?.detail) {
      config.detail = options.detail
    }
    if(options?.bubbles) {
      config.bubbles = options.bubbles
    }
    if(options?.cancelable) {
      config.cancelable = options.cancelable
    }
    window.dispatchEvent(new CustomEvent(event, config))
  }

  initPreferenceListeners() {
    motionQuery.addEventListener('change', (event) => {
      if (event.matches) {
        this.#prefersReducedMotion = true
      } else {
        this.#prefersReducedMotion = false
      }
      this.emit('config:userPreference:reducedMotion', {
        detail: {
          prefersReducedMotion: this.#prefersReducedMotion
        }
      })
    })
  }

  get prefersReducedMotion() {
    return this.#prefersReducedMotion
  }
}

const virtualStyleApp = new VirtualStyleApp()
export default virtualStyleApp
