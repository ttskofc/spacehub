const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, { status = 0, detail = '' } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

async function readPayload(response) {
  if (response.status === 204) return null

  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function request(path, { method = 'GET', params, body, signal } = {}) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin)

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  }

  let response
  try {
    response = await fetch(url, {
      method,
      signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new ApiError('Сервер недоступен. Проверьте, что API запущен.', {
      detail: String(error),
    })
  }

  const payload = await readPayload(response)

  if (!response.ok) {
    throw new ApiError(errorMessage(payload, response.status), {
      status: response.status,
      detail: typeof payload === 'string' ? payload : JSON.stringify(payload ?? ''),
    })
  }

  return payload
}

function errorMessage(payload, status) {
  if (typeof payload === 'string' && payload.trim()) return payload.trim()
  if (payload && typeof payload === 'object') {
    const detail = payload.detail ?? payload.error ?? payload.message
    if (typeof detail === 'string' && detail) return detail
  }
  return `Ошибка запроса (HTTP ${status})`
}

export function apiGet(path, params, options) {
  return request(path, { ...options, params })
}

export function apiPost(path, body, options) {
  return request(path, { ...options, method: 'POST', body })
}
