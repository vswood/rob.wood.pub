import gsap from 'gsap'
import initSwiper from './initSwiper.js'

function initScrollTrigger() {
  window.ScrollTrigger.defaults({
    scroller: '#main',
    start: 'top 70%',
    pinType: 'transform',
    markers: false,
  })
}

function initSectionStacking() {
  const panels = gsap.utils.toArray('section')

  panels.forEach((panel, i) => {
    window.ScrollTrigger.create({
      trigger: panel,
      start: 'bottom bottom',
      pin: true,
      pinSpacing: false,
      id: `pin-${panel.id || i}`
    })

    if (i < panels.length - 1) {
      const nextPanel = panels[i + 1]
      const container = panel.querySelector('.container')
      if (container) {
        gsap.to(container, {
          scrollTrigger: {
            trigger: nextPanel,
            start: 'top bottom',
            end: 'top top',
            scrub: true
          },
          opacity: 0.1,
          scale: 0.85,
          y: -50,
          ease: 'none'
        })
      }
    }
  })
}

function animationOne(targets, scrollTrigger) {
  gsap.set(targets, {
    opacity: 0,
    scale: 0,
    transformOrigin: 'center center'
  })

  gsap.to(targets, {
    scrollTrigger,
    opacity: 1,
    scale: 1,
    duration: 0.15,
    stagger: 0.075,
  })
}

function animationTwo(targets, scrollTrigger) {
  gsap.set(targets, {
    opacity: 0,
    scale: 0,
    rotation: -360,
    transformOrigin: 'center center'
  })

  gsap.to(targets, {
    scrollTrigger,
    opacity: 1,
    scale: 1,
    rotation: 0,
    duration: 0.15,
    stagger: 0.075,
  })
}

const sectionAnimations = [
  {
    targets: ['.heading-logo', '.hero-main .primary-heading', '.hero-main .row.actions', '.hero-main .copy-wrapper .copy-section', '.hero-main .read-more', '.hero-image .image-wrapper .img-fluid.main-image', '.floating-card',  '.hero-stats .stat-item'],
    trigger: '#home',
  },
  {
    targets: ['.about-title', '.about-title-2', '.about-details', '.about-title-3', '.profile-image', '.philosophy-quote', '.video-link'],
    trigger: '#about',
  },
  {
    targets: ['.about-2', '.about-btns', '.collab-text'],
    trigger: '.about-lower',
  },
  {
    targets: ['.stats-title', '.achievement.one', '.achievement.two', '.achievement.three'],
    trigger: {
      trigger: '#stats',
      start: 'top 20%',
    },
  },
  {
    targets: ['.skills-1', '.skills-2', '.skills-3', '.skills-4', '.skills-5', '.skills-8'],
    trigger: '#skills',
  },
  {
    targets: ['.skills-6',],
    trigger: '.skills-9',
  },
  {
    targets: ['.skills-7',],
    trigger: '.skills-10',
  },
  {
    targets: document.querySelectorAll('.tech-item'),
    trigger: '.tech-stack',
    animFunc: animationTwo,
  },
  {
    targets: ['.resume-1', '.resume-2'],
    trigger: '#resume',
  },
  {
    targets: ['.resume-3',],
    trigger: '.resume-3',
  },
  {
    targets: ['.resume-4', '.resume-5'],
    trigger: '.resume-4',
  },
  {
    targets: ['.portfolio-1',],
    trigger: '#portfolio',
  },
]

function initSectionAnimations() {
  for(const section of sectionAnimations) {
    const animFunc = section.animFunc ? section.animFunc : animationOne
    animFunc(gsap.utils.toArray(section.targets), section.trigger)
  }

  gsap.set('.about-image', {
    opacity: 0,
    x: '-125%',
    transformOrigin: 'center center'
  })

  gsap.to('.about-image', {
    scrollTrigger: '.about-image',
    opacity: 1,
    x: 0,
    duration: 0.15,
  })

  gsap.to('.about-image', {
    scrollTrigger: {
      trigger: '.about-image',
      start: 'top 5%',
    },
    opacity: 1,
    x: '250%',
    duration: 0.5,
    onComplete: () => {
      setTimeout(() => {
        gsap.set('.about-image', { x: 0, opacity: 1, scale: 1 })
      }, 1000)
    },
  })

  const bars = gsap.utils.toArray('#skills .progress-bar')
  bars.forEach(bar => {
    const targetVal = bar.getAttribute('aria-valuenow') || 100
    gsap.set(bar, { transition: 'none' })
    gsap.to(bar, {
      scrollTrigger: {
        trigger: bar,
        start: 'top bottom',
        end: 'bottom center',
      },
      width: `${targetVal}%`,
      ease: 'none'
    })
  })

  const positions = gsap.utils.toArray('.timeline-item')
  positions.forEach(p => {
    gsap.set(p, {
      opacity: 0,
      scale: 0,
      transformOrigin: 'center center'
    })
    gsap.to(p, {
      scrollTrigger: p,
      opacity: 1,
      scale: 1,
      duration: 0.25,
      stagger: 0.15,
    })
  })

  const portfolioItems = gsap.utils.toArray('.portfolio-item')
  portfolioItems.forEach(p => {
    gsap.set(p, {
      opacity: 0,
      scale: 0,
      rotation: -360,
      transformOrigin: 'center center'
    })
    gsap.to(p, {
      scrollTrigger: p,
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 0.25,
      stagger: 0.15,
    })
  })

}

export default async function initGsap(plugins) {
  if(plugins.includes('Draggable')) {
    const dg = await import('gsap/Draggable')
    window.Draggable = dg.Draggable
    gsap.registerPlugin(window.Draggable)
  }
  if(plugins.includes('Observer')) {
    const ob = await import('gsap/Observer')
    window.Observer = ob.Observer
    gsap.registerPlugin(window.Observer)
  }
  if(plugins.includes('ScrollTrigger')) {
    const st = await import('gsap/ScrollTrigger')
    window.ScrollTrigger = st.ScrollTrigger
    gsap.registerPlugin(window.ScrollTrigger)
    initScrollTrigger()
    // initSectionStacking()
    initSectionAnimations()
    initSwiper()
    window.addEventListener('section:visible', e => {
      if(e.detail === 'testimonials') {
        window.ScrollTrigger.refresh()
      }
    })
    window.ScrollTrigger.refresh()
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

