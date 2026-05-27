import GLightbox from 'glightbox'

export default function initLightbox(glightboxOptions) {
  const glightbox = GLightbox(glightboxOptions)

  glightbox.on('open', () => {
    const activeElement = document.activeElement;
    if (activeElement) {
      activeElement.blur()
    }
  })
}
