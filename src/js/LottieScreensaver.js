import lottie from 'lottie-web'
import $ from 'jquery'

export default class LottieScreensaver {
  #anim
  #screenSaverElement
  #timeoutId
  #intervalId
  #timeout
  #savedTitle
  #animations = [
    '/lottiefiles/webdev.json',
    '/lottiefiles/appdev.json',
    '/lottiefiles/programming.json',
    '/lottiefiles/seoe.json',
    '/lottiefiles/web.json',
    '/lottiefiles/webbuild2.json',
    '/lottiefiles/webcms.json',
    '/lottiefiles/webcode.json',
    '/lottiefiles/webdesign.json'
  ]

  constructor({timeout = 180000} = {}) {
    const el  = $('<div />')
    el.attr('id', 'screen-saver')
    el.css({
      position: 'fixed',
      zIndex: 999999999,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      width: '100vw',
      height: '100vh',
      background: '#1f1f1f',
      display: 'none',
    })
    this.#screenSaverElement = el
    $('body').append(this.#screenSaverElement)
    this.#timeout = timeout
    document.addEventListener('mousemove', this)
    document.addEventListener('keydown', this)
    document.addEventListener('scroll', this)
    document.addEventListener('wheel', this)
    this.#savedTitle = document.title
    this.#disable()
  }

  #setScreenSaver() {
    this.#timeoutId = setTimeout(() => {
      this.enable()
    }, this.#timeout)
  }

  enable() {
    this.#screenSaverElement.css({display: 'block'})
    this.#screenSaverElement.empty()
    this.#loadAnimation()
    this.#updateTitle()
  }

  #disable() {
    this.#screenSaverElement.css('display', 'none')
    document.title = this.#savedTitle
    this.#intervalId && clearInterval(this.#intervalId)
    this.#timeoutId && clearTimeout(this.#timeoutId)
    this.#setScreenSaver()
  }

  handleEvent(e) {
    this[`${e.type}Handler`]()
  }

  wheelHandler() {
    this.#disable()
  }

  scrollHandler() {
    this.#disable()
  }

  mousemoveHandler() {
    this.#disable()
  }

  keydownHandler() {
    this.#disable()
  }

  resizeHandler() {
    this.#anim.resize()
  }

  #updateTitle() {
    this.#intervalId = setInterval(() => {
      document.title = `${'z'.padEnd(Math.random() * 12 + 1, 'z')}`
    }, 1000)
  }

  #loadAnimation() {
    const index = Math.floor(Math.random() * this.#animations.length)
    this.#anim = lottie.loadAnimation({
      container: this.#screenSaverElement[0],
      renderer: 'html',
      loop: true,
      autoplay: true,
      path: this.#animations[index],
    })
    this.#anim.setSpeed(0.5)

  }
}
