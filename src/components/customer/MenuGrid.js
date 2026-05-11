import React, { useState } from 'react'
import './MenuGrid.css'

const SORT_OPTIONS = ['Popularity', 'Price: Low–High', 'Price: High–Low', 'Prep Time']

function fakeRating(id) {
  const r = 4.0 + ((id * 17) % 10) / 10
  return Math.min(r, 5.0).toFixed(1)
}

function fakeReviews(id) {
  return 40 + (id * 23) % 120
}

function StarRating({ value }) {
  const full  = Math.floor(value)
  return (
    <div className="star-rating">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`star ${i < full ? 'full' : ''}`}>★</span>
      ))}
    </div>
  )
}

function CartDrawer({
  cart, cartTotal, cartCount, open, onClose,
  onUpdateQty, onPlaceOrder,
  specialRequests, onSpecialRequestsChange,
  tableNumber, customerId, orderLoading,
}) {
  return (
    <>
      <div className={`cart-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <div className={`cart-drawer ${open ? 'open' : ''}`}>
        <div className="cart-header">
          <div className="cart-title-wrap">
            <h2>Your Selection</h2>
            <span className="cart-count-pill">{cartCount} items</span>
          </div>
          <button className="close-cart-btn" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="cart-content">
          {cart.length === 0 ? (
            <div className="empty-cart-state">
              <div className="empty-icon">🍱</div>
              <p>Your tray is empty</p>
              <button className="start-browsing-btn" onClick={onClose}>Browse Menu</button>
            </div>
          ) : (
            <>
              <div className="cart-items-list">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item-card">
                    <div className="cart-item-img">{item.imageEmoji || '🍽'}</div>
                    <div className="cart-item-details">
                      <p className="cart-item-name">{item.name}</p>
                      <p className="cart-item-price">{item.price.toLocaleString()} RWF</p>
                      <div className="cart-item-qty">
                        <button onClick={() => onUpdateQty(item.id, -1)} className="qty-btn">−</button>
                        <span className="qty-val">{item.qty}</span>
                        <button onClick={() => onUpdateQty(item.id, 1)}  className="qty-btn">+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-extras">
                <label>Special Instructions</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => onSpecialRequestsChange(e.target.value)}
                  placeholder="e.g. Extra spicy, No onions..."
                />
              </div>

              <div className="cart-footer">
                <div className="cart-total-row">
                  <span>Subtotal</span>
                  <span className="total-val">{cartTotal.toLocaleString()} RWF</span>
                </div>
                <button
                  onClick={onPlaceOrder}
                  disabled={orderLoading || !customerId || !tableNumber}
                  className="place-order-btn"
                >
                  {orderLoading ? 'Sending to Kitchen...' : 'Confirm Order'}
                </button>
                {!customerId && <p className="cart-warning">Please check in to a table first</p>}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

function MenuCard({ item, inCartQty, onAdd, onUpdateQty }) {
  const rating = fakeRating(item.id)
  const reviews = fakeReviews(item.id)

  return (
    <div className="menu-card fade-in">
      <div className="card-media">
        <span className="card-emoji">{item.imageEmoji || '🍽'}</span>
        <div className="card-price-overlay">
          {Number(item.price).toLocaleString()} RWF
        </div>
        {item.isSpicy && <div className="spicy-tag">🌶 Hot</div>}
      </div>

      <div className="card-content">
        <div className="card-header">
          <h3 className="item-name">{item.name}</h3>
          <span className="item-category">{item.category}</span>
        </div>

        <div className="item-stats">
          <StarRating value={parseFloat(rating)} />
          <span className="reviews">({reviews})</span>
          <span className="prep-time">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {item.prepTimeMinutes}m
          </span>
        </div>

        <p className="item-desc">{item.description}</p>

        <div className="card-footer">
          {inCartQty > 0 ? (
            <div className="card-qty-toggle">
              <button onClick={() => onUpdateQty(item.id, -1)}>−</button>
              <span>{inCartQty}</span>
              <button onClick={() => onUpdateQty(item.id, 1)}>+</button>
            </div>
          ) : (
            <button onClick={() => onAdd(item)} className="add-to-cart-btn">
              Add to Tray
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BistroMenuView({
  menuItems, categories, cart, cartTotal, cartCount, cartOpen,
  onAdd, onUpdateQty, onRemove, onPlaceOrder, onCloseCart,
  specialRequests, onSpecialRequestsChange,
  tableNumber, customerId, orderLoading, loading,
}) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [sortBy,       setSortBy]       = useState('Popularity')

  const getCartQty = (id) => cart.find((c) => c.id === id)?.qty || 0

  const filterTabs = ['All', ...categories]

  const filteredItems = menuItems.filter((item) => {
    if (activeFilter === 'All') return true
    return item.category === activeFilter
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'Price: Low–High')  return a.price - b.price
    if (sortBy === 'Price: High–Low')  return b.price - a.price
    if (sortBy === 'Prep Time')        return a.prepTimeMinutes - b.prepTimeMinutes
    return 0
  })

  return (
    <div className="menu-view">
      {/* Featured Header */}
      <div className="featured-banner">
        <div className="banner-text">
          <span className="label">Chef's Signature</span>
          <h2>Artisan Culinary Journey</h2>
          <p>Hand-picked ingredients met with contemporary techniques.</p>
        </div>
        <div className="banner-visual">🍱</div>
      </div>

      {/* Control Bar */}
      <div className="control-bar">
        <div className="category-filters">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`filter-btn ${activeFilter === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="sort-controls">
          <span className="sort-label">Sort By</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid-container">
        {loading ? (
          <div className="skeleton-grid">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : (
          <div className="product-grid">
            {sortedItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                inCartQty={getCartQty(item.id)}
                onAdd={onAdd}
                onUpdateQty={onUpdateQty}
              />
            ))}
          </div>
        )}
      </div>

      <CartDrawer
        cart={cart}
        cartTotal={cartTotal}
        cartCount={cartCount}
        open={cartOpen}
        onClose={onCloseCart}
        onUpdateQty={onUpdateQty}
        onPlaceOrder={onPlaceOrder}
        specialRequests={specialRequests}
        onSpecialRequestsChange={onSpecialRequestsChange}
        tableNumber={tableNumber}
        customerId={customerId}
        orderLoading={orderLoading}
      />
    </div>
  )
}