import Mailgun from 'mailgun.js'
import escapeHtml from 'escape-html'

const CONTACT_PATH = '/api/contact'
const MAILGUN_API_BASE_URL = 'https://api.mailgun.net'
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const CONTACT_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

class ConfigurationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ConfigurationError'
  }
}

class RequestValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'RequestValidationError'
  }
}

class ServiceResponseError extends Error {
  constructor(message, response) {
    super(message)
    this.name = 'ServiceResponseError'
    this.response = response
  }
}

function createErrorResponse(error) {
  if (error instanceof RequestValidationError) {
    return createJsonResponse({error: error.message}, 400)
  }

  if (error instanceof ConfigurationError) {
    return createJsonResponse({error: error.message}, 500)
  }

  if (error instanceof ServiceResponseError) {
    const status = error.response?.status ?? 502
    return createJsonResponse({
      error: error.message,
      response: error.response,
    }, status)
  }

  throw error
}

function getStringValue(formData, key) {
  const value = formData.get(key)

  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

function getRequiredStringValue(formData, key) {
  const value = getStringValue(formData, key)

  if (value !== '') {
    return value
  }

  throw new RequestValidationError(`Missing required form field: ${key}`)
}

function getRequiredEnvValue(env, key) {
  const value = env[key]

  if (typeof value === 'string' && value.trim() !== '') {
    return value.trim()
  }

  throw new ConfigurationError(`Missing required environment variable: ${key}`)
}

function createJsonResponse(body, status, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      ...CONTACT_CORS_HEADERS,
      ...headers,
    },
  })
}

function createMethodResponse() {
  return createJsonResponse({error: 'Method not allowed'}, 405)
}

function createAcceptedResponse(mailgunResponse) {
  return createJsonResponse({
    ok: true,
    mailgun: mailgunResponse,
  }, 202)
}

async function verifyTurnstileToken(env, token, remoteIp) {
  const payload = new FormData()
  payload.set('secret', getRequiredEnvValue(env, 'TURNSTILE_SECRET'))
  payload.set('response', token)
  payload.set('remoteip', remoteIp)

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    body: payload,
  })
  const data = await response.json()

  if (data.success === true) {
    return data
  }

  throw new ServiceResponseError('Turnstile verification failed', {
    status: response.status,
    body: data,
  })
}

function createMailgunClient(env) {
  const mailgun = new Mailgun(FormData)

  return mailgun.client({
    username: 'api',
    key: getRequiredEnvValue(env, 'MAILGUN_API_KEY'),
    url: MAILGUN_API_BASE_URL,
    useFetch: true,
  })
}

async function sendMailgunMessage(env, mailgunClient, contactMessage) {
  try {
    return await mailgunClient.messages.create(
      getRequiredEnvValue(env, 'MAILGUN_DOMAIN'),
      createMailgunPayload(env, contactMessage),
    )
  } catch (error) {
    throw new ServiceResponseError('Mailgun delivery failed', {
      cause: error instanceof Error ? error.message : String(error),
      status: error?.status,
      body: error?.body ?? error?.details ?? error?.response?.body,
    })
  }
}

async function processContactRequest(request, env) {
  const formData = await request.formData()
  const token = getRequiredStringValue(formData, 'cf-turnstile-response')
  const remoteIp = request.headers.get('CF-Connecting-IP') ?? ''
  const contactMessage = getContactMessage(formData)

  await verifyTurnstileToken(env, token, remoteIp)

  const mailgunClient = createMailgunClient(env)

  return sendMailgunMessage(env, mailgunClient, contactMessage)
}

async function handleContactRequest(request, env) {
  if (request.method !== 'POST') {
    return createMethodResponse()
  }

  try {
    const mailgunResponse = await processContactRequest(request, env)

    return createAcceptedResponse(mailgunResponse)
  } catch (error) {
    return createErrorResponse(error)
  }
}

function formatOptionalLine(label, value) {
  if (value === '') {
    return ''
  }

  return `${label}: ${value}`
}

function getContactMessage(formData) {
  return {
    email: getRequiredStringValue(formData, 'email'),
    name: getRequiredStringValue(formData, 'name'),
    subject: getRequiredStringValue(formData, 'subject'),
    company: getRequiredStringValue(formData, 'company'),
    message: getRequiredStringValue(formData, 'message'),
    phone: getRequiredStringValue(formData, 'phone'),
    url: getStringValue(formData, 'url'),
  }
}

function createMessageText(contactMessage) {
  const lines = [
    `Name: ${contactMessage.name}`,
    `Email: ${contactMessage.email}`,
    `Phone: ${contactMessage.phone}`,
    `Company: ${contactMessage.company}`,
  ]

  if (contactMessage.url !== '') {
    lines.push(formatOptionalLine('Website', contactMessage.url))
  }

  lines.push('', contactMessage.message)

  return lines.join('\n')
}

function createMessageHtml(contactMessage) {
  const escapedMessage = escapeHtml(contactMessage.message).replaceAll('\n', '<br>')
  const websiteLine = formatOptionalHtml('Website', contactMessage.url)

  return `
    <p><strong>Name:</strong> ${escapeHtml(contactMessage.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(contactMessage.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(contactMessage.phone)}</p>
    <p><strong>Company:</strong> ${escapeHtml(contactMessage.company)}</p>
    ${websiteLine}
    <p><strong>Message:</strong><br>${escapedMessage}</p>
  `
}

function formatOptionalHtml(label, value) {
  if (value === '') {
    return ''
  }

  return `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`
}

function createMailgunPayload(env, contactMessage) {
  const payload = new FormData()
  payload.set('from', getRequiredEnvValue(env, 'FORMMAIL_FROM'))
  payload.set('to', getRequiredEnvValue(env, 'FORMMAIL_TO'))
  payload.set('h:Reply-To', contactMessage.email)
  payload.set('subject', `Portfolio contact: ${contactMessage.subject}`)
  payload.set('text', createMessageText(contactMessage))
  payload.set('html', createMessageHtml(contactMessage))

  return payload
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    if (url.pathname !== CONTACT_PATH) {
      return env.ASSETS.fetch(request)
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CONTACT_CORS_HEADERS,
      })
    }

    return handleContactRequest(request, env)
  }
}
