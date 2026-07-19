import vsApp from '../lib/VirtualStyleApp.js'

async function loadDefault(importPromise) {
  const module = await importPromise
  return module.default
}

function hasRequiredMenuElements({
  headerToggle,
  header,
  menuWrap,
  bodyWrapper,
  scrollTop,
  morphEl,
  homeLink,
} = {}) {
  return Boolean(
    headerToggle &&
    header &&
    menuWrap &&
    bodyWrapper &&
    scrollTop &&
    morphEl &&
    homeLink,
  )
}

export default async function initApp({
  animationSections = [],
  setAnimateVisible = false,
  glightboxOptions = {},
  setTooltips = false,
  setScreensaver = false,
  setScrollTop = false,
  setLenis = false,
  lenisOptions = {},
  scrollbarColor,
  scrollbarActiveColor,
  setGsap = false,
  gsapPlugins = [],
  scrollTriggerOptions = {},
  offCanvasMenuOptions,
} = {}) {
  if (hasRequiredMenuElements(offCanvasMenuOptions)) {
    const OffcanvasMenu = await loadDefault(import('../lib/OffcanvasMenu.js'))
    const menu = new OffcanvasMenu(offCanvasMenuOptions)
    window.menu = menu
  }

  if(setTooltips && document.querySelector('[data-bs-toggle="tooltip"]')) {
    const initTooltips = await loadDefault(import('./initTooltips.js'))
    initTooltips()
  }

  if(vsApp.prefersReducedMotion === false) {

    if(setAnimateVisible && animationSections.length > 0) {
      const animateVisible = await loadDefault(import('../lib/animateVisible.js'))
      animateVisible(animationSections)
    }

    if(setScreensaver) {
      const LottieScreensaver = await loadDefault(import('../lib/LottieScreensaver.js'))
      window.lss = new LottieScreensaver()
    }

    if(setGsap) {
      const initGsap = await loadDefault(import('./initGsap.js'))
      initGsap(gsapPlugins, scrollTriggerOptions)
    }

    if(setLenis) {
      const initLenis = await loadDefault(import('./initLenis.js'))
      initLenis(lenisOptions, scrollbarColor, scrollbarActiveColor)
    }
  }

  if(Object.keys(glightboxOptions).length > 0 && document.querySelector(glightboxOptions.selector)) {
    const initLightbox = await loadDefault(import('./initGlightbox.js'))
    initLightbox(glightboxOptions)
  }

  if(setScrollTop && document.querySelector('#scroll-top')) {
    const ScrollTop = await loadDefault(import('../lib/ScrollTop.js'))
    window.scrollTop = new ScrollTop('#scroll-top', 'main')
  }
}
