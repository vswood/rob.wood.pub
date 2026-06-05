import { Pagination, Navigation } from 'swiper/modules';
import vsApp from './VirtualStyleApp.js'
import initApp from './initApp.js'
import $ from 'jquery'

window.vsApp = vsApp

window.addEventListener('preloader:exit', () => {
  const bodyWrap = document.getElementById('body-wrapper')
  bodyWrap.style.visibility = 'visible'
  bodyWrap.setAttribute('aria-busy', false)

})

const offCanvasMenuOptions = {
  headerToggle: document.querySelector('.header-toggle'),
  header: document.querySelector('#header'),
  menuWrap: document.querySelector('.menu-wrap'),
  bodyWrapper: document.getElementById('body-wrapper'),
  scrollTop: document.getElementById('scroll-top'),
  morphEl: document.getElementById('morph-shape'),
  homeLink: document.getElementById('home-link')
}

const sections = document.querySelectorAll('section')

const animationSections = document.querySelectorAll('section')
const setAnimateVisible = true

const swiperEls = document.querySelectorAll('.swiper')

const swiperOptions = {
  modules: [Pagination, Navigation],
  passiveListeners: true,
  speed: 600,
  autoHeight: true,
  slidesPerView: 1,
  effect: 'cards',
  cardsEffect: {
    perSlideOffset: 8,
    perSlideRotate: 2,
    rotate: true,
    slideShadows: true,
  },
  grabCursor: true,
  observer: true,
  observeParents: true,
  pagination: {
    el: '.swiper-pagination',
    type: 'bullets',
    clickable: true
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
}

const glightboxOptions = {
  selector: '.glightbox',
  openEffect: 'zoom',
  closeEffect: 'fade',
  cssEfects: {
    // This are some of the animations included, no need to overwrite
    fade: { in: 'fadeIn', out: 'fadeOut' },
    zoom: { in: 'zoomIn', out: 'zoomOut' }
  }
}

const setTooltips = true

const setCounters = true
const counterOptions = {separator: true}

const setScreensaver = true

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
  'ScrollTrigger'
]

const scrollbarActiveColor = '#22e7a1'
const scrollbarColor = '#22e7a155'

window.addEventListener('DOMContentLoaded', () => {
  initApp({
    animationSections,
    setAnimateVisible: true,
    swiperEls,
    swiperOptions,
    glightboxOptions,
    setTooltips: true,
    setCounters: true,
    counterOptions,
    setScreensaver: true,
    setScrollTop: true,
    setLenis: true,
    lenisOptions,
    scrollbarColor,
    scrollbarActiveColor,
    setGsap: true,
    gsapPlugins,
    offCanvasMenuOptions,
  })
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


  window.addEventListener('section:visible', (e) => {
    const section = e.detail
    if(section.id) {
      $('#navmenu a').removeClass('active')
      $(`#${section.id}-link`).addClass('active')
    }
  })

  window.ScrollTrigger.refresh()

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
