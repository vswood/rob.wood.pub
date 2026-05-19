import OffcanvasMenu from './OffcanvasMenu.js'

const menu = new OffcanvasMenu()
window.menu = menu

document.querySelectorAll('#navmenu a').forEach(navmenu => {
  navmenu.addEventListener('click', () => {
    if (document.querySelector('.visible')) {
      document.dispatchEvent(new CustomEvent('toggleMenu'))
    }
  })

})



window.addEventListener('load', toggleScrollTop)
document.addEventListener('scroll', toggleScrollTop)

new PureCounter({
  separator: true,
})

const glightbox = GLightbox({
  selector: '.glightbox'
})

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

const preloader = document.querySelector('#preloader')
if (preloader) {
  window.addEventListener('load', () => {
    preloader.remove()
    window.vsAppLoaded = true
  })
}

// window.addEventListener("load", initSwiper)

window.addEventListener('load', function (e) {
  // console.log('window loaded')
  /* if (window.location.hash) {
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
  } */
  /*
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
  */
  /* document.addEventListener('focus', function(event) {
    console.log('Element focused:', event.target);
  }, true)

  document.addEventListener('focus-visible', function(event) {
    console.log('Element focus-visible:', event.target);
  }, true) */
})
