export default function animateVisible(sections) {

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        entry.target.classList.remove('animate')
        entry.target.classList.add('no-animations')
      } else {
        entry.target.classList.remove('no-animations')
        entry.target.classList.add('animate')
      }
    })
  }, {
    rootMargin: '0px',
    threshold: 0.1,
  })

  sections.forEach(el => {
    observer.observe(el)
  })
}
