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
  new PureCounter({
    separator: true,
  })

  /**
   * Animate the skills items on reveal
   */
  /*let skillsAnimation = document.querySelectorAll('.skills-animation')
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
  })*/

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  })

  /**
   * Init isotope layout and filters
   */
  /*document.querySelectorAll('.isotope-layout').forEach(function (isotopeItem) {
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

  })*/

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

    const phone = document.getElementById('input-phone')
    if(phone) {
      phone.addEventListener('input', (e) => {
        let input = e.target.value.replace(/\D/g, '') // Remove all non-digits
        let size = input.length

        if (size < 1) {
          e.target.value = ""
        } else if (size < 4) {
          e.target.value = "(" + input
        } else if (size < 7) {
          e.target.value = "(" + input.substring(0, 3) + ") " + input.substring(3)
        } else {
          e.target.value = "(" + input.substring(0, 3) + ") " + input.substring(3, 6) + "-" + input.substring(6, 10)
        }
      })

      const forms = document.querySelectorAll('.needs-validation')

      // Loop over them and prevent submission
      Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }

          form.classList.add('was-validated')
        }, false)
      })
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
