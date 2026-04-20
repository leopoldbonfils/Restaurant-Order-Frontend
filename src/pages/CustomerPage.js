import React, { useState, useEffect, useContext, useCallback } from 'react'
import { ToastContext } from '../App'
import { useMenu }   from '../hooks/useMenu'
import { useCart }   from '../hooks/useCart'
import { useOrders } from '../hooks/useOrders'
import { checkIn as apiCheckIn } from '../api/customers'
import { connectWebSocket, disconnectWebSocket } from '../api/websocket'
import CheckInForm  from '../components/customer/CheckInForm'
import MenuGrid     from '../components/customer/MenuGrid'
import CartSidebar  from '../components/customer/CartSidebar'
import OrderTracker from '../components/customer/OrderTracker'
import './CustomerPage.css'

export default function CustomerPage() {
  const showToast = useContext(ToastContext)
  const [tableNumber, setTableNumber] = useState('')
  const [customerId,  setCustomerId]  = useState(null)
  const [loyaltyPts,  setLoyaltyPts]  = useState(0)
  const [specialRequests, setSpecialRequests] = useState('')

  const { menuItems, categories, loading: menuLoading } = useMenu()
  const { cart, cartTotal, cartCount, addToCart, updateQty, removeFromCart, clearCart } = useCart()
  const { myOrders, activeOrder, loading: orderLoading, fetchMyOrders, submitOrder, setMyOrders } = useOrders()

  useEffect(() => {
    if (!tableNumber) return
    connectWebSocket({
      tableNumber,
      onOrderUpdate: (event) => {
        setMyOrders((prev) =>
          prev.map((o) => o.id === event.orderId ? { ...o, status: event.newStatus } : o)
        )
        if (event.newStatus === 'READY') showToast('🎉 Your order is ready!', 'success')
        if (event.newStatus === 'DELIVERED') showToast('🚚 Order delivered. Enjoy!', 'info')
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
    showToast(`Checked in to ${table}. Welcome! 🎉`, 'success')
  }, [showToast])

  const handlePlaceOrder = useCallback(async () => {
    if (!cart.length) return
    try {
      const order = await submitOrder({ customerId, tableNumber, cart, specialRequests })
      clearCart()
      setSpecialRequests('')
      showToast(`Order #${order.id} placed! Est. ${order.estimatedPrepMinutes} min ⏱`, 'success')
    } catch (e) {
      showToast(e.message || 'Failed to place order.', 'error')
    }
  }, [cart, customerId, tableNumber, specialRequests, submitOrder, clearCart, showToast])

  const pastOrders = myOrders.filter((o) => ['PAID', 'CANCELLED'].includes(o.status))

  return (
    <div className="page customer-page">
      <div className="page-inner">
        <div className="page-header">
          <div>
            <h1 className="page-title">{tableNumber || 'Welcome'}</h1>
            <p className="page-sub">
              {customerId ? 'Browse the menu and place your order below' : 'Check in to your table to start ordering'}
            </p>
          </div>
          <div className="customer-pills">
            {tableNumber && <span className="pill">📍 {tableNumber}</span>}
            {loyaltyPts > 0 && <span className="pill pill-amber">⭐ {loyaltyPts} pts</span>}
          </div>
        </div>

        {!customerId && <CheckInForm onCheckIn={handleCheckIn} />}
        {activeOrder  && <OrderTracker order={activeOrder} />}

        <div className="customer-layout">
          <div className="customer-menu">
            <MenuGrid
              menuItems={menuItems}
              categories={categories}
              cart={cart}
              onAdd={addToCart}
              onUpdateQty={updateQty}
              loading={menuLoading}
            />
          </div>
          <CartSidebar
            cart={cart}
            cartTotal={cartTotal}
            cartCount={cartCount}
            onUpdateQty={updateQty}
            onRemove={removeFromCart}
            onPlaceOrder={handlePlaceOrder}
            specialRequests={specialRequests}
            onSpecialRequestsChange={setSpecialRequests}
            tableNumber={tableNumber}
            customerId={customerId}
            loading={orderLoading}
          />
        </div>

        {pastOrders.length > 0 && (
          <div className="past-orders">
            <h2 className="past-orders-title">Past orders</h2>
            <div className="past-orders-grid">
              {pastOrders.slice(0, 6).map((order) => (
                <div key={order.id} className="past-order-card">
                  <div className="past-order-top">
                    <div>
                      <p className="past-order-id">Order #{order.id}</p>
                      <p className="past-order-date">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString([], {
                          hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric'
                        }) : ''}
                      </p>
                    </div>
                    <span className={`past-order-status ${order.status === 'PAID' ? 'paid' : 'cancelled'}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="past-order-items">
                    {(order.items || []).map((i) => `${i.quantity}× ${i.menuItemName}`).join(', ')}
                  </p>
                  <p className="past-order-total">
                    {order.totalAmount?.toLocaleString()} <span>RWF</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}