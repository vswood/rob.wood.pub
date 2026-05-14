import EventBus from './EventBus.js'

const EVENT_BUS_SERVICE_NAME = 'eventBus'
const SERVICE_REGISTERED_EVENT_PREFIX = 'di:registered:'
const SERVICE_REQUESTED_EVENT_PREFIX = 'di:requested:'

function validateServiceName(name) {
  if (typeof name !== 'string' || name.length === 0) {
    throw new TypeError('Service name must be a non-empty string.')
  }
}

function validateFactory(factory) {
  if (typeof factory !== 'function') {
    throw new TypeError('Service factory must be a function.')
  }
}

function createDuplicateServiceError(name) {
  return new Error(`Service "${name}" is already registered.`)
}

function createMissingServiceError(name) {
  return new Error(`Service "${name}" is not registered.`)
}

/**
 * A small dependency injection container with synchronous and asynchronous
 * service resolution.
* @param {EventBus} [eventBus=new EventBus()] The event bus used for internal
* and consumer-facing dependency events.
 *
 * The container always registers an {@link EventBus} instance as the
 * `eventBus` service. Consumers can use it directly or listen for
 * `di:requested:<serviceName>` events to register services on demand.
 *
 * @example
 * import DependencyInjectionContainer
 *   from './DependencyInjectionContainer.js'
 *
 * const container = new DependencyInjectionContainer()
 *
 * container.register('config', {
 *   apiBaseUrl: '/api',
 * })
 *
 * const config = container.get('config')
 * console.log(config.apiBaseUrl)
 *
 * @example
 * const container = new DependencyInjectionContainer()
 *
 * container.eventBus.on('di:requested:logger', () => {
 *   container.register('logger', {
 *     log: message => console.log(message),
 *   })
 * })
 *
 * const logger = await container.resolve('logger')
 * logger.log('ready')
 */
export default class DependencyInjectionContainer {
  #eventBus
  #factories
  #services

  constructor(eventBus = new EventBus()) {
    if (!(eventBus instanceof EventBus)) {
      throw new TypeError('DependencyInjectionContainer requires an EventBus.')
    }

    this.#eventBus = eventBus
    this.#factories = new Map()
    this.#services = new Map()

    this.register(EVENT_BUS_SERVICE_NAME, eventBus)
  }

  /**
   * Access the container event bus directly.
   *
   * @returns {EventBus}
   */
  get eventBus() {
    return this.#eventBus
  }

  /**
   * Check whether a service or service factory is registered.
   *
   * @param {string} name Service name.
   * @returns {boolean}
   */
  has(name) {
    validateServiceName(name)
    return this.#services.has(name) || this.#factories.has(name)
  }

  /**
   * Register an already-created service instance or value.
   *
   * Emits `di:registered:<serviceName>` after registration.
   *
   * @param {string} name Service name.
   * @param {*} service Service instance or value.
   * @returns {*} The registered service.
   *
   * @example
   * const apiClient = {get: path => fetch(path)}
   * container.register('apiClient', apiClient)
   */
  register(name, service) {
    validateServiceName(name)

    if (service === undefined) {
      throw new TypeError('Registered service value must not be undefined.')
    }

    if (this.has(name)) {
      throw createDuplicateServiceError(name)
    }

    this.#services.set(name, service)
    this.#eventBus.emit(this.#getRegisteredEventName(name), {
      name,
      service,
    })

    return service
  }

  /**
   * Register a lazy singleton factory.
   *
   * The factory runs the first time the service is resolved with `get()` or
   * `resolve()`. Its return value is cached and emitted as a registered service.
   *
   * @param {string} name Service name.
   * @param {(container: DependencyInjectionContainer) => *} factory Factory
   * function that creates the service.
   * @returns {void}
   *
   * @example
   * container.registerFactory('settingsStore', currentContainer => {
   *   const eventBus = currentContainer.get('eventBus')
   *   return {eventBus}
   * })
   */
  registerFactory(name, factory) {
    validateServiceName(name)
    validateFactory(factory)

    if (this.has(name)) {
      throw createDuplicateServiceError(name)
    }

    this.#factories.set(name, factory)
  }

  /**
   * Resolve a service immediately.
   *
   * If the service was registered via `registerFactory()`, the factory will be
   * invoked once and its result cached.
   *
   * @param {string} name Service name.
   * @returns {*} The resolved service.
   */
  get(name) {
    validateServiceName(name)

    if (this.#services.has(name)) {
      return this.#services.get(name)
    }

    if (this.#factories.has(name)) {
      return this.#createService(name)
    }

    throw createMissingServiceError(name)
  }

  /**
   * Resolve a service asynchronously.
   *
   * If the service is not registered yet, the container emits
   * `di:requested:<serviceName>` and waits for a later
   * `di:registered:<serviceName>` event.
   *
   * @param {string} name Service name.
   * @param {Object} [options] Wait options forwarded to
   * {@link EventBus#waitFor}.
   * @param {AbortSignal} [options.signal] Abort the wait early.
   * @param {number} [options.timeout] Reject after the given number of
   * milliseconds.
   * @returns {Promise<*>} Promise resolving with the service.
   *
   * @example
   * container.eventBus.on('di:requested:userStore', () => {
   *   container.register('userStore', {currentUser: null})
   * })
   *
   * const userStore = await container.resolve('userStore')
   */
  resolve(name, options) {
    validateServiceName(name)

    if (this.has(name)) {
      return Promise.resolve(this.get(name))
    }

    const waitForRegistration = this.#eventBus
      .waitFor(this.#getRegisteredEventName(name), options)
      .then(event => event.detail.service)

    this.#eventBus.emit(this.#getRequestedEventName(name), {
      container: this,
      name,
    })

    return waitForRegistration
  }

  #createService(name) {
    const factory = this.#factories.get(name)
    const service = factory(this)

    if (service === undefined) {
      throw new TypeError(
        `Factory for service "${name}" returned undefined.`,
      )
    }

    this.#factories.delete(name)
    this.#services.set(name, service)
    this.#eventBus.emit(this.#getRegisteredEventName(name), {
      name,
      service,
    })

    return service
  }

  #getRegisteredEventName(name) {
    return `${SERVICE_REGISTERED_EVENT_PREFIX}${name}`
  }

  #getRequestedEventName(name) {
    return `${SERVICE_REQUESTED_EVENT_PREFIX}${name}`
  }
}
