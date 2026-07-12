const CONTACT_PATH = '/api/contact'
const WORKER_DEV_ORIGIN = 'http://127.0.0.1:8787'
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
])

function shouldProxyContactRequest(pathname) {
  return pathname === CONTACT_PATH
}

function createProxyRequestUrl(requestUrl, workerOrigin = WORKER_DEV_ORIGIN) {
  const targetUrl = new URL(requestUrl)
  const originUrl = new URL(workerOrigin)

  targetUrl.protocol = originUrl.protocol
  targetUrl.host = originUrl.host

  return targetUrl
}

function createProxyRequestHeaders(headers) {
  const proxyHeaders = new Headers()

  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined || HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      continue
    }

    if (Array.isArray(value)) {
      proxyHeaders.set(key, value.join(', '))
      continue
    }

    proxyHeaders.set(key, value)
  }

  return proxyHeaders
}

async function readRequestBody(request) {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return undefined
  }

  const chunks = []

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  if (chunks.length === 0) {
    return undefined
  }

  return Buffer.concat(chunks)
}

async function forwardContactRequest(request, workerOrigin = WORKER_DEV_ORIGIN) {
  const requestUrl = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`)
  const targetUrl = createProxyRequestUrl(requestUrl.toString(), workerOrigin)
  const body = await readRequestBody(request)
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: createProxyRequestHeaders(request.headers),
    ...(body === undefined ? {} : {body, duplex: 'half'}),
  })

  const responseBody = await response.arrayBuffer()
  const responseHeaders = new Headers(response.headers)

  responseHeaders.delete('content-encoding')
  responseHeaders.delete('content-length')

  return new Response(responseBody, {
    status: response.status,
    headers: responseHeaders,
  })
}

function createContactProxyMiddleware(options = {}) {
  const workerOrigin = options.workerOrigin ?? WORKER_DEV_ORIGIN

  return async function contactProxyMiddleware(request, response, next) {
    const requestUrl = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`)

    if (!shouldProxyContactRequest(requestUrl.pathname)) {
      return next()
    }

    try {
      const proxiedResponse = await forwardContactRequest(request, workerOrigin)
      response.statusCode = proxiedResponse.status

      proxiedResponse.headers.forEach((value, key) => {
        response.setHeader(key, value)
      })

      const body = await proxiedResponse.arrayBuffer()
      return response.end(Buffer.from(body))
    } catch (error) {
      response.statusCode = 502
      response.setHeader('content-type', 'application/json')
      return response.end(JSON.stringify({
        error: 'Failed to proxy /api/contact to wrangler dev',
        detail: error instanceof Error ? error.message : String(error),
      }))
    }
  }
}

export {
  createContactProxyMiddleware,
  createProxyRequestHeaders,
  createProxyRequestUrl,
  forwardContactRequest,
  readRequestBody,
  shouldProxyContactRequest,
}
