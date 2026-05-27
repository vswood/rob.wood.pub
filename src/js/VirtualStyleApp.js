class VirtualStyleApp {
  #motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  #prefersReducedMotion
  scroller
  anchors = {}

  constructor() {
    this.#prefersReducedMotion = Boolean(this.#motionQuery.matches)
  }

  set scroller(value) {
    this.scroller = document.getElementById(value)
  }

  emit(event, options) {
    const eventOptions = {}
    if(options?.detail) {
      eventOptions.detail = options.detail
    }
    if(options?.bubbles) {
      eventOptions.bubbles = options.bubbles
    }
    if(options?.cancelable) {
      eventOptions.cancelable = options.cancelable
    }
    window.dispatchEvent(new CustomEvent(event, eventOptions))
  }

  addListeners(element, events, handler) {
    events.forEach(e => element.addEventListener(e, handler));
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

  locateAnchors(sections) {
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect()
      const sectionTop = rect.top + parseInt(this.scroller.scrollTop, 10)
      this.anchors[`#${section.id}`] = sectionTop
    })
  }
}

const virtualStyleApp = new VirtualStyleApp()
export default virtualStyleApp
