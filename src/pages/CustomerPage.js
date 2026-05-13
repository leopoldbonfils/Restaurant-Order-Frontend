import React, { useState, useEffect, useContext, useCallback } from 'react'
import { ToastContext } from '../App'
import { useMenu }   from '../hooks/useMenu'
import { useCart }   from '../hooks/useCart'
import { useOrders } from '../hooks/useOrders'
import { checkIn as apiCheckIn } from '../api/customers'
import { connectWebSocket, disconnectWebSocket } from '../api/websocket'
import BistroMenuView   from '../components/customer/MenuGrid'
import BistroOrderView  from '../components/customer/OrderTracker'
import BistroRewards    from '../components/customer/RewardsView'
import CheckInForm      from '../components/customer/CheckInForm'
import './CustomerPage.css'

const NAV_TABS = [
  { key: 'menu',    label: 'Menu', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  )},
  { key: 'offers',  label: 'Offers',   icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
  )},
  { key: 'orders',  label: 'Orders',   icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
  )},
  { key: 'rewards', label: 'Rewards',    icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  )},
]

export default function CustomerPage() {
  const showToast = useContext(ToastContext)

  const [activeTab,       setActiveTab]       = useState('menu')
  const [tableNumber,     setTableNumber]     = useState('')
  const [customerId,      setCustomerId]      = useState(null)
  const [loyaltyPts,      setLoyaltyPts]      = useState(0)
  const [specialRequests, setSpecialRequests] = useState('')
  const [cartOpen,        setCartOpen]        = useState(false)

  const { menuItems, categories, loading: menuLoading, error: menuError } = useMenu()
  const { cart, cartTotal, cartCount, addToCart, updateQty, removeFromCart, clearCart } = useCart()
  const {
    myOrders, activeOrder, loading: orderLoading, error: orderError,
    fetchMyOrders, submitOrder, setMyOrders,
  } = useOrders()

  /* WebSocket live updates */
  useEffect(() => {
    if (!tableNumber) return
    connectWebSocket({
      tableNumber,
      onOrderUpdate: (event) => {
        setMyOrders((prev) =>
          prev.map((o) => o.id === event.orderId ? { ...o, status: event.newStatus } : o)
        )
        if (event.newStatus === 'READY') {
          showToast('🎉 Your order is ready!', 'success')
          setActiveTab('orders')
        }
      },
    })
    return () => disconnectWebSocket()
  }, [tableNumber, showToast, setMyOrders])

  useEffect(() => {
    if (customerId) fetchMyOrders(customerId)
  }, [customerId, fetchMyOrders])

  const handleCheckIn = useCallback(async (table, language) => {
    try {
      const res = await apiCheckIn(table, language)
      const { id, loyaltyPoints } = res?.data || res
      setTableNumber(table)
      setCustomerId(id)
      setLoyaltyPts(loyaltyPoints || 0)
      showToast(`Welcome! You are at table ${table}.`, 'success')
    } catch (err) {
      showToast(err?.message || 'Check-in failed.', 'error')
    }
  }, [showToast])

  const handlePlaceOrder = useCallback(async () => {
    if (!cart.length) return
    try {
      const order = await submitOrder({ customerId, tableNumber, cart, specialRequests })
      clearCart()
      setCartOpen(false)
      setSpecialRequests('')
      setActiveTab('orders')
      showToast(`Order #${order.id} placed successfully!`, 'success')
    } catch (e) {
      showToast(e.message || 'Failed to place order.', 'error')
    }
  }, [cart, customerId, tableNumber, specialRequests, submitOrder, clearCart, showToast])

  const pastOrders = myOrders.filter((o) => ['PAID', 'CANCELLED'].includes(o.status))

  return (
    <div className="customer-app-layout fade-in">
      {/* Top Navigation Bar */}
      <header className="customer-topbar">
        <div className="topbar-left">
          <div className="brand-logo">BistroStream</div>
          <nav className="topbar-nav">
            {['menu', 'offers', 'orders'].map(tab => (
              <button 
                key={tab} 
                className={activeTab === tab ? 'active' : ''} 
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
        <div className="topbar-right">
          <div className="search-bar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search menu..." />
          </div>
          <button className="icon-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </button>
          <button className="icon-btn cart-btn" onClick={() => setCartOpen(!cartOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          <div className="user-avatar">
            <img src="https://ui-avatars.com/api/?name=Guest&background=1e293b&color=fff" alt="User" />
          </div>
        </div>
      </header>

      <div className="customer-main-body">
        {/* Left Sidebar */}
        <aside className="customer-sidebar">
          <div className="sidebar-resto-card">
            <div className="resto-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
            </div>
            <div className="resto-info">
              <h4>Bistro-Luxe</h4>
              <span>PREMIUM DINING</span>
            </div>
          </div>
          
          <nav className="sidebar-nav-vertical">
            {NAV_TABS.map(tab => (
              <button
                key={tab.key}
                className={`sidebar-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            {!customerId ? (
              <div className="checkin-container">
                <CheckInForm onCheckIn={handleCheckIn} compact />
              </div>
            ) : (
              <div className="status-badge">
                <span className="dot pulse"></span>
                Table {tableNumber}
              </div>
            )}
            <button className="reserve-btn">Reserve a Table</button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="customer-content-area">
          {activeTab === 'menu' && (
            <BistroMenuView
              menuItems={menuItems}
              categories={categories}
              cart={cart}
              cartTotal={cartTotal}
              cartCount={cartCount}
              cartOpen={cartOpen}
              onAdd={addToCart}
              onUpdateQty={updateQty}
              onRemove={removeFromCart}
              onPlaceOrder={handlePlaceOrder}
              onCloseCart={() => setCartOpen(false)}
              specialRequests={specialRequests}
              onSpecialRequestsChange={setSpecialRequests}
              tableNumber={tableNumber}
              customerId={customerId}
              orderLoading={orderLoading}
              loading={menuLoading}
            />
          )}

          {activeTab === 'offers' && (
            <div className="placeholder-view">
              <h2>Special Offers</h2>
              <p>Check back later for exclusive deals!</p>
            </div>
          )}

          {activeTab === 'orders' && (
            <BistroOrderView
              orders={myOrders}
              activeOrder={activeOrder}
              pastOrders={pastOrders}
            />
          )}

          {activeTab === 'rewards' && (
            <BistroRewards
              loyaltyPts={loyaltyPts}
              customerName='Guest'
              tableNumber={tableNumber}
              pastOrders={pastOrders}
            />
          )}
        </main>
      </div>
    </div>
  )
}