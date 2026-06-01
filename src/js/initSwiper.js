import Swiper from 'swiper/bundle'
import vsApp from './VirtualStyleApp.js'

globalThis.swiperInstances ??= []

export default function initSwiper(els, options) {
  if(document.querySelector('.swiper-button-prev') && document.querySelector('.swiper-button-next')) {
    document.querySelector('.swiper-button-prev').style.display = 'flex'
    document.querySelector('.swiper-button-next').style.display = 'flex'
  }

  const progressFill = document.querySelector('.progress-fill')
  const swiperDelay = options.autoplay?.delay || 3000

  els.forEach(el => {
    const swiper = new Swiper(el, options)
    globalThis.swiperInstances.push(swiper)
  })
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.swiper.autoplay.resume()
      } else {
        entry.target.swiper.autoplay.pause()
      }
    });
  }, { threshold: 0.1 })

  if(vsApp.prefersReducedMotion === false) {
    observer.observe(document.querySelector('.testimonials-slider.swiper'))
  }
}
