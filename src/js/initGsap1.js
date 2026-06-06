import gsap from 'gsap'

function initScrollTrigger() {
  window.ScrollTrigger.defaults({
    scroller: '#main',
    pinType: 'transform',
    markers: false
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

function initScrollAnimations() {
  initSectionStacking()

  gsap.from('#about .profile-image img', {
    scrollTrigger: {
      trigger: '#about',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    },
    scale: 0.8,
    rotation: -5,
    ease: 'none'
  })

  gsap.from('#about .philosophy-quote', {
    scrollTrigger: {
      trigger: '#about .philosophy-quote',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    },
    opacity: 0,
    x: 100,
    ease: 'none'
  })

  gsap.from('#about .video-link', {
    scrollTrigger: {
      trigger: '#about .video-link',
      start: 'top bottom',
      end: 'bottom center',
      scrub: true
    },
    opacity: 0,
    scale: 0.9,
    ease: 'none'
  })

  /* gsap.from('#services .service-item', {
    scrollTrigger: {
      trigger: '#services .service-list',
      start: 'top bottom',
      end: 'bottom center',
      scrub: true
    },
    opacity: 0,
    y: 50,
    stagger: 0.1,
    ease: 'none'
  }) */

  const bars = gsap.utils.toArray('#skills .progress-bar')
  bars.forEach(bar => {
    const targetVal = bar.getAttribute('aria-valuenow') || 100
    gsap.set(bar, { transition: 'none' })
    gsap.to(bar, {
      scrollTrigger: {
        trigger: bar,
        start: 'top bottom',
        end: 'bottom center',
        scrub: true
      },
      width: `${targetVal}%`,
      ease: 'none'
    })
  })

  gsap.from('#skills .tech-item', {
    scrollTrigger: {
      trigger: '#skills .tech-stack',
      start: 'top bottom',
      end: 'bottom center',
      scrub: true
    },
    opacity: 0,
    scale: 0.5,
    rotation: 15,
    stagger: 0.05,
    ease: 'none'
  })

  gsap.from('#resume .timeline-item', {
    scrollTrigger: {
      trigger: '#resume .experience-timeline',
      start: 'top bottom',
      end: 'bottom center',
      scrub: true
    },
    opacity: 0,
    x: -50,
    stagger: 0.1,
    ease: 'none'
  })

  gsap.from('#resume .education-card', {
    scrollTrigger: {
      trigger: '#resume #edu',
      start: 'top bottom',
      end: 'bottom center',
      scrub: true
    },
    opacity: 0,
    x: 50,
    ease: 'none'
  })

  gsap.from('#portfolio .fluid-grid > *', {
    scrollTrigger: {
      trigger: '#portfolio .fluid-grid',
      start: 'top bottom',
      end: 'bottom center',
      scrub: true
    },
    opacity: 0,
    scale: 0.9,
    y: 50,
    stagger: 0.1,
    ease: 'none'
  })

  gsap.from('#contact .contact-details .detail-item', {
    scrollTrigger: {
      trigger: '#contact .contact-details',
      start: 'top bottom',
      end: 'bottom center',
      scrub: true
    },
    opacity: 0,
    x: -30,
    stagger: 0.1,
    ease: 'none'
  })

  gsap.from('#contact .form-wrapper', {
    scrollTrigger: {
      trigger: '#contact .form-wrapper',
      start: 'top bottom',
      end: 'bottom center',
      scrub: true
    },
    opacity: 0,
    y: 50,
    ease: 'none'
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
    initScrollAnimations()
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


