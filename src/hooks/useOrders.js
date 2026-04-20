import { useState, useCallback } from 'react'
import { placeOrder as apiPlaceOrder, getOrdersByCustomer } from '../api/orders'

export function useOrders() {
  const [myOrders, setMyOrders] = useState([])
  const [loading, setLoading]   = useState(false)

  const fetchMyOrders = useCallback(async (customerId) => {
    if (!customerId) return
    try {
      const res = await getOrdersByCustomer(customerId)
      setMyOrders(res.data || [])
    } catch (e) {
      console.error(e)
    }
  }, [])

  const submitOrder = useCallback(async ({ customerId, tableNumber, cart, specialRequests }) => {
    setLoading(true)
    try {
      const body = {
        customerId,
        tableNumber,
        specialRequests,
        items: cart.map((c) => ({ menuItemId: c.id, quantity: c.qty })),
      }
      const res = await apiPlaceOrder(body)
      setMyOrders((prev) => [res.data, ...prev])
      return res.data
    } finally {
      setLoading(false)
    }
  }, [])

  const activeOrder = myOrders.find(
    (o) => !['PAID', 'CANCELLED'].includes(o.status)
  )

  return { myOrders, activeOrder, loading, fetchMyOrders, submitOrder, setMyOrders }
}