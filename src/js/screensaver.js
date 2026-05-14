import lottie from 'lottie-web'
import $ from 'jquery'

export default class LottieScreensaver {
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
    document.addEventListener("mousemove", this);
    document.addEventListener("keydown", this);
    document.addEventListener("scroll", this);
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

  handleEvent() {
    this.#disable()
  }

  #updateTitle() {
    this.#intervalId = setInterval(() => {
      document.title = `${'z'}.padEnd(Math.random() * 12 + 1, 'z') | ${this.#savedTitle}`
    }, 1000)
  }

  #loadAnimation() {
    const index = Math.floor(Math.random() * this.#animations.length)
    const anim = lottie.loadAnimation({
      container: this.#screenSaverElement[0],
      renderer: 'html',
      loop: true,
      autoplay: true,
      path: this.#animations[index],
    })
    anim.setSpeed(0.5)

  }
}
