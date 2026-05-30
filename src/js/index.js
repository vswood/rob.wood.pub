import vsApp from './VirtualStyleApp.js'
import initApp from './initApp.js'

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

const animationSections = document.querySelectorAll('section, .animate-section')
const setAnimateVisible = true

const swiperEls = document.querySelector('.testimonials-slider.swiper')
const swiperOptions = {
  loop: true,
  speed: 600,
  autoplay: {
    delay: 5000,
  },
  slidesPerView: 1,
  spaceBetween: 30,
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
  selector: '.glightbox'
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
  smoothWheel: true,
  stopInertiaOnNavigate: true,

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
    setLenis: false,
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

  // document.querySelectorAll('.btn').forEach(el => el.addEventListener('click', (e) => {
  //   e.preventDefault()
  // }))

  vsApp.scroller = document.getElementById('main')
  /*setTimeout(() => {
    vsApp.locateAnchors(sections)
  }, 2000)*/
})
