import React, { useState, useEffect, useContext, useCallback } from 'react'
import { ToastContext } from '../App'
import { MetricCards, OrderPipeline, TopItems, MenuManager } from '../components/admin/AdminComponents'
import { getAllOrders, getAnalytics } from '../api/orders'
import { getAllMenu, toggleAvailability } from '../api/menu'
import './AdminPage.css'

export default function AdminPage() {
  const showToast = useContext(ToastContext)
  const [orders,    setOrders]    = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [lastRefresh, setLastRefresh] = useState(null)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [ordersRes, analyticsRes, menuRes] = await Promise.all([
        getAllOrders(), getAnalytics(), getAllMenu(),
      ])
      setOrders(ordersRes.data || [])
      setAnalytics(analyticsRes.data)
      setMenuItems(menuRes.data || [])
      setLastRefresh(new Date())
    } catch (e) {
      showToast(e.message || 'Failed to load admin data.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { fetchData() }, [fetchData])

  const handleToggle = useCallback(async (itemId) => {
    try {
      const res = await toggleAvailability(itemId)
      setMenuItems((prev) => prev.map((m) => m.id === itemId ? res.data : m))
      const item = menuItems.find((m) => m.id === itemId)
      showToast(
        item?.isAvailable ? `${item?.name} marked as unavailable` : `${item?.name} is now available`,
        'info'
      )
    } catch (e) {
      showToast(e.message || 'Failed to update availability.', 'error')
    }
  }, [menuItems, showToast])

  return (
    <div className="page admin-page">
      <div className="page-inner">
        <div className="page-header">
          <div className="admin-title-wrap">
            <div className="admin-icon">📊</div>
            <div>
              <h1 className="page-title">Admin dashboard</h1>
              <p className="page-sub">
                {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                {lastRefresh && (
                  <span className="admin-refresh-time">
                    · refreshed {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button onClick={() => fetchData()} disabled={loading} className="refresh-btn">
            {loading ? '...' : '↻ Refresh'}
          </button>
        </div>

        {loading && orders.length === 0 ? (
          <div className="admin-loading">
            <p>⏳</p><p>Loading dashboard…</p>
          </div>
        ) : (
          <>
            <MetricCards analytics={analytics} />
            <div className="admin-analytics-grid">
              <OrderPipeline orders={orders} analytics={analytics} />
              <TopItems items={analytics?.topSellingItems} />
            </div>
            <MenuManager menuItems={menuItems} onToggle={handleToggle} />
          </>
        )}
      </div>
    </div>
  )
}