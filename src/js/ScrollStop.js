export default class ScrollStop {
  #keys = {
    left: {
      code: 37,
      active: true,
    },
    up: {
      code: 38,
      active: true,
    },
    right: {
      code: 39,
      active: true,
    },
    down: {
      code: 40,
      active: true,
    },
    space: {
      code: 32,
      active: true,
    },
    pgup: {
      code: 33,
      active: true,
    },
    pgdown: {
      code: 34,
      active: true,
    },
    end: {
      code: 35,
      active: true,
    },
    home: {
      code: 36,
      active: true,
    },
  }

  constructor() {
    window.addEventListener('scroll', this, { passive: true })
  }

  handleEvent(e) {
  }

  preventDefault(e) {
    e.preventDefault();
  }

  preventDefaultForScrollKeys (e) {
    if (keys[e.keyCode]) {
      preventDefault(e)
      return false
    }
  }
}
