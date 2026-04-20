import React, { useState, useEffect, useContext, useCallback } from 'react'
import { ToastContext } from '../App'
import KanbanBoard from '../components/kitchen/KanbanBoard'
import { getActiveOrders, updateOrderStatus } from '../api/orders'
import { connectWebSocket, disconnectWebSocket } from '../api/websocket'
import './KitchenPage.css'

export default function KitchenPage() {
  const showToast = useContext(ToastContext)
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(null)

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await getActiveOrders()
      setOrders(res.data || [])
      setLastRefresh(new Date())
    } catch {
      showToast('Failed to load orders.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  useEffect(() => {
    const id = setInterval(() => fetchOrders(true), 30000)
    return () => clearInterval(id)
  }, [fetchOrders])

  useEffect(() => {
    connectWebSocket({
      onOrderUpdate: (event) => {
        fetchOrders(true)
        if (event.newStatus === 'PENDING') showToast(`New order from ${event.tableNumber}!`, 'info')
      },
    })
    return () => disconnectWebSocket()
  }, [fetchOrders, showToast])

  const handleAdvance = useCallback(async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders((prev) =>
        newStatus === 'PAID'
          ? prev.filter((o) => o.id !== orderId)
          : prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o)
      )
      if (newStatus === 'READY') showToast('Order marked as ready — waiter notified.', 'success')
    } catch (e) {
      showToast(e.message || 'Failed to update status.', 'error')
    }
  }, [showToast])

  const counts = {
    PENDING:   orders.filter((o) => o.status === 'PENDING').length,
    PREPARING: orders.filter((o) => o.status === 'PREPARING').length,
    READY:     orders.filter((o) => o.status === 'READY').length,
  }

  return (
    <div className="page kitchen-page">
      <div className="page-inner-wide">
        <div className="page-header">
          <div className="kitchen-title-wrap">
            <div className="kitchen-icon">👨‍🍳</div>
            <div>
              <h1 className="page-title">Kitchen display</h1>
              <p className="page-sub">
                Live board · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {lastRefresh && (
                  <span className="kitchen-refresh-time">
                    · refreshed {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="kitchen-header-right">
            <div className="kitchen-pills">
              {counts.PENDING > 0   && <span className="kitchen-pill amber">{counts.PENDING} new</span>}
              {counts.PREPARING > 0 && <span className="kitchen-pill blue">{counts.PREPARING} cooking</span>}
              {counts.READY > 0     && <span className="kitchen-pill green">{counts.READY} ready</span>}
            </div>
            <button
              onClick={() => fetchOrders()}
              disabled={loading}
              className="refresh-btn"
            >
              {loading ? '...' : '↻ Refresh'}
            </button>
          </div>
        </div>

        {loading && orders.length === 0 ? (
          <div className="kitchen-loading">
            <p className="kitchen-loading-icon">⏳</p>
            <p>Loading orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="kitchen-empty">
            <p className="kitchen-empty-icon">🍽</p>
            <p className="kitchen-empty-title">No active orders</p>
            <p className="kitchen-empty-sub">New orders will appear here automatically</p>
          </div>
        ) : (
          <KanbanBoard orders={orders} onAdvance={handleAdvance} />
        )}
      </div>
    </div>
  )
}