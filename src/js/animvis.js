export default function initAnimvis() {
  const sections = document.querySelectorAll('section')

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        entry.target.classList.add('no-animations')
      } else {
        entry.target.classList.remove('no-animations')
      }
    })
  }, {
    rootMargin: '0px',
    threshold: 0.1,
  })

  sections.forEach((section) => {
    observer.observe(section)
  })
}
