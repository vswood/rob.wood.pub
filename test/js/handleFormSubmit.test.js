// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import handleFormSubmit from '../../src/js/handleFormSubmit.js'

describe('handleFormSubmit', () => {
  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = `
      <form id="contact-form">
        <div class="form-messages" style="display: none;">
          <div class="success message" style="display: none;">Success</div>
          <div class="error message" style="display: none;">Error</div>
        </div>

        <div class="form-row">
          <input id="input-email" name="email" value="test@example.com">
          <label>
            <span class="hint">Hint</span>
            <span class="valid" style="display: none;">Valid</span>
            <span class="invalid" style="display: none;">Invalid</span>
          </label>
        </div>

        <div class="form-row">
          <input id="input-name" name="name" value="Test User">
          <label>
            <span class="hint">Hint</span>
            <span class="valid" style="display: none;">Valid</span>
            <span class="invalid" style="display: none;">Invalid</span>
          </label>
        </div>

        <div class="form-row">
          <input id="input-company" name="company" value="Test Company">
          <label>
            <span class="hint">Hint</span>
            <span class="valid" style="display: none;">Valid</span>
            <span class="invalid" style="display: none;">Invalid</span>
          </label>
        </div>

        <div class="form-row">
          <input id="input-phone" name="phone" value="123-456-7890">
          <label>
            <span class="hint">Hint</span>
            <span class="valid" style="display: none;">Valid</span>
            <span class="invalid" style="display: none;">Invalid</span>
          </label>
        </div>

        <div class="form-row">
          <input id="input-subject" name="subject" value="Test Subject">
          <label>
            <span class="hint">Hint</span>
            <span class="valid" style="display: none;">Valid</span>
            <span class="invalid" style="display: none;">Invalid</span>
          </label>
        </div>

        <div class="form-row">
          <input id="input-message" name="message" value="Test Message">
          <label>
            <span class="hint">Hint</span>
            <span class="valid" style="display: none;">Valid</span>
            <span class="invalid" style="display: none;">Invalid</span>
          </label>
        </div>

        <input type="text" name="question" value="" style="display:none;">
      </form>
    `

    // Mock fetch
    global.fetch = vi.fn()
    // Mock setTimeout
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  const createEvent = (formId = 'contact-form') => {
    const form = document.getElementById(formId)
    return {
      preventDefault: vi.fn(),
      target: form
    }
  }

  it('should prevent default and submit valid form successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })

    const event = createEvent()
    await handleFormSubmit(event)

    // flush microtasks because postForm is awaited
    await new Promise(resolve => process.nextTick(resolve))

    expect(event.preventDefault).toHaveBeenCalled()
    expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    }))

    // Check form messages UI updates for success
    const messages = document.querySelector('.form-messages')
    const successMsg = document.querySelector('.success.message')
    const rows = document.querySelectorAll('.form-row')

    expect(messages.style.display).toBe('flex')
    expect(successMsg.style.display).toBe('block')
    rows.forEach(r => expect(r.style.display).toBe('none'))
  })

  it('should prevent default and display validation error for invalid inputs', async () => {
    // Bad email and phone
    document.getElementById('input-email').value = 'bad-email'
    document.getElementById('input-phone').value = 'bad-phone'

    const event = createEvent()
    await handleFormSubmit(event)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(global.fetch).not.toHaveBeenCalled()

    // Check validation styling
    const emailInput = document.getElementById('input-email')
    const phoneInput = document.getElementById('input-phone')

    expect(emailInput.classList.contains('is-invalid')).toBe(true)
    expect(phoneInput.classList.contains('is-invalid')).toBe(true)

    // Check labels
    const emailInvalidLabel = emailInput.nextElementSibling.querySelector('.invalid')
    expect(emailInvalidLabel.style.display).toBe('inline')
  })

  it('should handle honeypot field (show success immediately)', async () => {
    document.querySelector('input[name="question"]').value = 'spam'
    const event = createEvent()

    await handleFormSubmit(event)

    // Because question is filled, it immediately calls formMessage()
    const messages = document.querySelector('.form-messages')
    const successMsg = document.querySelector('.success.message')
    expect(messages.style.display).toBe('flex')
    expect(successMsg.style.display).toBe('block')

    // We expect fetch to still be called if other fields are valid, based on current implementation
    // Or at least it prevents actual form submission in most implementations, but in this implementation it still calls postForm if valid!
    // But testing the honeypot feature
  })

  it('should handle server non-ok response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({})
    })

    const event = createEvent()
    await handleFormSubmit(event)

    await new Promise(resolve => process.nextTick(resolve))

    const messages = document.querySelector('.form-messages')
    const errorMsg = document.querySelector('.error.message')

    expect(messages.style.display).toBe('flex')
    expect(errorMsg.style.display).toBe('block')
    expect(errorMsg.innerHTML).toBe('Server error: 500')
  })

  it('should handle server fetch exception', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'))

    const event = createEvent()
    await handleFormSubmit(event)

    await new Promise(resolve => process.nextTick(resolve))

    const messages = document.querySelector('.form-messages')
    const errorMsg = document.querySelector('.error.message')

    expect(messages.style.display).toBe('flex')
    expect(errorMsg.style.display).toBe('block')
    expect(errorMsg.innerHTML).toBe('Server error: Network error')
  })

  it('should handle server fetch exception without error message', async () => {
    global.fetch.mockRejectedValueOnce({})

    const event = createEvent()
    await handleFormSubmit(event)

    await new Promise(resolve => process.nextTick(resolve))

    const messages = document.querySelector('.form-messages')
    const errorMsg = document.querySelector('.error.message')

    expect(messages.style.display).toBe('flex')
    expect(errorMsg.style.display).toBe('block')
    expect(errorMsg.innerHTML).toBe('Server error: Unknown')
  })

  it('should test formReset functionality', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })

    const event = createEvent()
    await handleFormSubmit(event)

    await new Promise(resolve => process.nextTick(resolve))

    const messages = document.querySelector('.form-messages')
    const rows = document.querySelectorAll('.form-row')

    expect(messages.style.display).toBe('flex')
    rows.forEach(r => expect(r.style.display).toBe('none'))

    vi.advanceTimersByTime(8000)

    expect(messages.style.display).toBe('none')
    rows.forEach(r => expect(r.style.display).toBe('flex'))
  })
})
