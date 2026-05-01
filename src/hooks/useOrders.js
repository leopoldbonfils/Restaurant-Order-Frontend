import { useState, useCallback } from 'react'
import { placeOrder as apiPlaceOrder, getOrdersByCustomer } from '../api/orders'

export function useOrders() {
  const [myOrders, setMyOrders] = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const fetchMyOrders = useCallback(async (customerId) => {
    if (!customerId) return
    try {
      const res = await getOrdersByCustomer(customerId)
      setMyOrders(res?.data || res || [])
      setError(null)
    } catch (e) {
      const errorMsg = e?.message || 'Failed to load orders'
      setError(errorMsg)
      console.error('Failed to fetch orders:', e)
    }
  }, [])

  const submitOrder = useCallback(async ({ customerId, tableNumber, cart, specialRequests }) => {
    setLoading(true)
    setError(null)
    try {
      const body = {
        customerId,
        tableNumber,
        specialRequests,
        items: cart.map((c) => ({ menuItemId: c.id, quantity: c.qty })),
      }
      const res = await apiPlaceOrder(body)
      const newOrder = res?.data || res
      setMyOrders((prev) => [newOrder, ...prev])
      return newOrder
    } catch (e) {
      const errorMsg = e?.message || 'Failed to place order'
      setError(errorMsg)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const activeOrder = myOrders.find(
    (o) => !['PAID', 'CANCELLED'].includes(o.status)
  )

  return { myOrders, activeOrder, loading, error, fetchMyOrders, submitOrder, setMyOrders }
}