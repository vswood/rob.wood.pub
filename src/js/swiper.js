import Swiper from 'swiper/bundle'

export default function initSwiper() {
  if(document.querySelector('.swiper-button-prev') && document.querySelector('.swiper-button-next')) {
    document.querySelector('.swiper-button-prev').style.display = 'flex'
    document.querySelector('.swiper-button-next').style.display = 'flex'
  }

  window.testimonialsSlider = new Swiper(document.querySelector('.testimonials-slider.swiper'), {
    "loop": true,
    "speed": 600,
    "autoplay": {
      "delay": 5000
    },
    "slidesPerView": 1,
    "spaceBetween": 30,
    "pagination": {
      "el": ".swiper-pagination",
      "type": "bullets",
      "clickable": true
    },
    "navigation": {
      "nextEl": ".swiper-button-next",
      "prevEl": ".swiper-button-prev"
    }
  })

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        window.testimonialsSlider.autoplay.start()
      } else {
        window.testimonialsSlider.autoplay.stop()
      }
    });
  }, { threshold: 0.1 })

  observer.observe(document.querySelector('.testimonials-slider.swiper'))
}
