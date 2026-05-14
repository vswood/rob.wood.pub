import EventBus from '../src/js/EventBus.js'
import {describe, test, expect, vi} from 'vitest'

describe('EventBus', () => {
  test('emits events to listeners', () => {
    const eventBus = new EventBus()
    const detail = {value: 42}
    let receivedDetail

    eventBus.on('ready', event => {
      receivedDetail = event.detail
    })

    eventBus.emit('ready', detail)

    expect(receivedDetail).toBe(detail)
  })

  test('removes listeners through the returned unsubscribe function', () => {
    const eventBus = new EventBus()
    const listener = vi.fn()
    const unsubscribe = eventBus.on('ready', listener)

    unsubscribe()
    eventBus.emit('ready', {value: 1})

    expect(listener).not.toHaveBeenCalled()
  })

  test('registers one-time listeners', () => {
    const eventBus = new EventBus()
    const listener = vi.fn()

    eventBus.once('ready', listener)
    eventBus.emit('ready', {value: 1})
    eventBus.emit('ready', {value: 2})

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test('waits for the next matching event', async () => {
    const eventBus = new EventBus()
    const waitPromise = eventBus.waitFor('ready')

    setTimeout(() => {
      eventBus.emit('ready', {value: 42})
    }, 0)

    const event = await waitPromise

    expect(event.detail).toEqual({value: 42})
  })

  test('rejects when waitFor times out', async () => {
    const eventBus = new EventBus()

    await expect(eventBus.waitFor('ready', {timeout: 10})).rejects.toThrow(
      'Timed out waiting for event "ready".',
    )
  })
})
