import vsApp from './VirtualStyleApp.js'

export default function animateVisible(sections) {

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        entry.target.classList.remove('animate')
        entry.target.classList.add('no-animations')
        vsApp.emit('section:hidden', {detail: entry.target})
      } else {
        entry.target.classList.remove('no-animations')
        entry.target.classList.add('animate')

        vsApp.emit('section:visible', {detail: entry.target})
      }
    })
  }, {
    rootMargin: '0px',
    threshold: 0.01,
  })

  sections.forEach(el => {
    observer.observe(el)
  })
}
