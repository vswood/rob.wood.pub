let isFrozen = false
let originalScrollY = 0
let originalScrollX = 0

// Helper to disable scroll wheel, keyboard, and touch events
function preventDefault(e) {
    e.preventDefault()
}

function disableScrollMethods() {
    // Disable wheel scrolling
    window.addEventListener('wheel', preventDefault, { passive: false })
    // Disable touch/drag scrolling
    window.addEventListener('touchmove', preventDefault, { passive: false })
    // Disable keyboard scrolling (arrows, space, page up/down)
    window.addEventListener('keydown', preventDefault)
}

function enableScrollMethods() {
    window.removeEventListener('wheel', preventDefault)
    window.removeEventListener('touchmove', preventDefault)
    window.removeEventListener('keydown', preventDefault)
}

function freezeViewport() {
    if (isFrozen) return

    // 1. Capture current scroll position
    originalScrollX = window.pageXOffset || document.documentElement.scrollLeft
    originalScrollY = window.pageYOffset || document.documentElement.scrollTop

    // 2. Clone the document element (keeps styles and layout)
    const clone = document.documentElement.cloneNode(true)
    clone.id = 'viewport-overlay-clone'

    // 3. Clean up the clone to prevent double-bindings, focus errors, or issues
    // Remove original id to avoid selector conflicts
    clone.removeAttribute('id')
    const scripts = clone.querySelectorAll('script, iframe, object, embed')
    // Remove executable scripts
    scripts.forEach(script => script.remove())

    // 4. Apply fixed styling to the cloned overlay
    Object.assign(clone.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '999999',
        overflow: 'hidden',
        // Allows clicks to pass through to the underlying page if needed
        pointerEvents: 'none',
    })

    // 5. Inject the overlay and hide the original document's scrollbars
    document.body.appendChild(clone)
    document.documentElement.style.overflow = 'hidden'

    // 6. Disable all scroll methods
    disableScrollMethods()
    isFrozen = true
}

function unfreezeViewport() {
    if (!isFrozen) return

    // 1. Remove the clone
    const existingClone = document.body.querySelector('#viewport-overlay-clone')
    if (existingClone) {
        existingClone.remove()
    }

    // 2. Restore document overflow
    document.documentElement.style.overflow = ''

    // 3. Re-enable scrolling methods
    enableScrollMethods()

    // 4. Restore scroll position
    window.scrollTo(originalScrollX, originalScrollY)
    isFrozen = false;
}

// Toggle function
function toggleViewportFreeze() {
    if (isFrozen) {
        unfreezeViewport()
    } else {
        freezeViewport()
    }
}
