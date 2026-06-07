import gsap from 'gsap'

export default class InfiniteCarousel {
  #spacing
  #snap
  #cards
  #loop
  #scrub

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

  constructor({
    spacing = 0.06,
    cardSelector = '.cards li',
    cardClass = '.card',
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

    const container = document.querySelector('.gallery')

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        window.carousel.scrubTo()
      } else if (e.key === 'ArrowLeft') {
        window.carousel.scrubTo(true)
      }
    })

    document.querySelector('.prev-testimonial').addEventListener('click', () => {
        window.carousel.scrubTo(true)
    })

    document.querySelector('.next-testimonial').addEventListener('click', () => {
        window.carousel.scrubTo()
    })
  }

  adjustTime(delta) {
    this.#scrub.vars.totalTime = this.#snap(this.#scrub.vars.totalTime + delta)
    this.#scrub.invalidate().restart()
  }

  getScrubTime() {
    return this.#scrub.vars.totalTime
  }

  setScrubTime(time) {
    this.#scrub.vars.totalTime = this.#snap(time)
    this.#scrub.invalidate().restart()
  }

  scrubTo(reverse = false) {
    let delta = this.#spacing
    if (reverse) {
      delta = -this.#spacing
    }
    this.adjustTime(delta)
  }
}
