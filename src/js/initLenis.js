import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

function htmlScrollbarOnscroll(e,scrollTimeout, scrollbarColor, scrollbarActiveColor) {
  document.documentElement.style.setProperty('--doc-thumb-color', scrollbarActiveColor)

  clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(() => {
    document.documentElement.style.setProperty('--doc-thumb-color', scrollbarColor)
  }, 1)
}

export default function initLenis(lenisOptions, scrollBarColor, scrollbarActiveColor) {
  window.lenis = new Lenis(lenisOptions)
  let scrollTimeout
  window.lenis.on('scroll', (e) => {
    htmlScrollbarOnscroll(e, scrollTimeout, scrollBarColor, scrollbarActiveColor)
    if (false) {
      setTimeout(() => {
        window.lenis.scrollTo(0, { immediate: true })
      }, 500)
    }
  })

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()

      const targetId = this.getAttribute('href')
      const targetElement = document.querySelector(targetId)

      if (targetElement) {
        lenis.scrollTo(targetElement)
      }
    })
  })

  window.lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    window.lenis.raf(time * 1000)
  })

  gsap.ticker.lagSmoothing(0)

}
