const BASE = '/api'

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('df_token')

  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    })

    let data = null
    try {
      data = await res.json()
    } catch (e) {
      // Response body is not JSON
      data = null
    }

    if (!res.ok) {
      const msg = data?.message || data?.error || `Request failed (${res.status})`
      const error = new Error(msg)
      error.status = res.status
      error.response = { status: res.status, data }
      throw error
    }

    return data
  } catch (err) {
    // Re-throw with enhanced error information
    if (err instanceof Error) {
      throw err
    }
    throw new Error('Network error or invalid response')
  }
}