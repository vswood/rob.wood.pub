import DependencyInjectionContainer from '../src/js/DependencyInjectionContainer.js'
import EventBus from '../src/js/EventBus.js'
import {describe, test, expect, vi} from 'vitest'

describe('DependencyInjectionContainer', () => {
  test('registers the event bus as a service', () => {
    const container = new DependencyInjectionContainer()
    const eventBus = container.get('eventBus')

    expect(eventBus).toBeInstanceOf(EventBus)
    expect(eventBus).toBe(container.eventBus)
  })

  test('registers and returns services', () => {
    const container = new DependencyInjectionContainer()
    const logger = {log: vi.fn()}

    container.register('logger', logger)

    expect(container.has('logger')).toBe(true)
    expect(container.get('logger')).toBe(logger)
  })

  test('creates singleton services from factories', () => {
    const container = new DependencyInjectionContainer()
    const createLogger = vi.fn(() => ({log: vi.fn()}))

    container.registerFactory('logger', createLogger)

    const loggerOne = container.get('logger')
    const loggerTwo = container.get('logger')

    expect(createLogger).toHaveBeenCalledTimes(1)
    expect(loggerOne).toBe(loggerTwo)
  })

  test('resolves services that are registered later', async () => {
    const container = new DependencyInjectionContainer()
    const logger = {log: vi.fn()}
    const resolvePromise = container.resolve('logger')

    setTimeout(() => {
      container.register('logger', logger)
    }, 0)

    await expect(resolvePromise).resolves.toBe(logger)
  })

  test('emits service request events for on-demand registration', async () => {
    const container = new DependencyInjectionContainer()
    const logger = {log: vi.fn()}

    container.eventBus.on('di:requested:logger', () => {
      container.register('logger', logger)
    })

    await expect(container.resolve('logger')).resolves.toBe(logger)
  })
})
