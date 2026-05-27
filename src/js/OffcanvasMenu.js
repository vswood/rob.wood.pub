import Snap from 'snapsvg'
import vsApp from './VirtualStyleApp.js'
import FreezeFrame from './FreezeFrame.js'

export default class OffcanvasMenu {
  #menuWrap
  #header
  #headerToggle
  #scrollTop
  #scroller
  #bodyWrapper
  #mainGrid
  #freezeFrame
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
    this.#freezeFrame = new FreezeFrame({
      target: document.getElementById('main'),
      extraClass: 'suspended',
    })
  }

  #initEvents() {
    this.#bodyWrapper.addEventListener('click', (e) => {
      var target = e.target
      if (this.isOpen && target !== document.querySelector('.header-toggle') && !document.querySelector('.menu-wrap').contains(target)) {
        this.#close()
      }
    })

    document.addEventListener('keydown', (e) => {
      if (this.isOpen && e.key === 'Escape') {
        this.#close()
      }
    })

    document.querySelectorAll('.navmenu a').forEach(el => el.addEventListener('click', (e) => {
      if (window.location.hash && document.querySelector(window.location.hash)) {
        e.preventDefault()
        this.#close(window.location.hash)
      }
    }))

    window.addEventListener('toggleMenu', this)

    this.#headerToggle.addEventListener('click', () => {
      vsApp.emit('toggleMenu')
    })
  }

  #setVariables() {
    this.#headerToggle = document.querySelector('.header-toggle')
    this.#header = document.querySelector('#header')
    this.#menuWrap = document.querySelector('.menu-wrap')
    this.#bodyWrapper = document.getElementById('body-wrapper')
    this.#mainGrid = document.getElementById('main-grid')
    this.#scrollTop = document.getElementById('scroll-top')
    this.#scroller = document.getElementById('main')

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

  /*goto(hash) {
    setTimeout(() => {
      this.#scroller.scrollTo({
        top: vsApp.anchors[hash],
        behavior: 'smooth'
      })
    }, 100)
  }*/

  handleEvent(e) {
    // console.log(`${e.type}Handler`)
    this[`${e.type}Handler`](e)
  }

  #animate(pos, steps, goto) {
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
          this.#animate(pos, steps, goto)
        } else {
          this.#finishAnimation(goto)
        }
      }
    )
    pos++
  }

  #finishAnimation(goto) {
    this.isOpen = !this.isOpen
    if (this.isOpen) {
      this.#morphEl.style.display = 'none'
      document.querySelector('#home-link').focus({focusVisible: true})
    } else {
      this.#morphEl.style.display = 'none'
      this.#headerToggle.focus({focusVisible: true})
      if (goto) {
        this.goto(goto)
      }
    }
  }

  #open() {
    this.#headerToggle.classList.add('opened')
    this.#freezeFrame.toggleViewportFreeze()
    this.#scrollTop.style.display = 'none'
    this.#headerToggle.setAttribute('aria-expanded', true)
    this.#morphEl.style.display = 'block'
    this.#menuWrap.classList.add('open')
    this.#animate(0, this.#stepsIn)
    setTimeout(() => {
      this.#header.classList.add('open')
    }, 400)
  }

  #close(goto) {
    this.#headerToggle.classList.remove('opened')
    this.#freezeFrame.toggleViewportFreeze()
    this.#scrollTop.style.display = 'block'
    this.#headerToggle.setAttribute('aria-expanded', false)
    this.#morphEl.style.display = 'block'
    this.#header.classList.remove('open')
    this.#animate(0, this.#stepsOut, goto)
    setTimeout(() => {
      this.#menuWrap.classList.remove('open')
    }, 400)
  }

  toggleMenuHandler() {
    if (this.isOpen) {
      this.#close()
    } else {
      this.#open()
    }
  }
}
