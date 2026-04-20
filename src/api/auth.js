import { apiFetch } from './client'

export const login = (email, password) =>
  apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

export const register = (email, password, fullName, role) =>
  apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, fullName, role }),
  })