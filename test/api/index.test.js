import {beforeEach, describe, expect, it, vi} from 'vitest'

const hoisted = vi.hoisted(() => {
  const mailgunMessagesCreate = vi.fn()
  const mailgunClientFactory = vi.fn(() => ({
    messages: {
      create: mailgunMessagesCreate,
    },
  }))
  const mailgunConstructor = vi.fn(class {
    constructor() {
      this.client = mailgunClientFactory
    }
  })
  const turnstileFetch = vi.fn()

  return {
    mailgunMessagesCreate,
    mailgunClientFactory,
    mailgunConstructor,
    turnstileFetch,
  }
})

vi.mock('mailgun.js', () => ({
  default: hoisted.mailgunConstructor,
}))

const worker = await import('../../src/api/index.js')

const baseEnv = {
  ASSETS: {
    fetch: vi.fn(),
  },
  FORMMAIL_FROM: 'Portfolio Webform <postmaster@mg.example.com>',
  FORMMAIL_TO: 'Rob Wood <rob@example.com>',
  MAILGUN_API_KEY: 'test-mailgun-key',
  MAILGUN_DOMAIN: 'mg.example.com',
  TURNSTILE_SECRET: 'test-turnstile-secret',
}

function createFormData(overrides = {}) {
  const formData = new FormData()

  formData.set('email', 'dev@example.com')
  formData.set('name', 'Dev User')
  formData.set('subject', 'Local dev check')
  formData.set('company', 'Example LLC')
  formData.set('message', 'Hello <world>\nSecond line')
  formData.set('phone', '(313) 555-1212')
  formData.set('url', 'https://example.com')
  formData.set('question', '')
  formData.set('cf-turnstile-response', 'turnstile-token')

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      formData.delete(key)
    } else {
      formData.set(key, value)
    }
  }

  return formData
}

function createRequest(formData, method = 'POST') {
  return new Request('http://localhost/api/contact', {
    method,
    body: formData,
  })
}

beforeEach(() => {
  hoisted.mailgunMessagesCreate.mockReset()
  hoisted.mailgunClientFactory.mockClear()
  hoisted.mailgunConstructor.mockClear()
  hoisted.turnstileFetch.mockReset()
  vi.stubGlobal('fetch', hoisted.turnstileFetch)
})

describe('contact worker', () => {
  it('accepts a valid contact submission', async () => {
    hoisted.turnstileFetch.mockResolvedValue(
      new Response(JSON.stringify({success: true}), {status: 200}),
    )
    hoisted.mailgunMessagesCreate.mockResolvedValue({id: '<msg-id>', message: 'Queued'})

    const request = createRequest(createFormData())
    const response = await worker.default.fetch(request, baseEnv, {})

    expect(response.status).toBe(202)
    expect(response.headers.get('access-control-allow-origin')).toBe('*')

    const body = await response.json()
    expect(body).toEqual({
      ok: true,
      mailgun: {
        id: '<msg-id>',
        message: 'Queued',
      },
    })

    expect(hoisted.turnstileFetch).toHaveBeenCalledTimes(1)
    const turnstileRequest = hoisted.turnstileFetch.mock.calls[0][1]
    expect(turnstileRequest.method).toBe('POST')
    expect(turnstileRequest.body.get('secret')).toBe(baseEnv.TURNSTILE_SECRET)
    expect(turnstileRequest.body.get('response')).toBe('turnstile-token')
    expect(turnstileRequest.body.get('remoteip')).toBe('')

    expect(hoisted.mailgunConstructor).toHaveBeenCalledTimes(1)
    expect(hoisted.mailgunClientFactory).toHaveBeenCalledTimes(1)
    expect(hoisted.mailgunMessagesCreate).toHaveBeenCalledTimes(1)

    const [domain, payload] = hoisted.mailgunMessagesCreate.mock.calls[0]
    expect(domain).toBe(baseEnv.MAILGUN_DOMAIN)
    expect(payload.get('from')).toBe(baseEnv.FORMMAIL_FROM)
    expect(payload.get('to')).toBe(baseEnv.FORMMAIL_TO)
    expect(payload.get('subject')).toBe('Portfolio contact: Local dev check')
    expect(payload.get('text')).toContain('Website: https://example.com')
    expect(payload.get('text')).toContain('Hello <world>')
    expect(payload.get('html')).toContain('&lt;world&gt;')
    expect(payload.get('html')).toContain('<p><strong>Website:</strong> https://example.com</p>')
  })

  it('returns a validation error for missing fields', async () => {
    hoisted.turnstileFetch.mockResolvedValue(
      new Response(JSON.stringify({success: true}), {status: 200}),
    )

    const request = createRequest(createFormData({name: undefined}))
    const response = await worker.default.fetch(request, baseEnv, {})

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Missing required form field: name',
    })
    expect(hoisted.turnstileFetch).not.toHaveBeenCalled()
    expect(hoisted.mailgunMessagesCreate).not.toHaveBeenCalled()
  })

  it('returns a method error for non-post requests', async () => {
    const request = new Request('http://localhost/api/contact', {method: 'GET'})
    const response = await worker.default.fetch(request, baseEnv, {})

    expect(response.status).toBe(405)
    expect(await response.json()).toEqual({
      error: 'Method not allowed',
    })
  })

  it('returns the CORS preflight response', async () => {
    const request = new Request('http://localhost/api/contact', {method: 'OPTIONS'})
    const response = await worker.default.fetch(request, baseEnv, {})

    expect(response.status).toBe(204)
    expect(response.headers.get('access-control-allow-origin')).toBe('*')
    expect(response.headers.get('access-control-allow-methods')).toBe('POST, OPTIONS')
  })
})
