import gsap from 'gsap'

export default class InfiniteCarousel {
  #iteration = 0
  #spacing
  #snap
  #cards
  #loop
  #scrub
  #trigger

  #buildSeamlessLoop() {
    let overlap = Math.ceil(1 / this.#spacing)
    let startTime = this.#cards.length * this.#spacing + 0.5
    let loopTime = (this.#cards.length + overlap) * this.#spacing + 1
    let rawSequence = gsap.timeline({paused: true})
    this.#loop = gsap.timeline({
      paused: true,
      repeat: -1,
    })

    let l = this.#cards.length + overlap * 2
    let time = 0
    let i
    let index
    let item

    gsap.set(this.#cards, {xPercent: 400, opacity: 0, scale: 0})

    for (i = 0; i < l; i++) {
      index = i % this.#cards.length
      item = this.#cards[index]
      time = i * this.#spacing
      rawSequence.fromTo(item, {scale: 0, opacity: 0}, {scale: 1, opacity: 1, zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: 'power1.in', immediateRender: false}, time).
        fromTo(item, {xPercent: 400}, {xPercent: -400, duration: 1, ease: 'none', immediateRender: false}, time)
      i <= this.#cards.length && this.#loop.add('label' + i, time)
    }

    rawSequence.time(startTime)
    this.#loop.to(rawSequence, {
      time: loopTime,
      duration: loopTime - startTime,
      ease: 'none'
    }).
      fromTo(rawSequence, {time: overlap * this.#spacing + 1}, {
        time: startTime,
        duration: startTime - (overlap * this.#spacing + 1),
        immediateRender: false,
        ease: 'none'
      })

    return this.#loop
  }

  #wrapForward() {
    this.#iteration++
    this.#trigger.wrapping = true
    this.#trigger.scroll(this.#trigger.start + 1)
  }

  #wrapBackward() {
    this.#iteration--
    if (this.#iteration < 0) {
      this.#iteration = this.#cards.length
      this.#loop.totalTime(this.#loop.totalTime() + this.#loop.duration() * 10)
      this.#scrub.pause()
    }
    this.#trigger.wrapping = true
    this.#trigger.scroll(this.#trigger.end - 1)
  }

  constructor({
    spacing = 0.06,
    cardSelector = '.cards li',
    cardClass = '.card',
    scrollTriggerOptions = {},
    wrapOnScroll = false,
  } = {}) {

    gsap.to(cardClass, {opacity: 1, delay: 0.1})
    const _this = this
    this.#spacing = spacing
    this.#snap = gsap.utils.snap(spacing)
    this.#cards = gsap.utils.toArray(cardSelector)
    this.#loop = this.#buildSeamlessLoop()
    this.#scrub = gsap.to(this.#loop, {
      totalTime: 0,
      duration: 0.5,
      ease: 'power3',
      paused: true
    })

    const triggerConfig = {
      trigger: '#testimonials',
      start: 'top top',
      end: '+=2000',
      pin: '#testimonials',
      pinSpacing: true,
      scrub: true,
      ...scrollTriggerOptions,
      onUpdate(self) {
        if (wrapOnScroll && self.progress === 1 && self.direction > 0 && !self.wrapping) {
          _this.#wrapForward(self)
        } else if (wrapOnScroll && self.progress < 1e-5 && self.direction < 0 && !self.wrapping) {
          _this.#wrapBackward(self)
        } else {
          _this.#scrub.vars.totalTime = _this.#snap((_this.#iteration + self.progress) * _this.#loop.duration())
          _this.#scrub.invalidate().restart()
          self.wrapping = false
        }
      }
    }

    this.#trigger = window.ScrollTrigger.create(triggerConfig)

    let dragProxy = document.createElement('div')
    dragProxy.id = 'drag-proxy'
    let clamp
    let dragRatio

    window.Draggable.create(dragProxy, {
      type: 'x',
      trigger: '.gallery',
      onPress() {this.startScroll = _this.#trigger.scroll()},
      onDrag() {
        _this.#trigger.scroll(this.startScroll - (this.x - this.startX) * dragRatio)
      }
    })

    const container = document.querySelector('.gallery')

    window.ScrollTrigger.addEventListener('refresh', () => {
      dragRatio = container.offsetWidth / (window.innerWidth * (this.#cards.length - 1))
    })

    window.Observer.create({
      target: '.gallery', // or your specific scroll container
      type: 'wheel,touch,pointer,keydown',
      onChangeY: (self) => {
        // Standard mouse/trackpad scrolling (handled automatically by ScrollTrigger)
      },
      onDown: () => {
        // Optional: Handle vertical scroll down if needed
      },
      onUp: () => {
        // Optional: Handle vertical scroll up if needed
      }
    })

    // Alternatively, for pure keyboard-specific movements, you can listen to a direct keydown event:
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        window.carousel.scrubTo()
      } else if (e.key === 'ArrowLeft') {
        window.carousel.scrubTo(true)
      }
    })
  }

  scrubTo(reverse = false) {
    let totalTime = this.#scrub.vars.totalTime + this.#spacing
    if (reverse) {
      totalTime = this.#scrub.vars.totalTime - this.#spacing
    }
    let progress = (totalTime - this.#loop.duration() * this.#iteration) / this.#loop.duration()
    console.log(progress)
    if (progress > 1) {
      this.#wrapForward()
    } else if (progress < 0) {
      this.#wrapBackward()
    } else {
      this.#trigger.scroll(this.#trigger.start + progress * (this.#trigger.end - this.#trigger.start))
    }
  }
}
