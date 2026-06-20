import vsApp from './lib/VirtualStyleApp.js'
import initApp from './init/initApp.js'
import handleFormSubmit from './handleFormSubmit.js'

window.vsApp = vsApp

function revealBody() {
  const bodyWrap = document.getElementById('body-wrapper')
  if(bodyWrap) {
    bodyWrap.style.visibility = 'visible'
    bodyWrap.setAttribute('aria-busy', false)
  }
}

function hasMultipleSections() {
  return document.querySelectorAll('section').length > 1
}

function shouldUseGsap() {
  return hasMultipleSections() || Boolean(document.querySelector('.testimonials-slider'))
}

function shouldUseScreensaver() {
  return hasMultipleSections()
}

function shouldUseLenis() {
  return hasMultipleSections()
}

window.addEventListener('preloader:exit', revealBody)

const offCanvasMenuOptions = {
  headerToggle: document.querySelector('.header-toggle'),
  header: document.querySelector('#header'),
  menuWrap: document.querySelector('.menu-wrap'),
  bodyWrapper: document.getElementById('body-wrapper'),
  scrollTop: document.getElementById('scroll-top'),
  morphEl: document.getElementById('morph-shape'),
  homeLink: document.getElementById('home-link')
}

const animationSections = document.querySelectorAll('section')

const glightboxOptions = {
  selector: '.glightbox',
  openEffect: 'zoom',
  closeEffect: 'fade',
  cssEfects: {
    fade: { in: 'fadeIn', out: 'fadeOut' },
    zoom: { in: 'zoomIn', out: 'zoomOut' }
  }
}

const counterOptions = {}

const lenisOptions = {
  allowNestedScroll: true,
  // infinite: true,
  wrapper: document.getElementById('main'),
  eventsTarget: document.getElementById('main'),
  content: document.getElementById('main'),
  syncTouch: true,
  smooth: true,
  smoothWheel: true,
  wheelMultiplier: 1.2,
  touchMultiplier: 1.5,
  stopInertiaOnNavigate: true,
  anchors: true,
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),

}
const gsapPlugins = [
  'ScrollTrigger',
  // 'Draggable',
  'Observer',
]

const scrollbarActiveColor = '#22e7a1'
const scrollbarColor = '#22e7a155'

window.addEventListener('DOMContentLoaded', () => {
  const multipleSections = hasMultipleSections()
  initApp({
    animationSections,
    setAnimateVisible: multipleSections,
    glightboxOptions,
    setTooltips: true,
    setCounters: true,
    counterOptions,
    setScreensaver: shouldUseScreensaver(),
    setScrollTop: true,
    setLenis: shouldUseLenis(),
    lenisOptions,
    scrollbarColor,
    scrollbarActiveColor,
    setGsap: shouldUseGsap(),
    gsapPlugins,
    offCanvasMenuOptions,
  })

  if(!multipleSections) {
    revealBody()
  }

  document.getElementById('contact-form').addEventListener('submit', handleFormSubmit)
})

window.addEventListener('load', () => {
  vsApp.emit('window:loaded')

  document.querySelectorAll('.portfolio-image').forEach(el => {
    el.addEventListener('click', (e) => {
      const link = el.querySelector('.action-btn.details-btn')
      if (link && e.target.closest('.action-btn') === null) {
        link.click()
      }
    })
  })

  if(hasMultipleSections()) {
    window.addEventListener('section:visible', (e) => {
      const section = e.detail
      if(section.id) {
        document.querySelectorAll('#navmenu a').forEach(link => link.classList.remove('active'))
        document.getElementById(`${section.id}-link`)?.classList.add('active')
      }
    })
  }

  // document.querySelectorAll('.btn').forEach(el => el.addEventListener('click', (e) => {
  //   e.preventDefault()
  // }))

})

// let cls = 0;
// new PerformanceObserver((entryList) => {
//   for (const entry of entryList.getEntries()) {
//     if (!entry.hadRecentInput) {
//       cls += entry.value;
//       console.log('Current CLS value:', cls, entry);
//     }
//   }
// }).observe({type: 'layout-shift', buffered: true});
