import { useState, useEffect } from 'react'
import { getAvailableMenu } from '../api/menu'

export function useMenu() {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    getAvailableMenu()
      .then((res) => {
        setMenuItems(res?.data || res || [])
        setError(null)
      })
      .catch((err) => {
        const errorMsg = err?.message || 'Failed to load menu items'
        setError(errorMsg)
        console.error('Menu loading error:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  const categories = [...new Set(menuItems.map((m) => m.category))]

  return { menuItems, categories, loading, error }
}