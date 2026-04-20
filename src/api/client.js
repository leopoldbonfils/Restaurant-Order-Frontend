const BASE = '/api'

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('df_token')

  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const msg = data?.message || `Request failed (${res.status})`
    throw new Error(msg)
  }

  return data
}