import GLightbox from 'glightbox'

export default function initLightbox() {
  const glightbox = GLightbox({
    selector: '.glightbox'
  })

  glightbox.on('open', () => {
    const activeElement = document.activeElement;
    if (activeElement) {
      activeElement.blur()
    }
  })
}
