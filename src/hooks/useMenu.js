import { useState, useEffect } from 'react'
import { getAvailableMenu } from '../api/menu'

export function useMenu() {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    getAvailableMenu()
      .then((res) => setMenuItems(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const categories = [...new Set(menuItems.map((m) => m.category))]

  return { menuItems, categories, loading, error }
}