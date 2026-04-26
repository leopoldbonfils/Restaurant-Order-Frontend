import React, { useState, useEffect, useContext, useCallback } from 'react'
import { ToastContext } from '../App'
import KitchenKanban from '../components/kitchen/KanbanBoard'
import { getActiveOrders, updateOrderStatus } from '../api/orders'
import { connectWebSocket, disconnectWebSocket, registerGlobalCallback, unregisterGlobalCallback } from '../api/websocket'
import './KitchenPage.css'

const NAV = [
  { key: 'orders',    label: 'Orders',    icon: '◫' },
  { key: 'inventory', label: 'Inventory', icon: '⊟' },
  { key: 'history',   label: 'History',   icon: '◷' },
  { key: 'reports',   label: 'Reports',   icon: '⊞' },
]

export default function KitchenPage({ onLogout }) {
  const showToast = useContext(ToastContext)
  const [orders,      setOrders]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [activeNav,   setActiveNav]   = useState('orders')
  const [activeTab,   setActiveTab]   = useState('orders')
  const [searchQuery, setSearchQuery] = useState('')
  const [clock,       setClock]       = useState(new Date())

  /* Live clock */
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await getActiveOrders()
      setOrders(res.data || [])
    } catch {
      showToast('Failed to load orders.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  /* Initial load */
  useEffect(() => { fetchOrders() }, [fetchOrders])

  /* Poll every 30 s as a safety net */
  useEffect(() => {
    const id = setInterval(() => fetchOrders(true), 30000)
    return () => clearInterval(id)
  }, [fetchOrders])

  /* WebSocket — listen on /topic/orders for real-time updates */
  useEffect(() => {
    const WS_KEY = 'kitchen-page'

    connectWebSocket({
      onOrderUpdate: (event) => {
        fetchOrders(true)
        if (event.newStatus === 'PENDING') {
          showToast(`🔔 New order from ${event.tableNumber}!`, 'info')
        }
      },
    })

    registerGlobalCallback(WS_KEY, (event) => {
      fetchOrders(true)
      if (event.newStatus === 'PENDING') {
        showToast(`🔔 New order from ${event.tableNumber}!`, 'info')
      }
    })

    return () => {
      unregisterGlobalCallback(WS_KEY)
      disconnectWebSocket()
    }
  }, [fetchOrders, showToast])

  const handleAdvance = useCallback(async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders((prev) =>
        newStatus === 'DELIVERED'
          ? prev.filter((o) => o.id !== orderId)
          : prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o)
      )
      if (newStatus === 'READY') showToast('✅ Order ready — waiter notified!', 'success')
    } catch (e) {
      showToast(e.message || 'Failed to update.', 'error')
    }
  }, [showToast])

  const counts = {
    PENDING:   orders.filter((o) => o.status === 'PENDING').length,
    PREPARING: orders.filter((o) => o.status === 'PREPARING').length,
    READY:     orders.filter((o) => o.status === 'READY').length,
  }

  const filteredOrders = searchQuery.trim()
    ? orders.filter((o) =>
        o.tableNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.items?.some((i) => i.menuItemName?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : orders

  return (
    <div className="kos-shell">

      {/* ── Left sidebar ─────────────────────────────────────── */}
      <aside className="kos-sidebar">
        <div className="kos-sidebar-brand">
          <div className="kos-brand-icon">🍴</div>
          <div>
            <p className="kos-brand-name">Kitchen OS</p>
          </div>
        </div>

        <div className="kos-station">
          <div className="kos-station-icon">🖥</div>
          <div>
            <p className="kos-station-name">Station 1</p>
            <p className="kos-station-sub">Main Kitchen</p>
          </div>
        </div>

        <nav className="kos-nav">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveNav(item.key)}
              className={`kos-nav-item ${activeNav === item.key ? 'active' : ''}`}
            >
              <span className="kos-nav-icon">{item.icon}</span>
              <span className="kos-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="kos-sidebar-footer">
          <button className="kos-footer-btn">
            <span>⚙</span> Support
          </button>
          {/* ── Logout wired to onLogout prop ── */}
          <button
            className="kos-footer-btn kos-logout"
            onClick={onLogout}
          >
            <span>↩</span> Logout
          </button>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────── */}
      <div className="kos-main">

        {/* Top bar */}
        <header className="kos-topbar">
          <div className="kos-tabs">
            {['orders', 'inventory', 'history'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`kos-tab ${activeTab === t ? 'active' : ''}`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="kos-topbar-right">
            <div className="kos-search-wrap">
              <span className="kos-search-icon">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="kos-search"
              />
            </div>
            <button
              className="kos-icon-btn"
              onClick={() => fetchOrders(true)}
              title="Refresh"
            >
              🔄
            </button>
            <button className="kos-icon-btn">⚙</button>
            <div className="kos-avatar">DK</div>
          </div>
        </header>

        {/* Board */}
        <div className="kos-board-wrap">
          {loading && orders.length === 0 ? (
            <div className="kos-loading">
              <div className="kos-loading-spinner" />
              <p>Loading orders…</p>
            </div>
          ) : (
            <KitchenKanban
              orders={filteredOrders}
              onAdvance={handleAdvance}
              counts={counts}
            />
          )}
        </div>

        {/* FAB */}
        <button
          className="kos-fab"
          onClick={() => fetchOrders(true)}
          title="Refresh"
        >
          +
        </button>
      </div>
    </div>
  )
}