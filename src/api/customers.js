import { apiFetch } from './client'

export const checkIn = (tableNumber, language = 'en') =>
  apiFetch('/customers/check-in', {
    method: 'POST',
    body: JSON.stringify({ tableNumber, preferredLanguage: language }),
  })

export const checkOut = (customerId) =>
  apiFetch(`/customers/${customerId}/check-out`, { method: 'PATCH' })

export const getCustomerById = (id) =>
  apiFetch(`/customers/${id}`)