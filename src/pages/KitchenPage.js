import React, { useState, useEffect, useContext, useCallback } from 'react'
import { ToastContext } from '../App'
import KitchenKanban from '../components/kitchen/KanbanBoard'
import { getActiveOrders, updateOrderStatus } from '../api/orders'
import { connectWebSocket, disconnectWebSocket, registerGlobalCallback, unregisterGlobalCallback } from '../api/websocket'
import './KitchenPage.css'

export default function KitchenPage({ onLogout }) {
  const showToast = useContext(ToastContext)
  const [orders,      setOrders]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [activeTab,   setActiveTab]   = useState('orders')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await getActiveOrders()
      setOrders(res?.data || res || [])
    } catch (err) {
      showToast(err?.message || 'Failed to load orders.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  useEffect(() => {
    const WS_KEY = 'kitchen-page'
    connectWebSocket({
      onOrderUpdate: () => fetchOrders(true),
    })
    registerGlobalCallback(WS_KEY, (event) => {
      fetchOrders(true)
      if (event.newStatus === 'PENDING') {
        showToast(`🔔 New order from Table ${event.tableNumber}!`, 'info')
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
      if (newStatus === 'READY') showToast('✅ Order ready for delivery!', 'success')
    } catch (e) {
      showToast(e.message || 'Failed to update status.', 'error')
    }
  }, [showToast])

  const counts = {
    PENDING:   orders.filter((o) => o.status === 'PENDING').length,
    PREPARING: orders.filter((o) => o.status === 'PREPARING').length,
    READY:     orders.filter((o) => o.status === 'READY').length,
  }

  const filteredOrders = orders.filter((o) =>
    !searchQuery || 
    o.tableNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.items?.some(i => i.menuItemName?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="kitchen-portal fade-in">
      <header className="portal-header">
        <div className="header-info">
          <h1>Kitchen Display System</h1>
          <p>Real-time order management • Station 1</p>
        </div>
        
        <div className="header-actions">
          <div className="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="refresh-btn" onClick={() => fetchOrders(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><polyline points="21 3 21 8 16 8"/></svg>
          </button>
        </div>
      </header>

      <div className="kitchen-tabs">
        {['orders', 'history', 'inventory'].map(tab => (
          <button
            key={tab}
            className={`kitchen-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="kitchen-content">
        {loading && orders.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Syncing with server...</p>
          </div>
        ) : (
          <KitchenKanban
            orders={filteredOrders}
            onAdvance={handleAdvance}
            counts={counts}
          />
        )}
      </div>
    </div>
  )
}