export class SyncRequestError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'SyncRequestError'
    this.status = options.status ?? null
    this.statusText = options.statusText ?? null
    this.isTransport = Boolean(options.isTransport)
    this.cause = options.cause
  }
}

export function withBearerAuthHeaders(token, headers = {}) {
  if (!token) return { ...headers }
  return {
    ...headers,
    Authorization: `Bearer ${token}`
  }
}

export async function readSyncError(res) {
  const fallback = `API error: HTTP ${res.status}${res.statusText ? ` ${res.statusText}` : ''}`
  const contentType = res.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const payload = await res.json().catch(() => null)
    if (payload?.error) return payload.error
  }

  const text = await res.text().catch(() => '')
  return text.trim() || fallback
}

export async function requestJson(baseUrl, path, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    parseJson = true,
    token = null,
    fetchImpl = fetch,
    closeConnection = false,
  } = options

  const requestHeaders = withBearerAuthHeaders(token, headers)
  if (closeConnection) {
    requestHeaders.Connection = 'close'
  }

  let res
  try {
    res = await fetchImpl(`${baseUrl}${path}`, {
      method,
      headers: requestHeaders,
      body
    })
  } catch (error) {
    throw new SyncRequestError(`Could not reach sync server: ${error.message}`, {
      isTransport: true,
      cause: error
    })
  }

  if (!res.ok) {
    throw new SyncRequestError(await readSyncError(res), {
      status: res.status,
      statusText: res.statusText
    })
  }

  if (!parseJson) return res
  return res.json()
}
