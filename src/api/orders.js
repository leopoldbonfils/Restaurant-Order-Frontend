import { apiFetch } from './client'

export const placeOrder = (body) =>
  apiFetch('/orders', { method: 'POST', body: JSON.stringify(body) })

export const updateOrderStatus = (id, status) =>
  apiFetch(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

export const cancelOrder = (id) =>
  apiFetch(`/orders/${id}/cancel`, { method: 'PATCH' })

export const getActiveOrders = () =>
  apiFetch('/orders/active')

export const getAllOrders = () =>
  apiFetch('/orders')

export const getOrdersByCustomer = (customerId) =>
  apiFetch(`/orders/customer/${customerId}`)

export const getOrdersByTable = (tableNumber) =>
  apiFetch(`/orders/table/${encodeURIComponent(tableNumber)}`)

export const getAnalytics = () =>
  apiFetch('/orders/analytics')