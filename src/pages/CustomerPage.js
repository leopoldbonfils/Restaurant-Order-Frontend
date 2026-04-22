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

const NAV = [
  { key: 'menu',    label: 'Menu',    icon: '☰' },
  { key: 'offers',  label: 'Offers',  icon: '🏷' },
  { key: 'orders',  label: 'Orders',  icon: '◫' },
  { key: 'rewards', label: 'Rewards', icon: '⭐' },
]

export default function CustomerPage() {
  const showToast = useContext(ToastContext)

  const [activeNav,       setActiveNav]       = useState('menu')
  const [tableNumber,     setTableNumber]     = useState('')
  const [customerId,      setCustomerId]      = useState(null)
  const [loyaltyPts,      setLoyaltyPts]      = useState(0)
  const [customerName,    setCustomerName]    = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [cartOpen,        setCartOpen]        = useState(false)

  const { menuItems, categories, loading: menuLoading } = useMenu()
  const { cart, cartTotal, cartCount, addToCart, updateQty, removeFromCart, clearCart } = useCart()
  const {
    myOrders, activeOrder, loading: orderLoading,
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
          setActiveNav('orders')
        }
        if (event.newStatus === 'DELIVERED') showToast('🚚 Enjoy your meal!', 'info')
      },
    })
    return () => disconnectWebSocket()
  }, [tableNumber])

  useEffect(() => {
    if (customerId) fetchMyOrders(customerId)
  }, [customerId, fetchMyOrders])

  const handleCheckIn = useCallback(async (table, language) => {
    const res = await apiCheckIn(table, language)
    setTableNumber(table)
    setCustomerId(res.data.id)
    setLoyaltyPts(res.data.loyaltyPoints || 0)
    showToast(`Welcome! Checked in to ${table} 🎉`, 'success')
  }, [showToast])

  const handlePlaceOrder = useCallback(async () => {
    if (!cart.length) return
    try {
      const order = await submitOrder({ customerId, tableNumber, cart, specialRequests })
      clearCart()
      setCartOpen(false)
      setSpecialRequests('')
      setActiveNav('orders')
      showToast(`Order #${order.id} placed! Est. ${order.estimatedPrepMinutes} min ⏱`, 'success')
    } catch (e) {
      showToast(e.message || 'Failed to place order.', 'error')
    }
  }, [cart, customerId, tableNumber, specialRequests, submitOrder, clearCart, showToast])

  const pastOrders = myOrders.filter((o) => ['PAID', 'CANCELLED'].includes(o.status))

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <div className="bs-shell">

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className="bs-sidebar">
        <div className="bs-sidebar-brand">
          <span className="bs-brand-icon">🍴</span>
          <div>
            <p className="bs-brand-name">BistroFlow</p>
          </div>
        </div>

        {/* Guest info */}
        <div className="bs-guest-card">
          <div className="bs-guest-avatar">
            {customerId ? '😊' : '👤'}
          </div>
          <div>
            <p className="bs-guest-name">
              {customerId ? (customerName || 'Guest') : 'Bistro Luxe'}
            </p>
            <p className="bs-guest-sub">
              {tableNumber ? `${tableNumber}` : 'Premium Dining'}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="bs-nav">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveNav(item.key)}
              className={`bs-nav-item ${activeNav === item.key ? 'active' : ''}`}
            >
              <span className="bs-nav-icon">{item.icon}</span>
              <span className="bs-nav-label">{item.label}</span>
              {item.key === 'orders' && activeOrder && (
                <span className="bs-nav-dot" />
              )}
            </button>
          ))}
        </nav>

        {/* Reserve CTA */}
        {!customerId ? (
          <div className="bs-sidebar-cta">
            <CheckInForm onCheckIn={handleCheckIn} compact />
          </div>
        ) : (
          <div className="bs-sidebar-cta">
            <button className="bs-reserve-btn">Reserve a Table</button>
          </div>
        )}
      </aside>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="bs-main">

        {/* Top bar */}
        <header className="bs-topbar">
          <div className="bs-topbar-nav">
            <span className="bs-topbar-brand">BistroStream</span>
            <button className={`bs-topbar-link ${activeNav === 'menu' ? 'active' : ''}`} onClick={() => setActiveNav('menu')}>Menu</button>
            <button className={`bs-topbar-link ${activeNav === 'offers' ? 'active' : ''}`} onClick={() => setActiveNav('offers')}>Offers</button>
            <button className={`bs-topbar-link ${activeNav === 'orders' ? 'active' : ''}`} onClick={() => setActiveNav('orders')}>Orders</button>
          </div>
          <div className="bs-topbar-search">
            <span className="bs-topbar-search-icon">🔍</span>
            <input type="text" placeholder="Search menu..." className="bs-topbar-input" />
          </div>
          <div className="bs-topbar-right">
            <button className="bs-topbar-icon-btn">🔔</button>
            <button
              className="bs-topbar-icon-btn bs-cart-btn"
              onClick={() => setCartOpen((v) => !v)}
            >
              🛒
              {cartCount > 0 && <span className="bs-cart-count">{cartCount}</span>}
            </button>
            <div className="bs-topbar-avatar">
              {customerId ? '😊' : 'G'}
            </div>
          </div>
        </header>

        {/* Page views */}
        <div className="bs-content">
          {activeNav === 'menu' && (
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

          {activeNav === 'offers' && (
            <div className="bs-placeholder">
              <p className="bs-placeholder-icon">🏷</p>
              <p className="bs-placeholder-title">Special Offers</p>
              <p className="bs-placeholder-sub">Exclusive deals and promotions coming soon</p>
            </div>
          )}

          {activeNav === 'orders' && (
            <BistroOrderView
              orders={myOrders}
              activeOrder={activeOrder}
              pastOrders={pastOrders}
            />
          )}

          {activeNav === 'rewards' && (
            <BistroRewards
              loyaltyPts={loyaltyPts}
              customerName={customerName || 'Alex'}
              tableNumber={tableNumber}
              pastOrders={pastOrders}
            />
          )}
        </div>
      </div>
    </div>
  )
}