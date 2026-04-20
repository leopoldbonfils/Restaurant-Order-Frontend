import { apiFetch } from './client'

export const getAvailableMenu = () =>
  apiFetch('/menu-items')

export const getAllMenu = () =>
  apiFetch('/menu-items/all')

export const getCategories = () =>
  apiFetch('/menu-items/categories')

export const toggleAvailability = (id) =>
  apiFetch(`/menu-items/${id}/toggle-availability`, { method: 'PATCH' })

export const createMenuItem = (body) =>
  apiFetch('/menu-items', { method: 'POST', body: JSON.stringify(body) })

export const updateMenuItem = (id, body) =>
  apiFetch(`/menu-items/${id}`, { method: 'PUT', body: JSON.stringify(body) })

export const deleteMenuItem = (id) =>
  apiFetch(`/menu-items/${id}`, { method: 'DELETE' })