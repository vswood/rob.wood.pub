import  virtualStyleApp from './VirtualStyleApp.js'
import * as bootstrap from 'bootstrap'
import PureCounter from '@srexi/purecounterjs'
import initLightbox from './glightbox.js'
import initSwiper from './swiper.js'
import initMenu from './menu.js'
import initAnimvis from './animvis.js'
// import LottieScreensaver from './LottieScreensaver.js'

window.bootstrap = bootstrap

window.addEventListener('preloader:exit', () => {
  document.getElementById('body-wrapper').style.contentVisibility = 'visible'
})

document.addEventListener('DOMContentLoaded', () => {
  initMenu()

  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused'
    });
  }, { threshold: 0.5 })

  document.querySelectorAll('.animation').forEach(el => observer.observe(el))

  new PureCounter({
    separator: true,
  })

  if(document.querySelector('.glightbox')) {
    initLightbox()
  }

  if(document.querySelector('.testimonials-slider.swiper')) {
    initSwiper()
  }

  initAnimvis()

  // window.lss = new LottieScreensaver()
})

window.addEventListener('load', () => {
  virtualStyleApp.emit('window:loaded')
})

document.querySelectorAll('.btn').forEach(el => el.addEventListener('click', (e) => {
    e.preventDefault()
  })
)
