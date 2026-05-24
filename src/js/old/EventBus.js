function createAbortError() {
  return new DOMException('Event wait was aborted.', 'AbortError')
}

function validateEventType(type) {
  if (typeof type !== 'string' || type.length === 0) {
    throw new TypeError('Event type must be a non-empty string.')
  }
}

function validateListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('Event listener must be a function.')
  }
}

function validateTimeout(timeout) {
  if (timeout === undefined) {
    return
  }

  if (!Number.isFinite(timeout) || timeout < 0) {
    throw new TypeError('Timeout must be a finite number greater than 0.')
  }
}

/**
 * A lightweight application event bus built on the native {@link EventTarget}.
 *
 * It exposes a small convenience API for subscribing, emitting, and awaiting
 * named events without adding third-party dependencies.
 *
 * @extends EventTarget
 *
 * @example
 * import EventBus from './EventBus.js'
 *
 * const eventBus = new EventBus()
 *
 * const unsubscribe = eventBus.on('user:login', event => {
 *   console.log(event.detail.userId)
 * })
 *
 * eventBus.emit('user:login', {userId: '42'})
 * unsubscribe()
 *
 * @example
 * const eventBus = new EventBus()
 *
 * eventBus.waitFor('data:ready', {timeout: 1000})
 *   .then(event => {
 *     console.log(event.detail.items)
 *   })
 *
 * eventBus.emit('data:ready', {items: ['a', 'b']})
 */
export default class EventBus extends EventTarget {
  /**
   * Subscribe to an event type.
   *
   * Returns an unsubscribe function that removes the listener with the same
   * options that were originally used to register it.
   *
   * @param {string} type The event type to subscribe to.
   * @param {EventListener} listener The event listener callback.
   * @param {boolean|AddEventListenerOptions} [options] Native listener options.
   * @returns {function(): void} Unsubscribe function.
   *
   * @example
   * const unsubscribe = eventBus.on('chat:message', event => {
   *   console.log(event.detail.text)
   * })
   *
   * unsubscribe()
   */
  on(type, listener, options) {
    validateEventType(type)
    validateListener(listener)
    this.addEventListener(type, listener, options)

    return () => {
      this.off(type, listener, options)
    }
  }

  /**
   * Remove a previously registered event listener.
   *
   * @param {string} type The subscribed event type.
   * @param {EventListener} listener The original event listener callback.
   * @param {boolean|EventListenerOptions} [options] Native listener options.
   * @returns {void}
   */
  off(type, listener, options) {
    validateEventType(type)
    validateListener(listener)
    this.removeEventListener(type, listener, options)
  }

  /**
   * Subscribe to the next occurrence of an event type.
   *
   * Returns an unsubscribe function in case the listener should be removed
   * before the event occurs.
   *
   * @param {string} type The event type to subscribe to.
   * @param {EventListener} listener The event listener callback.
   * @param {boolean|AddEventListenerOptions} [options] Native listener options.
   * @returns {function(): => void} Unsubscribe function.
   *
   * @example
   * eventBus.once('dialog:open', event => {
   *   console.log(event.detail.id)
   * })
   */
  once(type, listener, options) {
    validateEventType(type)
    validateListener(listener)

    const onceOptions = typeof options === 'boolean'
      ? {capture: options, once: true}
      : {...options, once: true}

    this.addEventListener(type, listener, onceOptions)

    return () => {
      this.off(type, listener, onceOptions)
    }
  }

  /**
   * Dispatch a {@link CustomEvent} for the provided event type.
   *
   * @param {string} type The event type to dispatch.
   * @param {*} [detail] Consumer-defined event payload.
   * @param {CustomEventInit} [options={}] Native custom event options.
   * @returns {boolean} The result of {@link EventTarget#dispatchEvent}.
   *
   * @example
   * eventBus.emit('toast:show', {
   *   message: 'Saved successfully.',
   *   level: 'success',
   * })
   */
  emit(type, detail, options = {}) {
    validateEventType(type)

    return this.dispatchEvent(new CustomEvent(type, {
      ...options,
      detail,
    }))
  }

  /**
   * Resolve with the next matching event.
   *
   * This is useful when consumers need asynchronous coordination without
   * directly coupling components together.
   *
   * @param {string} type The event type to wait for.
   * @param {Object} [options={}] Wait options.
   * @param {AbortSignal} [options.signal] Abort the wait early.
   * @param {number} [options.timeout] Reject after the given number of
   * milliseconds.
   * @returns {Promise<CustomEvent>} Promise resolving with the received event.
   *
   * @example
   * const event = await eventBus.waitFor('profile:loaded', {timeout: 2000})
   * console.log(event.detail.profile)
   */
  waitFor(type, options = {}) {
    validateEventType(type)

    const {signal, timeout} = options
    validateTimeout(timeout)

    return new Promise((resolve, reject) => {
      if (signal?.aborted === true) {
        reject(createAbortError())
        return
      }

      let timeoutId

      const cleanup = () => {
        this.removeEventListener(type, handleEvent)
        signal?.removeEventListener('abort', handleAbort)

        if (timeoutId !== undefined) {
          clearTimeout(timeoutId)
        }
      }

      const handleEvent = event => {
        cleanup()
        resolve(event)
      }

      const handleAbort = () => {
        cleanup()
        reject(createAbortError())
      }

      this.addEventListener(type, handleEvent, {once: true})
      signal?.addEventListener('abort', handleAbort, {once: true})

      if (timeout !== undefined) {
        timeoutId = setTimeout(() => {
          cleanup()
          reject(
            new Error(`Timed out waiting for event "${type}".`),
          )
        }, timeout)
      }
    })
  }
}
