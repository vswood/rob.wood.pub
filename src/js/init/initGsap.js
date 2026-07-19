import gsap from 'gsap'
import InfiniteCarousel from '../lib/InfiniteCarousel.js'

function initScrollTrigger() {
  window.ScrollTrigger.defaults({
    scroller: '#main',
    start: 'top 70%',
    pinType: 'transform',
    markers: false,
  })
}

function animateGroup(selector, set, to, triggerOpts = null) {
  const items = gsap.utils.toArray(selector)
  items.forEach(item => {
    gsap.set(item, set)
    to.scrollTrigger =  {
      trigger: item,
    }
    if(triggerOpts) {
      Object.assign(to.scrollTrigger, triggerOpts)
    }
    gsap.to(item, to)
  })
}

function initSectionAnimations() {
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

  const setOne = {
    opacity: 0,
    scale: 0,
    transformOrigin: 'center center'
  }

  const toOne = {
    opacity: 1,
    scale: 1,
    duration: 0.25,
    stagger: 0.15,
  }

  const setTwo = {
    opacity: 0,
    scale: 0,
    rotation: -360,
    transformOrigin: 'center center'
  }

  const toTwo = {
    opacity: 1,
    scale: 1,
    rotation: 0,
    duration: 0.25,
    stagger: 0.15,
  }

  animateGroup(
    '.timeline-item',
    setOne,
    toOne,
    {
      start: 'top 95%',
    }
  )

  animateGroup(
    '.portfolio-item',
    setOne,
    toOne,
    {
      start: 'top 85%',
    }
  )

  animateGroup(
    '.portfolio-image',
    setTwo,
    toTwo,
    {
      start: 'top 85%',
    }
  )

  animateGroup(
    '.detail-item',
    setTwo,
    toTwo,
  ),
  {
    start: 'top -5%',
  }

  animateGroup(
    '.tech-item',
    setTwo,
    toTwo,
  )
}

function initTestimonialsCarousel(scrollTriggerOptions) {
  if(!document.querySelector('.cards li') || !document.querySelector('.prev-testimonial') || !document.querySelector('.next-testimonial')) {
    return
  }

  window.carousel = new InfiniteCarousel({
    spacing: 0.045,
    cardSelector: '.cards li',
    cardClass: '.card',
    scrollTriggerOptions,
  })
}

const fmt = new Intl.NumberFormat('en-US')

function initCounts() {
  const counters = gsap.utils.toArray('.purecounter')
  counters.forEach(counter => {
    const stop = counter.getAttribute('data-purecounter-end')
    const countObj = {val: 0}
    gsap.to(countObj, {
      scrollTrigger: counter,
      val: stop,
      duration: 1,
      ease: 'ease.in.out',
      onUpdate: () => {
        counter.innerText =fmt.format( Math.round(countObj.val))
      }
    })
  })
}

export default async function initGsap(plugins, scrollTriggerOptions = {}) {
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
    initCounts()
    initSectionAnimations()
    initTestimonialsCarousel(scrollTriggerOptions)
  }
  if(plugins.includes('SplitText')) {
    const st = await import('gsap/SplitText')
    window.SplitText = st.SplitText
    gsap.registerPlugin(window.SplitText)
  }
}
