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
    <div className="kos-layout">
      {/* Top Navbar */}
      <nav className="kos-topbar">
        <div className="kos-topbar-left">
          <div className="kos-brand">Kitchen OS</div>
          <div className="kos-top-links">
            {['Orders', 'Inventory', 'History'].map(tab => (
              <button 
                key={tab} 
                className={`kos-top-link ${activeTab === tab.toLowerCase() ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.toLowerCase())}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="kos-topbar-right">
          <div className="kos-search">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="icon-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </button>
          <button className="icon-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </button>
          <div className="kos-profile">CH</div>
        </div>
      </nav>

      <div className="kos-body">
        {/* Left Sidebar */}
        <aside className="kos-sidebar">
          <div className="kos-station-card">
            <div className="station-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>
            </div>
            <div className="station-info">
              <div className="station-name">Station 1</div>
              <div className="station-desc">Main Kitchen</div>
            </div>
          </div>

          <div className="kos-side-nav">
            <button className={`kos-side-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Orders
            </button>
            <button className={`kos-side-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              Inventory
            </button>
            <button className={`kos-side-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"></path><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"></path><polyline points="12 7 12 12 15 15"></polyline></svg>
              History
            </button>
            <button className="kos-side-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              Reports
            </button>
          </div>

          <div className="kos-side-bottom">
            <button className="kos-side-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Support
            </button>
            <button className="kos-side-item" onClick={onLogout}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Logout
            </button>
          </div>
        </aside>

        {/* Main Kanban Content */}
        <main className="kos-main">
          {loading && orders.length === 0 ? (
            <div className="kos-loading">
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
        </main>
      </div>
    </div>
  )
}