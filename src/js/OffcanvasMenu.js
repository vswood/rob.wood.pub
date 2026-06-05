import Snap from 'snapsvg'
import vsApp from './VirtualStyleApp.js'
import FreezeFrame from './FreezeFrame.js'
import FocusTrap from './FocusTrap.js'
import $ from 'jquery'

export default class OffcanvasMenu {
  #home
  #menuWrap
  #header
  #headerToggle
  #scrollTop
  #bodyWrapper
  #freezeFrame
  isOpen = false
  #morphEl
  #path
  #isAnimating
  #stepsIn = [
    'M-7.312,0H15c0,0,66,113.339,66,399.5C81,664.006,15,800,15,800H-7.312V0z',
    'M-7.312,0H100c0,0,0,113.839,0,400c0,264.506,0,400,0,400H-7.312V0z',
  ]
  #stepsOut = [
    'M-7.312,0l107.312,0c0,0 -93,130.839 -93,417c0,264.506 93,383 93,383l-107.312,0l-0,-800Z',
    'M-7.312,0l12.312,0c0,0 2,130.839 2,417c0,264.506 -2,383 -2,383l-12.312,0l0,-800Z',
  ]
  #focusTrap
  #menuToggleDisableDuration = 1150

  constructor({
    headerToggle,
    header,
    menuWrap,
    bodyWrapper,
    scrollTop,
    morphEl,
    homeLink,
  } = {}) {
    if (window.offcanvasMenu) {
      return window.offcanvasMenu
    }
    window.offcanvasMenu = this
    this.#home = homeLink
    this.#headerToggle = headerToggle
    this.#header = header
    this.#menuWrap = menuWrap
    this.#bodyWrapper = bodyWrapper
    this.#scrollTop = scrollTop
    this.#morphEl = morphEl
    this.#isAnimating = false

    const s = Snap(this.#morphEl.querySelector('svg'))
    this.#path = s.select('path')

    this.#initEvents()
    this.#freezeFrame = new FreezeFrame({
      target: document.getElementById('main'),
      extraClass: 'suspended',
    })
    this.#focusTrap = new FocusTrap()
  }

  #initEvents() {
    this.#bodyWrapper.addEventListener('click', (e) => {
      var target = e.target
      if ($(this.#headerToggle).css('display') !== 'none' && this.isOpen && target !== document.querySelector('.header-toggle') && !document.querySelector('.menu-wrap').contains(target) && this.#headerToggle.disabled === false) {
        this.#close()
      }
    })

    document.addEventListener('keydown', (e) => {
      if ($(this.#headerToggle).css('display') !== 'none' && this.isOpen && e.key === 'Escape' && this.#headerToggle.disabled === false) {
        this.#close()
      }
    })

    document.querySelectorAll('.navmenu a').forEach(el => el.addEventListener('click', (e) => {
      if ($(this.#headerToggle).css('display') !== 'none' &&window.location.hash && document.querySelector(window.location.hash)) {
        this.#close()
      }
    }))

    window.addEventListener('toggle:menu', this)

    this.#headerToggle.addEventListener('click', () => {
      this.#headerToggle.disabled = true
      vsApp.emit('toggle:menu')
      setTimeout(() => {
        this.#headerToggle.disabled = false
      }, this.#menuToggleDisableDuration)
    })
  }

  handleEvent(e) {
    this[`${e.type.replaceAll(':', '')}Handler`](e)
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
      this.#home.focus({focusVisible: true})
      vsApp.emit('menu:opened')
    } else {
      this.#headerToggle.focus({focusVisible: true})
      vsApp.emit('menu:closed')
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

  #close() {
    this.#headerToggle.classList.remove('opened')
    this.#freezeFrame.toggleViewportFreeze()
    this.#scrollTop.style.display = 'block'
    this.#headerToggle.setAttribute('aria-expanded', false)
    this.#morphEl.style.display = 'block'
    this.#header.classList.remove('open')
    this.#animate(0, this.#stepsOut)
    setTimeout(() => {
      this.#menuWrap.classList.remove('open')
    }, 400)
  }

  togglemenuHandler() {
    if (this.isOpen) {
      this.#close()
    } else {
      this.#open()
    }
  }
}
