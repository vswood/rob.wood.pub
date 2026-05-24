export default function debounce(func, wait, options) {
  let timer = null // To store timer ID
  let isLeadingInvoked = false // To track if leading has been invoked

  return function (...args) {
    let context = this

    // Leading behavior: Execute immediately if leading is true and not invoked yet
    if (timer === null && options.leading) {
      func.apply(context, args)
      isLeadingInvoked = true
    } else {
      isLeadingInvoked = false
    }

    // Clear previous timer to prevent multiple executions during the debounce window
    clearTimeout(timer)

    // Set the timer for trailing behavior if trailing is true and leading hasn't been invoked
    timer = setTimeout(() => {
      if (options.trailing && !isLeadingInvoked) {
        func.apply(context, args)
      }
      timer = null // Reset timer after the debounce delay
    }, wait)
  }
}
