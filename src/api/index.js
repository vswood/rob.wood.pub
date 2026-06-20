import Mailgun from 'mailgun.js'
import escapeHtml from 'escape-html'

const CONTACT_PATH = '/api/contact'
const MAILGUN_API_BASE_URL = 'https://api.mailgun.net'
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

class ConfigurationError extends Error {}

class RequestValidationError extends Error {}

class ServiceResponseError extends Error {
  constructor(message, response) {
    super(message)
    this.response = response
  }
}

function getRequiredEnv(env, key) {
  const value = env[key]

  if (typeof value === 'string' && value.trim() !== '') {
    return value
  }

  throw new ConfigurationError(`Missing required environment variable: ${key}`)
}

function createJsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  })
}

function createMethodResponse() {
  return createJsonResponse({error: 'Method not allowed'}, 405)
}

function createNotFoundResponse() {
  return createJsonResponse({error: 'Not found'}, 404)
}

function createAcceptedResponse(mailgunResponse) {
  return createJsonResponse({
    ok: true,
    mailgun: mailgunResponse,
  }, 202)
}

async function verifyTurnstileToken(env, token, remoteIp) {
  const payload = new FormData()

  const secret = await env.TURNSTILE_SECRET.get()
  payload.set('secret', secret)
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

async function sendMailgunMessage(env, contactMessage) {
  let res
  try {
    res = await mailgunClient.messages.create(env.MAILGUN_DOMAIN.get(), createMailgunPayload(env, contactMessage))
  } catch (error) {
    throw new ServiceResponseError('Mailgun delivery failed', {
      status: response.status,
      body,
    })
  }
  return res
}

async function processContactRequest(request, env) {
  const formData = await request.formData()
  const mailgun = new Mailgun(FormData)
  const apiKey = await env.MAILGUN_API_KEY.get()
  const domain = getRequiredEnv(env, 'MAILGUN_DOMAIN')
  const mailgunClient = mailgun.client({
    'username': 'api',
    'key': apiKey,
    'url': MAILGUN_API_BASE_URL,
    useFetch: true,
  })

  const token = getRequiredStringValue(formData, 'cf-turnstile-response')
  const remoteIp = request.headers.get('CF-Connecting-IP') ?? ''
  const contactMessage = getContactMessage(formData)

  await verifyTurnstileToken(env, token, remoteIp)

  return sendMailgunMessage(env, contactMessage)
}

async function handleContactRequest(request, env) {
  if (request.method !== 'POST') {
    return createMethodResponse()
  }

  const mailgunResponse = await processContactRequest(request, env)

  return createAcceptedResponse(mailgunResponse)
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

function formatOptionalLine(label, value) {
  if (value === '') {
    return ''
  }

  return `${label}: ${value}\n`
}

function createMessageText(contactMessage) {
  return [
    `Name: ${contactMessage.name}`,
    `Email: ${contactMessage.email}`,
    `Phone: ${contactMessage.phone}`,
    `Company: ${contactMessage.company}`,
    formatOptionalLine('Website', contactMessage.url).trim(),
    '',
    contactMessage.message,
  ].filter(line => line !== '').join('\n')
}

function createMessageHtml(contactMessage) {
  const escapedMessage = escapeHtml(contactMessage.message).replaceAll('\n', '<br>')

  return `
    <p><strong>Name:</strong> ${escapeHtml(contactMessage.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(contactMessage.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(contactMessage.phone)}</p>
    <p><strong>Company:</strong> ${escapeHtml(contactMessage.company)}</p>
    ${formatOptionalHtml('Website', contactMessage.url)}
    <p><strong>Message:</strong><br>${escapedMessage}</p>
  `
}

function createMailgunPayload(env, contactMessage) {
  const payload = new FormData()
  payload.set('from', env.FORMMAIL_FROM.get())
  payload.set('to', env.FORMMAIL_TO.get())
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
      return createNotFoundResponse()
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204, // 204 No Content is ideal for preflight responses
        headers: {
          "Access-Control-Allow-Origin": "rob.wood.pub",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      })
    }

    return handleContactRequest(request, env)
  }
}
