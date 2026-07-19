import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

function htmlScrollbarOnscroll(e, scrollTimeout, scrollbarColor, scrollbarActiveColor) {
  document.documentElement.style.setProperty('--doc-thumb-color', scrollbarActiveColor)

  clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(() => {
    document.documentElement.style.setProperty('--doc-thumb-color', scrollbarColor)
  }, 1)
}

export default function initLenis(lenisOptions, scrollBarColor, scrollbarActiveColor) {
  window.lenis = new Lenis(lenisOptions)
  const lenis = window.lenis
  let scrollTimeout
  window.lenis.on('scroll', (e) => {
    ScrollTrigger.update()
    htmlScrollbarOnscroll(e, scrollTimeout, scrollBarColor, scrollbarActiveColor)
    if (false) {
      setTimeout(() => {
        window.lenis.scrollTo(0, {immediate: true})
      }, 500)
    }
  })

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()

      const targetId = this.getAttribute('href')
      const targetElement = document.querySelector(targetId)
      if (targetElement) {
        setTimeout(() => {
          lenis.scrollTo(targetElement)
          history.pushState(null, null, targetId)
        }, 750)
      }
    })
  })

  gsap.ticker.add((time) => {
    window.lenis.raf(time * 1000)
  })

  gsap.ticker.lagSmoothing(0)

  const hash = window.location.hash

  if (hash) {
    const targetElement = document.querySelector(hash)

    if (targetElement) {
      history.scrollRestoration = 'manual'
      lenis.scrollTo(targetElement, {
        duration: 1.2,
        offset: 0,
      })
    }
  }

}
