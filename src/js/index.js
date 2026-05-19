import  virtualStyleApp from './VirtualStyleApp.js'
import * as bootstrap from '~bootstrap';


window.addEventListener('load', () => {
  document.getElementById('body-wrapper').style.visibility = 'visible'
  document.body.classList.remove('loading')
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
})
