import { useState, useCallback } from 'react'

export function useCart() {
  const [cart, setCart] = useState([])

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id)
      if (existing) {
        return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
      }
      return [...prev, { ...item, qty: 1 }]
    })
  }, [])

  const updateQty = useCallback((id, delta) => {
    setCart((prev) => {
      const updated = prev.map((c) => c.id === id ? { ...c, qty: c.qty + delta } : c)
      return updated.filter((c) => c.qty > 0)
    })
  }, [])

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  return { cart, cartTotal, cartCount, addToCart, updateQty, removeFromCart, clearCart }
}