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
  { key: 'menu',    label: 'Browse Menu', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  )},
  { key: 'orders',  label: 'My Orders',   icon: (
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
    <div className="customer-portal fade-in">
      {/* Sub-header with Check-in / Table Info */}
      <div className="portal-header">
        <div className="header-info">
          <h1>Experience Dining</h1>
          <p>{tableNumber ? `Table ${tableNumber} • Premium Service` : 'Welcome to BistroFlow'}</p>
        </div>
        
        <div className="header-actions">
          {!customerId ? (
            <CheckInForm onCheckIn={handleCheckIn} compact />
          ) : (
            <div className="status-badge">
              <span className="dot pulse"></span>
              Live Tracking Active
            </div>
          )}
          
          <button className="cart-toggle-btn" onClick={() => setCartOpen(!cartOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="portal-tabs">
        {NAV_TABS.map(tab => (
          <button
            key={tab.key}
            className={`portal-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="portal-content">
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
      </div>
    </div>
  )
}