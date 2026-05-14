/**
* Template Name: MyPage
* Template URL: https://bootstrapmade.com/mypage-bootstrap-personal-template/
* Updated: Sep 20 2025 with Bootstrap v5.3.8
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

function captureViewportToDiv(targetDivId) {
  const container = document.getElementById(targetDivId)

  // 1. Clone the current body content
  const clone = document.body.cloneNode(true)

  // 2. Clear target div
  container.innerHTML = ''

  // 3. Create wrapper to manage scrolling position
  const wrapper = document.createElement('div')
  wrapper.style.position = 'absolute'

  // 4. Set top to negative scrollY to align with current viewport
  wrapper.style.top = `-${window.scrollY}px`
  wrapper.style.width = '100%'

  // 5. Append clone and insert into page
  wrapper.appendChild(clone)
  container.appendChild(wrapper)
}

function captureViewportToWrapper(wrapperId) {
  const wrapper = document.getElementById(wrapperId)
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth

  // Clear previous capture
  wrapper.innerHTML = ''
  wrapper.style.position = 'relative'
  wrapper.style.overflow = 'hidden'
  wrapper.style.width = viewportWidth + 'px'
  wrapper.style.height = viewportHeight + 'px'

  Array.from(window.visiblePanels).map(p => {
    const clone = p.cloneNode(true)
    const rect = p.getBoundingClientRect()
    // Re-apply styles to maintain visual integrity
    Object.assign(clone.style, {
      position: 'absolute',
      top: rect.top + 'px',
      left: rect.left + 'px',
      width: rect.width + 'px',
      height: rect.height + 'px',
      margin: '0'
    })

    wrapper.appendChild(clone)
  })
}

class OffcanvasMenu {
  #header
  #headerToggle
  #bodyWrapper
  #mainGrid
  isOpen = false
  #morphEl
  #path
  #initialPath
  #stepsIn
  #stepsOut
  #stepsTotal
  #isAnimating
  #closedPath = 'M-7.312,0H15c0,0,66,113.339,66,399.5C81,664.006,15,800,15,800H-7.312V0z'
  #openPath = 'M-7.312,0H100c0,0,0,113.839,0,400c0,264.506,0,400,0,400H-7.312V0z'
  #outPath = 'M-7.312,0l107.312,0c0,0 -93,130.839 -93,417c0,264.506 93,383 93,383l-107.312,0l-0,-800Z'
  #outPath2 = 'M-7.312,0l12.312,0c0,0 2,130.839 2,417c0,264.506 -2,383 -2,383l-12.312,0l0,-800Z'
  #savedContent

  constructor() {
    if (window.offcanvasMenu) {
      return window.offcanvasMenu
    }
    this.#setVariables()
    this.#initEvents()
    window.offcanvasMenu = this
  }

  #setVariables() {
    this.#headerToggle = document.querySelector('.header-toggle')
    this.#header = document.querySelector('#header')
    this.#bodyWrapper = document.getElementById('body-wrapper')
    this.#mainGrid = document.getElementById('main-grid')

    this.#morphEl = document.getElementById('morph-shape')
    const s = Snap(this.#morphEl.querySelector('svg'))
    this.#path = s.select('path')
    this.#stepsIn = [
      this.#closedPath,
      this.#openPath,
    ]
    this.#stepsOut = [
      this.#outPath,
      this.#outPath2
    ]
    this.#isAnimating = false
  }

  #initEvents() {
    this.#bodyWrapper.addEventListener('click', (e) => {
      var target = e.target
      if (this.isOpen && target !== document.querySelector('.header-toggle') && !document.querySelector('.menu-wrap').contains(target)) {
        document.dispatchEvent(new CustomEvent('toggleMenu'))
      }
    })
    document.addEventListener('toggleMenu', this)
    this.#headerToggle.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('toggleMenu'))
    })
  }

  handleEvent(e) {
    this[`${event.type}Handler`](event)
  }

  #toggleClasses() {
    ['bi-list', 'bi-x'].forEach(cls => this.#headerToggle.classList.toggle(cls))
    // this.#bodyWrapper.classList.toggle('offcanvas-wrapper')
    document.body.classList.toggle('show-menu')
    this.#header.classList.toggle('visible')
  }

  #createFalseContent() {
    captureViewportToWrapper('faux-content')
  }

  #toggleSuspendedContent() {
    if (this.isOpen) {
      setTimeout(() => {
        this.#mainGrid.classList.remove('suspended')
      }, 100)
    } else {
      // this.#createFalseContent()
      this.#mainGrid.classList.add('suspended')
      window.savedTop = `${-1 * window.lenis.scroll}px`
      window.lenis.stop()
      document.querySelector('main').style.top = window.savedTop
    }
  }

  #closeMenu() {
    this.#header.style.transform = 'translate3d(calc(-1 * var(--nav-width)),0,0)'
    this.#animate(0, this.#stepsOut)
    setTimeout(() => {
      // reset path
      this.#path.attr('d', this.#closedPath)
      this.#morphEl.style.display = 'none'
      this.#isAnimating = false
    }, 1000)
  }

  #openMenu() {
    this.#morphEl.style.display = 'block'
    setTimeout(() => {
      this.#header.style.transform = 'none'
    }, 100)
    this.#animate(0, this.#stepsIn)
  }

  #animate(pos, steps) {
    if (pos > steps.length - 1) {
      this.#isAnimating = false
      return
    }
    this.#path.animate(
      {
        'path': steps[pos]
      },
      500,
      pos % 2 === 0 ? mina.ease : mina.elastic,
      () => {
        if(pos <= steps.length - 1) {
          this.#animate(pos, steps)
        } else {
          this.#finishAnimation()
        }
      }
    )
    pos++
  }

  #finishAnimation() {
    this.isOpen = !this.isOpen
    if(this.isOpen) {

    } else {
    }
  }

  setStart() {
    this.#path.attr('d', this.#closedPath)
  }

  setEnd() {
    this.#path.attr('d', this.#openPath)
  }

  open() {
    this.#openMenu()
  }

  close() {
    this.#closeMenu()
  }

  #menuBubbleOpen() {
    console.log('bubble in')
  }

  #menuBubbleClose() {
    console.log('bubble out')
  }

  toggleMenuHandler() {
    if (this.isOpen) {
      this.#menuBubbleClose()
      this.isOpen = false
    } else {
      this.#menuBubbleOpen()
      this.isOpen = true
    }
  }

  toggleMenuHandlerOld() {
    if (this.#isAnimating) {
      return false
    }

    if (this.isOpen) {
      this.#header.classList.add('disabled')
      this.#toggleSuspendedContent()
      this.#closeMenu()
      setTimeout(() => {
        this.#header.classList.remove('disabled')
        this.#toggleClasses()
        const top = parseInt(window.savedTop, 10) * -1
        window.lenis.start()
        //window.lenis.scrollTo(top, {immediate: true})
        setTimeout(() => {
          window.lenis.scrollTo(top, {immediate: true})
        }, 500)
      }, 750)
    } else {
      this.#openMenu()
      this.#toggleClasses()
      this.#toggleSuspendedContent()
    }

    this.isOpen = !this.isOpen
  }
}

(function () {



  const menu = new OffcanvasMenu()
  window.menu = menu

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.visible')) {
        document.dispatchEvent(new CustomEvent('toggleMenu'))
      }
    })

  })


  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader')
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove()
    })
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top')

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active')
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault()
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  })

  window.addEventListener('load', toggleScrollTop)
  document.addEventListener('scroll', toggleScrollTop)

  /**
   * Animation on scroll function and init
   */
  /* function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit); */

  /**
   * Initiate Pure Counter
   */
  new PureCounter()

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation')
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function (direction) {
        let progress = item.querySelectorAll('.progress .progress-bar')
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%'
        })
      }
    })
  })

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  })

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function (isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry'
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*'
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order'

    let initIsotope
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function () {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      })
    })

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function (filters) {
      filters.addEventListener('click', function () {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active')
        this.classList.add('filter-active')
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        })
        if (typeof aosInit === 'function') {
          aosInit()
        }
      }, false)
    })

  })

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function (swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      )

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config)
      } else {
        new Swiper(swiperElement, config)
      }
    })
  }

  window.addEventListener("load", initSwiper)

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function (e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash)
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          })
        }, 100)
      }
    }
  })

  /**
   * Navmenu Scrollspy
   */
  /*let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);
  */

  window.addEventListener('load', () => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
  })

})()
