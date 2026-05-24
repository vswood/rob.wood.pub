
  function objectPosition(obj) {
    var curleft = 0
    var curtop = 0
    if (obj.offsetParent) {
      do {
        curleft += obj.offsetLeft
        curtop += obj.offsetTop
      } while (obj = obj.offsetParent)
    }
    return [curleft, curtop]
  }

  window.box = document.getElementsByClassName('source')[0]
  window.boxshadow = box.getElementsByTagName('span')[0]
  window.boxLeft = objectPosition(box)[0]
  window.boxTop = objectPosition(box)[1]
  window.canvasWidth = window.innerWidth
  window.canvasHeight = window.innerHeight
  window.timer = 0

  const shadowElsCache = new Map()

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const {top, left, width, height} = entry.boundingClientRect
        shadowElsCache.set(entry.target, {
          top: top + window.scrollY,
          left: left + window.scrollX,
          width,
          height,
          isIntersecting: entry.isIntersecting
        })
      } else {
        shadowElsCache.delete(entry.target)
      }
      console.log(shadowElsCache)

    })
  }, {threshold: [0, 0.25, 0.5, 0.75, 1.0]})

  document.querySelectorAll('.source').forEach(el => {
    observer.observe(el)
  })

  let ticking = false

  function generateDirectionalGradient({
    normalizedDistanceX,
    normalizedDistanceY,
    bgColor,
  } = {}) {

    //shadow
    const shadowLeftMultiplier = -40
    const shadowTopMultiplier = -10
    const shadowTopOffset = 20
    const newShadowLeft = `${normalizedDistanceX * shadowLeftMultiplier}px`
    const newShadowTop = `${normalizedDistanceY * shadowTopMultiplier + shadowTopOffset}px`

    // gradient
    const gradientLeftMultiplier = 120
    const gradientTopMultiplier = 80
    const gradientLeftOffset = 125
    const gradientTopOffset = 20
    const newGradientLeft = normalizedDistanceX * gradientLeftMultiplier + gradientLeftOffset
    const newGradientTop = normalizedDistanceY * gradientTopMultiplier + gradientTopOffset
    const gradient = `radial-gradient(circle at ${newGradientLeft}px ${newGradientTop}px, color-mix(in oklch, ${bgColor}, #ffffff88 50%) 0%, ${bgColor} 40%)`
    return gradient
  }

  function moveShadows(e) {
    for (const [el, pos] of shadowElsCache) {

      const mouseLeft = e.pageX
      const mouseTop = e.pageY
      const distanceFromBoxX = mouseLeft - pos.left - 75
      const distanceFromBoxY = mouseTop - pos.top - 75
      const normalizedDistanceX = (distanceFromBoxX / canvasWidth)
      const normalizedDistanceY = (distanceFromBoxY / canvasHeight)

      const gradient = generateDirectionalGradient({
        normalizedDistanceX,
        normalizedDistanceY,
        bgColor: getComputedStyle(el).backgroundColor,
      })
      console.log(distanceFromBoxY, distanceFromBoxX)
      if (distanceFromBoxY !== 0 && distanceFromBoxX !== 0) {
        //el.style.left = newShadowLeft
        //el.style.top = newShadowTop
        el.style.backgroundImage = gradient
        console.log(gradient)
      }
    }
  }

  document.body.addEventListener('mousemove', function (e) {
    if (!ticking) {
      requestAnimationFrame(() => {
        moveShadows(e)
        ticking = false
      })
      ticking = true
    }
  })
