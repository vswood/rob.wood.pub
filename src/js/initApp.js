import vsApp from './VirtualStyleApp.js'
import OffcanvasMenu from './OffcanvasMenu.js'
import initCounter from './initCounter.js'
import initLightbox from './initGlightbox.js'
import initSwiper from './initSwiper.js'
import initTooltips from './initTooltips.js'
import animateVisible from './animateVisible.js'
import LottieScreensaver from './LottieScreensaver.js'
import FreezeFrame from './FreezeFrame.js'
import ScrollTop from './ScrollTop.js'
import initLenis from './initLenis.js'
import initGsap from './initGsap.js'

window.ff = new FreezeFrame()

export default function initApp({
  animationSections = [],
  setAnimateVisible = false,
  swiperEls = [],
  swiperOptions = {},
  glightboxOptions = {},
  setTooltips = false,
  setCounters = false,
  counterOptions = {separator: true},
  setScreensaver = false,
  setScrollTop = false,
  setLenis = false,
  lenisOptions = {},
  scrollbarColor,
  scrollbarActiveColor,
  setGsap = false,
  gsapPlugins = [],
  offCanvasMenuOptions,
} = {}) {
  const menu = new OffcanvasMenu(offCanvasMenuOptions)
  window.menu = menu
  initTooltips()

  if(vsApp.prefersReducedMotion === false) {

    if(counterOptions) {
      initCounter(counterOptions)
    }

    if(swiperEls.length > 0) {
      initSwiper(swiperOptions)
    }
  }

  if(Object.keys(glightboxOptions).length > 0) {
    initLightbox(glightboxOptions)
  }

  if(setAnimateVisible && animationSections.length > 0) {
    animateVisible(animationSections)
  }

  if(setScreensaver) {
    window.lss = new LottieScreensaver()
  }

  if(setScrollTop) {
    window.scrollTop = new ScrollTop('#scroll-top', 'main')
  }

  if(setLenis) {
   initLenis(lenisOptions, scrollbarColor, scrollbarActiveColor)
  }

  if(setGsap) {
   initGsap(gsapPlugins)
  }
}
