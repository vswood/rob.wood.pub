import Snap from 'snapsvg'

export default class OffcanvasMenu {
  #menuWrap
  #header
  #headerToggle
  #bodyWrapper
  #mainGrid
  isOpen = false
  #morphEl
  #path
  #initialPath
  #stepsIn
  #stepsOut
  #stepsTotal
  #isAnimating
  #closedPath = 'M-7.312,0H15c0,0,66,113.339,66,399.5C81,664.006,15,800,15,800H-7.312V0z'
  #openPath = 'M-7.312,0H100c0,0,0,113.839,0,400c0,264.506,0,400,0,400H-7.312V0z'
  #outPath = 'M-7.312,0l107.312,0c0,0 -93,130.839 -93,417c0,264.506 93,383 93,383l-107.312,0l-0,-800Z'
  #outPath2 = 'M-7.312,0l12.312,0c0,0 2,130.839 2,417c0,264.506 -2,383 -2,383l-12.312,0l0,-800Z'
  #savedContent

  constructor() {
    if (window.offcanvasMenu) {
      return window.offcanvasMenu
    }
    this.#setVariables()
    this.#initEvents()
    window.offcanvasMenu = this
  }

  #setVariables() {
    this.#headerToggle = document.querySelector('.header-toggle')
    this.#header = document.querySelector('#header')
    this.#menuWrap = document.querySelector('.menu-wrap')
    this.#bodyWrapper = document.getElementById('body-wrapper')
    this.#mainGrid = document.getElementById('main-grid')

    this.#morphEl = document.getElementById('morph-shape')
    const s = Snap(this.#morphEl.querySelector('svg'))
    this.#path = s.select('path')
    this.#stepsIn = [
      this.#closedPath,
      this.#openPath,
    ]
    this.#stepsOut = [
      this.#outPath,
      this.#outPath2
    ]
    this.#isAnimating = false
  }

  #initEvents() {
    this.#bodyWrapper.addEventListener('click', (e) => {
      var target = e.target
      if (this.isOpen && target !== document.querySelector('.header-toggle') && !document.querySelector('.menu-wrap').contains(target)) {
        this.menuClose()
      }
    })

    document.addEventListener('toggleMenu', this)

    this.#headerToggle.addEventListener('click', () => {
      console.log(this.isOpen)
      document.dispatchEvent(new CustomEvent('toggleMenu'))
    })
  }

  handleEvent(e) {
    this[`${event.type}Handler`](event)
  }

  #createFalseContent() {
    captureViewportToWrapper('faux-content')
  }

  #toggleSuspendedContent() {
    if (this.isOpen) {
      setTimeout(() => {
        this.#mainGrid.classList.remove('suspended')
      }, 100)
    } else {
      // this.#createFalseContent()
      this.#mainGrid.classList.add('suspended')
      window.savedTop = `${-1 * window.lenis.scroll}px`
      window.lenis.stop()
      document.querySelector('main').style.top = window.savedTop
    }
  }

  #animate(pos, steps) {
    if (pos > steps.length - 1) {
      this.#isAnimating = false
      return
    }
    this.#path.animate(
      {
        'path': steps[pos]
      },
      500,
      pos % 2 === 0 ? mina.ease : mina.elastic,
      () => {
        if (pos <= steps.length - 1) {
          this.#animate(pos, steps)
        } else {
          this.#finishAnimation()
        }
      }
    )
    pos++
  }

  #finishAnimation() {
    this.isOpen = !this.isOpen
    if (this.isOpen) {
      this.#morphEl.style.display = 'none'
    } else {
      this.#morphEl.style.display = 'none'
    }
  }

  #menuBubbleOpen() {
    console.log('bubble in')
    this.#morphEl.style.display = 'block'
    this.#menuWrap.classList.add('open')
    this.#animate(0, this.#stepsIn)
    setTimeout(() => {
      this.#header.classList.add('open')
    }, 400)
  }

  #menuBubbleClose() {
    console.log('bubble out')
    this.#morphEl.style.display = 'block'
    this.#header.classList.remove('open')
    this.#animate(0, this.#stepsOut)
    setTimeout(() => {
       this.#menuWrap.classList.remove('open')
    }, 400)
  }

  toggleMenuHandler() {
    if (this.isOpen) {
      this.#headerToggle.classList.remove('opened')
      this.#headerToggle.setAttribute('aria-expanded', true)
      this.menuBubbleOpen()
    } else {
      this.#headerToggle.classList.add('opened')
      this.#headerToggle.setAttribute('aria-expanded', false)
      this.menuBubbleClose()
    }
  }

  toggleMenuHandlerOld() {
    if (this.#isAnimating) {
      return false
    }
    if (this.isOpen) {
      this.#header.classList.add('disabled')
      this.#toggleSuspendedContent()
      this.#closeMenu()
      setTimeout(() => {
        this.#header.classList.remove('disabled')
        this.#toggleClasses()
        const top = parseInt(window.savedTop, 10) * -1
        window.lenis.start()
        //window.lenis.scrollTo(top, {immediate: true})
        setTimeout(() => {
          window.lenis.scrollTo(top, {immediate: true})
        }, 500)
      }, 750)
    } else {
      this.#openMenu()
      this.#toggleClasses()
      this.#toggleSuspendedContent()
    }

    this.isOpen = !this.isOpen
  }
}
