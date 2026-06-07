export default class ScrollTop {
  #button
  #scroller

  constructor(buttonSelector, scrollerSelector) {
    this.#button = document.querySelector(buttonSelector)
    this.#button.addEventListener('click', this)

    this.#scroller = document.querySelector(scrollerSelector)
    this.#scroller.addEventListener('scroll', this)

    window.addEventListener('window:loaded', this)
  }

  handleEvent(e) {
    this[`${e.type.replaceAll(':', '')}Handler`](e)
  }

  clickHandler(e) {
    e.preventDefault()
    this.#scroller.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
    this.#button.blur()
  }

  scrollHandler() {
    this.#toggleButtonVisibility()
  }

  windowloadedHandler() {
    this.#toggleButtonVisibility()
  }

  #toggleButtonVisibility() {
    if (this.#button) {
      event.target.scrollTop > 100 ? this.#button.classList.add('active') : this.#button.classList.remove('active')
    }
  }
}
