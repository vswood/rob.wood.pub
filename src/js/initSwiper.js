import Swiper from 'swiper/bundle'
import vsApp from './VirtualStyleApp.js'

export default function initSwiper(options) {
  console.error(options)
  if(document.querySelector('.swiper-button-prev') && document.querySelector('.swiper-button-next')) {
    document.querySelector('.swiper-button-prev').style.display = 'flex'
    document.querySelector('.swiper-button-next').style.display = 'flex'
  }

  window.testimonialsSlider = new Swiper(document.querySelector('.testimonials-slider.swiper'))

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      console.log('POOP', entry)
      if(entry.isIntersecting) {
        window.testimonialsSlider.autoplay.start()
      } else {
        window.testimonialsSlider.autoplay.stop()
      }
    });
  }, { threshold: 0.1 })

  if(vsApp.prefersReducedMotion === false) {
    observer.observe(document.querySelector('.testimonials-slider.swiper'))
  }
}
