import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import handleFormSubmit from '../../src/js/handleFormSubmit.js'

describe('handleFormSubmit error handling', () => {
  let mockEvent
  let mockFetch
  let mockMessageEl
  let mockErrorMsgEl

  beforeEach(() => {
    vi.useFakeTimers()

    mockEvent = {
      preventDefault: vi.fn(),
      target: {}
    }

    // Mock FormData
    const mockFormData = new Map([
      ['email', 'test@example.com'],
      ['name', 'Test'],
      ['company', 'Company'],
      ['phone', '123-456-7890'],
      ['subject', 'Subject'],
      ['message', 'Message'],
      ['question', ''] // valid question
    ])
    vi.stubGlobal('FormData', class {
      entries() { return mockFormData.entries() }
    })

    const createMockEl = () => ({
      style: {},
      classList: { add: vi.fn(), remove: vi.fn() },
      querySelector: vi.fn(() => createMockEl()),
      nextElementSibling: {
        querySelector: vi.fn(() => createMockEl())
      }
    })

    mockMessageEl = createMockEl()
    mockErrorMsgEl = createMockEl()

    const querySelectorMock = vi.fn((sel) => {
      if (sel === '.form-messages') return mockMessageEl
      if (sel === '.error.message') return mockErrorMsgEl
      if (sel === '.success.message') return createMockEl()
      return createMockEl()
    })

    vi.stubGlobal('document', {
      getElementById: vi.fn(() => createMockEl()),
      querySelectorAll: vi.fn((sel) => {
        if (sel === '.is-invalid') return [] // return valid state
        if (sel === '.form-row') return [createMockEl()]
        return []
      }),
      querySelector: querySelectorMock
    })

    mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('displays server error message when fetch throws an error', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'))

    await handleFormSubmit(mockEvent)

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockErrorMsgEl.style.display).toBe('block')
    expect(mockErrorMsgEl.innerHTML).toBe('Server error: Network failure')
  })

  it('displays unknown error message when error has no message', async () => {
    mockFetch.mockRejectedValue({})

    await handleFormSubmit(mockEvent)

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockErrorMsgEl.style.display).toBe('block')
    expect(mockErrorMsgEl.innerHTML).toBe('Server error: Unknown')
  })
})
