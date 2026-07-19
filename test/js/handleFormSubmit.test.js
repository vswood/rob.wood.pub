/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import handleFormSubmit from '../../src/js/handleFormSubmit.js'

describe('handleFormSubmit', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="contact-form">
        <input name="email" value="test@example.com" id="input-email" /> <label></label>
        <input name="name" value="Test Name" id="input-name" /> <label></label>
        <input name="company" value="Test Co" id="input-company" /> <label></label>
        <input name="phone" value="123-456-7890" id="input-phone" /> <label></label>
        <input name="subject" value="Subject" id="input-subject" /> <label></label>
        <input name="message" value="Message" id="input-message" /> <label></label>
        <input name="question" value="" />
      </form>
      <div class="form-row"></div>
      <div class="form-messages" style="display: none;"></div>
      <div class="success message" style="display: none;"></div>
      <div class="error message" style="display: none;"></div>
    `
    // Mock the hint/valid/invalid elements inside labels
    document.querySelectorAll('label').forEach(label => {
      label.innerHTML = `
        <span class="hint"></span>
        <span class="valid"></span>
        <span class="invalid"></span>
      `
    })
  })

  it('should handle fetch 500 error status', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({})
    })
    vi.stubGlobal('fetch', fetchMock)

    // We need to wait for setTimeout
    vi.useFakeTimers()

    const event = {
      preventDefault: vi.fn(),
      target: document.getElementById('contact-form')
    }

    await handleFormSubmit(event)

    expect(fetchMock).toHaveBeenCalled()
    const errorMsg = document.querySelector('.error.message')
    expect(errorMsg.style.display).toBe('block')
    expect(errorMsg.innerHTML).toBe('Server error: 500')

    vi.useRealTimers()
  })
})
