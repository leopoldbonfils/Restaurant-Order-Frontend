import React from 'react'
import './CartSidebar.css'

export default function CartSidebar({
  cart, cartTotal, cartCount,
  onUpdateQty, onRemove, onPlaceOrder,
  specialRequests, onSpecialRequestsChange,
  tableNumber, customerId, loading,
}) {
  const isEmpty = cart.length === 0

  return (
    <div className="cart-wrap">
      <div className="cart-box">
        <div className="cart-header">
          <div className="cart-header-left">
            <span>🛒</span>
            <span className="cart-title">Your order</span>
          </div>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </div>

        {isEmpty ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <p className="cart-empty-title">Nothing here yet</p>
            <p className="cart-empty-sub">Add items from the menu</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <span className="cart-item-emoji">{item.imageEmoji || '🍽'}</span>
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-price">{(item.price * item.qty).toLocaleString()} RWF</p>
                  </div>
                  <div className="cart-item-controls">
                    <button onClick={() => onUpdateQty(item.id, -1)} className="cart-qty-btn minus">−</button>
                    <span className="cart-qty-num">{item.qty}</span>
                    <button onClick={() => onUpdateQty(item.id, 1)}  className="cart-qty-btn plus">+</button>
                    <button onClick={() => onRemove(item.id)} className="cart-remove-btn">✕</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-divider" />

            <div className="cart-total">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-value">
                {cartTotal.toLocaleString()} <span className="cart-total-currency">RWF</span>
              </span>
            </div>

            <div className="cart-notes">
              <textarea
                value={specialRequests}
                onChange={(e) => onSpecialRequestsChange(e.target.value)}
                placeholder="Special requests — no onions, extra spicy…"
                rows={2}
                className="cart-textarea"
              />
            </div>

            <div className="cart-action">
              <button
                onClick={onPlaceOrder}
                disabled={loading || !customerId || !tableNumber}
                className="cart-order-btn"
              >
                {loading ? 'Placing…' : 'Place order →'}
              </button>
              {!customerId && (
                <p className="cart-action-note">Check in to a table first</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}