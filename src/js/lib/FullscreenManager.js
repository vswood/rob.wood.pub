/**
 * Manages full-screen mode on small viewports based on touch and scroll.
 */
class FullscreenManager {
  #maxMobileWidth = 768
  #startY = 0
  #lastScrollY = 0
  #hasActivatedFirstTime = false
  #minScrollDelta = 10

  constructor(options = {}) {
    if (options.maxWidth) {
      this.#maxMobileWidth = options.maxWidth
    }
  }

  /**
   * Checks if current device viewport is small enough for auto-fullscreen.
   * @returns {boolean}
   */
  isSmallViewport() {
    return window.innerWidth <= this.#maxMobileWidth
  }

  /**
   * Checks if document is currently in fullscreen mode.
   * @returns {boolean}
   */
  isFullscreen() {
    return Boolean(
      document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement,
    )
  }

  /**
   * Requests browser fullscreen.
   */
  async requestFullscreen() {
    const el = document.documentElement
    const requestMethod =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen

    if (requestMethod) {
      try {
        await requestMethod.call(el)
      } catch {
        // Fullscreen request denied or unsupported
      }
    }
  }

  /**
   * Exits browser fullscreen.
   */
  async exitFullscreen() {
    const exitMethod =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.mozCancelFullScreen ||
      document.msExitFullscreen

    if (exitMethod && this.isFullscreen()) {
      try {
        await exitMethod.call(document)
      } catch {
        // Exit fullscreen error
      }
    }
  }

  /**
   * Handles initial tap or interaction to trigger fullscreen.
   */
  handleInitialActivation = () => {
    if (!this.isSmallViewport()) {
      return
    }

    if (!this.#hasActivatedFirstTime && !this.isFullscreen()) {
      this.#hasActivatedFirstTime = true
      this.requestFullscreen()
    }
  }

  /**
   * Records touch start position.
   * @param {TouchEvent} e
   */
  handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      this.#startY = e.touches[0].clientY
    }
  }

  /**
   * Handles touch movement to determine scroll direction after tap/touch.
   * @param {TouchEvent} e
   */
  handleTouchMove = (e) => {
    if (!this.isSmallViewport() || !e.touches || e.touches.length === 0) {
      return
    }

    const currentY = e.touches[0].clientY
    const deltaY = this.#startY - currentY

    if (Math.abs(deltaY) < this.#minScrollDelta) {
      return
    }

    this.handleScrollDirection(deltaY)
    this.#startY = currentY
  }

  /**
   * Handles scroll direction logic.
   * @param {number} deltaY Positive when scrolling down, negative up.
   */
  handleScrollDirection(deltaY) {
    this.handleInitialActivation()

    if (deltaY < 0 && this.isFullscreen()) {
      this.exitFullscreen()
    } else if (deltaY > 0 && !this.isFullscreen()) {
      this.requestFullscreen()
    }
  }

  /**
   * Handles window scroll events for fallback direction checking.
   */
  handleScroll = () => {
    if (!this.isSmallViewport()) {
      return
    }

    const currentScrollY = window.scrollY || document.documentElement.scrollTop
    const deltaY = currentScrollY - this.#lastScrollY

    if (Math.abs(deltaY) >= this.#minScrollDelta) {
      this.handleScrollDirection(deltaY)
      this.#lastScrollY = currentScrollY
    }
  }

  /**
   * Initializes event listeners.
   */
  init() {
    if (!this.isSmallViewport()) {
      return
    }

    this.#lastScrollY = window.scrollY || document.documentElement.scrollTop

    window.addEventListener('touchstart', this.handleTouchStart, {
      passive: true,
    })
    window.addEventListener('touchmove', this.handleTouchMove, {
      passive: true,
    })
    window.addEventListener('click', this.handleInitialActivation, {
      passive: true,
    })
    window.addEventListener('scroll', this.handleScroll, {
      passive: true,
    })

    if (window.lenis) {
      window.lenis.on('scroll', (e) => {
        if (e && typeof e.velocity === 'number') {
          this.handleScrollDirection(e.velocity)
        }
      })
    }
  }
}

export default FullscreenManager
