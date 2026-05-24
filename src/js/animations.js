import LottieScreensaver from './LottieScreensaver.js'

async function checkMotionPref() {
  const mm = gsap.matchMedia()
  await Promise.all([
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      window.reduceMotion = false
    }),
    mm.add("(prefers-reduced-motion: reduce)", () => {
      window.reduceMotion = true
    })
  ])
}

function initScrollTriggers() {
  const panels = document.querySelectorAll('section')
  gsap.registerPlugin(ScrollTrigger)
  panels.forEach((panel, i) => {
    ScrollTrigger.create({
      trigger: panel,
      start: 'bottom bottom',
      // end: 'bottom top',
      pin: true,
      pinSpacing: false,
      scrub: 1,
      markers: { indent: i * 200 },
      id: `panel${i}`,
      // toggleClass: { targets: navLinks[i], className: "active" } ,
    })
  })
}

function initLenisSmoothScrolling() {
  // Initialize a new Lenis instance for smooth scrolling
  const lenis = new Lenis({
    /*anchors: {
      offset: 100,
      onComplete: ()=>{
        console.log('scrolled to anchor')
      }
    },*/
    // infinite: true,
  })
  let scrollTimeout
  lenis.on('scroll', (e) => {
    htmlScrollbarOnscroll(scrollTimeout)
    if (false) {
      setTimeout(() => {
        lenis.scrollTo(0, { immediate: true })
      }, 500)
    }
  })

  // Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
  lenis.on('scroll', ScrollTrigger.update)

  // Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
  // This ensures Lenis's smooth scroll animation updates on each GSAP tick
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000) // Convert time from seconds to milliseconds
  })

  // Disable lag smoothing in GSAP to prevent any delay in scroll animations
  gsap.ticker.lagSmoothing(0)
}

function initGSAPSmoothScrolling() {
  gsap.registerPlugin(SmoothScroller)
  const smoother = ScrollSmoother.create({
    smooth: 2,
    smoothTouch: 0.1,
    speed: 0.5,
    effects: true,
  })
}

function initSplitText() {
  gsap.registerPlugin(SplitText)
}

function initScrollTo() {
  gsap.registerPlugin(ScrollToPlugin)
}

function initScrollToAnchors() {
  // Intercept all clicks on internal page links and smooth scroll them
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()
      gsap.to(window, {
        duration: 1,
        scrollTo: {
          y: this.getAttribute('href'),
          offsetY: 0, // Adjust for fixed headers
          autoKill: true,
        },
        ease: 'power2.inOut'
      })
    })
  })
}

function logFocusEvents() {
  document.addEventListener('focusin', () => {
    console.log('Focused:', document.activeElement)
  })
}

function setStandardAnimations() {
  const targets = gsap.utils.toArray(["#home .container .row.heading", ".hero-image .image-wrapper .img-fluid.main-image", ".floating-card", ".hero-main .primary-heading", ".hero-main .row.actions", ".hero-main ,copy-wrapper .copy-section", ".hero-main .read-more",  ".hero-stats .stat-item"])

  gsap.set(targets, {
    opacity: 0,
    scale: 0,
    transformOrigin: "center center"
  })

  gsap.to(targets, {
    scrollTrigger: "#home",
    opacity: 1,
    scale: 1,
    duration: 0.1,
    stagger: 0.1,
  })
}

function setReduceddAnimations() {
  gsap.set('#hero', {
    opacity: 0,
    scale: 0.75,
    transformOrigin: "center center"
  })

  gsap.to('#hero', {
    scrollTrigger: "#hero",
    opacity: 1,
    scale: 1,
    duration: 1,
  })
}

function initPanelTracking(panels, set) {
  const panelVisibilityObserver = new IntersectionObserver((entries, observer) => trackPanelsInViewport(entries, observer, set), {threshold: 0.1})
  panels.forEach(target => panelVisibilityObserver.observe(target))
}

function trackPanelsInViewport(entries, observer, visiblePanels) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      visiblePanels.add(entry.target)
    } else {
      visiblePanels.delete(entry.target)
    }
  })
}

function initScrollTriggerPanelSnapping(panels) {
  // Create a ScrollTrigger for each panel to track when their top hits
  // the top of the viewport for snapping
  const tops = panels.map(panel => ScrollTrigger.create({trigger: panel, start: "top top"})).map(st => st.start)

  const bottoms = panels.map(panel => ScrollTrigger.create({trigger: panel, start: "bottom bottom"})).map(st => st.end)

  const snaps = [0, ...tops, ...bottoms]

  ScrollTrigger.create({
    snap: {
      snapTo: (progress, self) => {
        // Map all starting scroll positions for responsive handling.
        // Starting positions may change on resize
        const panelStarts = snaps.map(st => st.start)
        // Get the nearest panel start tosnap to
        const snapTo = gsap.utils.snap(panelStarts, self.scroll())

        // Normalize the scroll position to a progress value between 0 and 1
        return gsap.utils.normalize(0, ScrollTrigger.maxScroll(window), snapTo)
      },
      duration: 0.1
    }
  })
}

function initAll() {
  const panels = gsap.utils.toArray('section')
  initScrollTriggers()
  initLenisSmoothScrolling()
  initScrollToAnchors()
  const visiblePanels = new Set()
  window.visiblePanels = visiblePanels
  initPanelTracking(panels, visiblePanels)
  //initScrollTriggerPanelSnapping(panels)
  const lss = new LottieScreensaver()
}

function htmlScrollbarOnscroll(scrollTimeout) {
  document.documentElement.style.setProperty('--doc-thumb-color', '#22e7a1')

  clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(() => {
    document.documentElement.style.setProperty('--doc-thumb-color', '#22e7a155')
  }, 1)
}

function initPart() {
  window.lenis = new Lenis({
    // prevent: (node) => node.tagName === 'html',
    /*anchors: {
      offset: 0,
      duration: 0.25,
      easing: (t) => t * (2 - t), // easeInOut
    },*/
    allowNestedScroll: true,
    // infinite: true,
  })

  function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)

  let scrollTimeout
  let isDelayed = false
  lenis.on('scroll', ({ scroll, limit, direction }) => {
    htmlScrollbarOnscroll(scrollTimeout)
    //infiniteScrollWrapDelay(scroll, limit, direction, isDelayed)
  })

}


const panels = gsap.utils.toArray('section')

const visiblePanels = new Set()
window.visiblePanels = visiblePanels
initPanelTracking(panels, visiblePanels)

// addEventListener('DOMContentLoaded', () => {

  await checkMotionPref()

function initMotion() {
  if(window.reduceMotion) {
    setReduceddAnimations()
  } else {
    setStandardAnimations()
  }
}


window.addEventListener('load', function (e) {

  document.getElementById('body-wrapper').style.visibility = 'visible'

  // initMotion()

  //initPart()

  // const panels = gsap.utils.toArray('section')
  //initScrollTriggers()
})
