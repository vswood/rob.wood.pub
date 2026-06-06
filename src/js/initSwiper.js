import InfiniteCarousel from './InfiniteCarousel.js'

export default function initSwiper() {
  window.carousel = new InfiniteCarousel({
    cardSelector: '.cards li',
    cardClass: '.card',
  })

  // document.querySelector('.next').addEventListener('click', () => window.carousel.scrubTo())
  // document.querySelector('.prev').addEventListener('click', () => window.carousel.scrubTo(true))
}
