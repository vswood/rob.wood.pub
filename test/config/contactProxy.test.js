import {describe, expect, it} from 'vitest'
import {
  createProxyRequestHeaders,
  createProxyRequestUrl,
  shouldProxyContactRequest,
} from '../../src/config/contactProxy.js'

describe('contact proxy helpers', () => {
  it('matches only the contact route', () => {
    expect(shouldProxyContactRequest('/api/contact')).toBe(true)
    expect(shouldProxyContactRequest('/api/contact/extra')).toBe(false)
    expect(shouldProxyContactRequest('/')).toBe(false)
  })

  it('rewrites the request url to the worker origin', () => {
    const targetUrl = createProxyRequestUrl('http://localhost:8081/api/contact?debug=1')

    expect(targetUrl.toString()).toBe('http://127.0.0.1:8787/api/contact?debug=1')
  })

  it('drops hop-by-hop headers when proxying', () => {
    const headers = createProxyRequestHeaders({
      connection: 'keep-alive',
      'content-length': '123',
      'content-type': 'multipart/form-data; boundary=test',
      host: 'localhost:8081',
      'x-request-id': 'abc123',
    })

    expect(headers.get('connection')).toBe(null)
    expect(headers.get('content-length')).toBe(null)
    expect(headers.get('host')).toBe(null)
    expect(headers.get('content-type')).toBe('multipart/form-data; boundary=test')
    expect(headers.get('x-request-id')).toBe('abc123')
  })
})
