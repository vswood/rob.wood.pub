import OffcanvasMenu from './OffcanvasMenu.js'

export default function initMenu() {

  const menu = new OffcanvasMenu()
  window.menu = menu

  /* document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.visible')) {
        document.dispatchEvent(new CustomEvent('toggleMenu'))
      }
    })
  }) */

  /*function handleToggle() {
    this.classList.toggle('opened')
    this.setAttribute('aria-expanded', this.classList.contains('opened'))
    document.dispatchEvent(new CustomEvent('toggleMenu'))
  }*/
}
