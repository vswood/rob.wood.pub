import gsap from 'gsap'

function initScrollTrigger() {
  window.ScrollTrigger.defaults({
    markers: true,
  })
}

function initHero() {
  const targets = gsap.utils.toArray([".heading-logo", ".hero-main .primary-heading", ".hero-main .row.actions", ".hero-main .copy-wrapper .copy-section", ".hero-main .read-more", ".hero-image .image-wrapper .img-fluid.main-image", ".floating-card",  ".hero-stats .stat-item"])

  gsap.set(targets, {
    opacity: 0,
    scale: 0,
    transformOrigin: "center center"
  })

  gsap.to(targets, {
    scrollTrigger: '#home',
    opacity: 1,
    scale: 1,
    duration: 0.25,
    stagger: 0.15,
  })
}

export default async function initGsap(plugins) {
  if(plugins.includes('ScrollTrigger')) {
    const st = await import('gsap/ScrollTrigger')
    window.ScrollTrigger = st.ScrollTrigger
    gsap.registerPlugin(window.ScrollTrigger)
    initScrollTrigger()
    initHero()
  }
  if(plugins.includes('ScrollSmoother')) {
    window.ScrollSmoother = await import('gsap/ScrollSmoother')
    gsap.registerPlugin(window.ScrollSmoother)
  }
  if(plugins.includes('ScrollToPlugin')) {
    window.ScrollToPlugin = await import('gsap/ScrollToPlugin')
    gsap.registerPlugin(window.ScrollToPlugin)
  }
  if(plugins.includes('SplitText')) {
    window.SplitText = await import( 'gsap/SplitText')
    gsap.registerPlugin(window.SplitText)
  }
}

