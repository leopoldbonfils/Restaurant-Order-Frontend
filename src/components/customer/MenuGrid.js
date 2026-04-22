import React, { useState } from 'react'
import './MenuGrid.css'

/* ── Food emoji map ─────────────────────────────────────────────────────── */
const BG_COLORS = {
  'Main Course': '#2d1f14',
  'Appetizer':   '#1a2d1f',
  'Side':        '#1a1f2d',
  'Drinks':      '#2d1a2a',
}

const SORT_OPTIONS = ['Popularity', 'Price: Low–High', 'Price: High–Low', 'Prep Time']

/* ── Rating generator (deterministic from id) ──────────────────────────── */
function fakeRating(id) {
  const r = 4.0 + ((id * 17) % 10) / 10
  return Math.min(r, 5.0).toFixed(1)
}

function fakeReviews(id) {
  return 40 + (id * 23) % 120
}

function StarRating({ value }) {
  const full  = Math.floor(value)
  const half  = value - full >= 0.5 ? 1 : 0
  return (
    <span className="bm-stars">
      {'★'.repeat(full)}{'½'.repeat(half)}{'☆'.repeat(5 - full - half)}
    </span>
  )
}

/* ── Cart Drawer ────────────────────────────────────────────────────────── */
function CartDrawer({
  cart, cartTotal, cartCount, open, onClose,
  onUpdateQty, onRemove, onPlaceOrder,
  specialRequests, onSpecialRequestsChange,
  tableNumber, customerId, orderLoading,
}) {
  return (
    <>
      {open && <div className="bm-cart-backdrop" onClick={onClose} />}
      <div className={`bm-cart-drawer ${open ? 'open' : ''}`}>
        <div className="bm-cart-drawer-header">
          <h3 className="bm-cart-drawer-title">Your Order</h3>
          {cartCount > 0 && (
            <span className="bm-cart-drawer-count">{cartCount} item{cartCount > 1 ? 's' : ''}</span>
          )}
          <button className="bm-cart-close" onClick={onClose}>✕</button>
        </div>

        {cart.length === 0 ? (
          <div className="bm-cart-empty">
            <span className="bm-cart-empty-icon">🛒</span>
            <p>Your cart is empty</p>
            <p className="bm-cart-empty-sub">Add items from the menu</p>
          </div>
        ) : (
          <>
            <div className="bm-cart-items">
              {cart.map((item) => (
                <div key={item.id} className="bm-cart-item">
                  <div className="bm-cart-item-emoji-wrap">
                    <span className="bm-cart-item-emoji">{item.imageEmoji || '🍽'}</span>
                  </div>
                  <div className="bm-cart-item-info">
                    <p className="bm-cart-item-name">{item.name}</p>
                    <p className="bm-cart-item-price">{(item.price * item.qty).toLocaleString()} RWF</p>
                  </div>
                  <div className="bm-cart-qty">
                    <button onClick={() => onUpdateQty(item.id, -1)} className="bm-qty-btn">−</button>
                    <span className="bm-qty-num">{item.qty}</span>
                    <button onClick={() => onUpdateQty(item.id, 1)}  className="bm-qty-btn">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bm-cart-notes">
              <textarea
                value={specialRequests}
                onChange={(e) => onSpecialRequestsChange(e.target.value)}
                placeholder="Special requests..."
                rows={2}
                className="bm-cart-textarea"
              />
            </div>

            <div className="bm-cart-summary">
              <div className="bm-cart-row">
                <span>Subtotal</span>
                <span>{cartTotal.toLocaleString()} RWF</span>
              </div>
            </div>

            <button
              onClick={onPlaceOrder}
              disabled={orderLoading || !customerId || !tableNumber}
              className="bm-cart-order-btn"
            >
              {orderLoading ? 'Placing…' : `Place Order · ${cartTotal.toLocaleString()} RWF`}
            </button>
            {!customerId && (
              <p className="bm-cart-note">Check in to a table first</p>
            )}
          </>
        )}
      </div>
    </>
  )
}

/* ── Menu Card ──────────────────────────────────────────────────────────── */
function MenuCard({ item, inCartQty, onAdd, onUpdateQty }) {
  const bg     = BG_COLORS[item.category] || '#1a1a2e'
  const rating = fakeRating(item.id)
  const reviews = fakeReviews(item.id)

  return (
    <div className="bm-card">
      {/* Image area */}
      <div className="bm-card-img" style={{ background: bg }}>
        <span className="bm-card-emoji">{item.imageEmoji || '🍽'}</span>
        {item.isSpicy && <span className="bm-card-spicy">🌶</span>}
        <div className="bm-card-price-tag">
          {Number(item.price).toLocaleString()} RWF
        </div>
      </div>

      {/* Body */}
      <div className="bm-card-body">
        <div className="bm-card-title-row">
          <h3 className="bm-card-name">{item.name}</h3>
        </div>

        <div className="bm-card-rating-row">
          <StarRating value={parseFloat(rating)} />
          <span className="bm-card-rating-val">{rating}</span>
          <span className="bm-card-reviews">({reviews})</span>
        </div>

        <p className="bm-card-desc">{item.description}</p>

        <div className="bm-card-meta">
          <span className="bm-card-prep">⏱ {item.prepTimeMinutes}m</span>
        </div>

        <div className="bm-card-footer">
          {inCartQty > 0 ? (
            <div className="bm-card-qty-ctrl">
              <button onClick={() => onUpdateQty(item.id, -1)} className="bm-ctrl-btn">−</button>
              <span className="bm-ctrl-num">{inCartQty}</span>
              <button onClick={() => onUpdateQty(item.id, 1)}  className="bm-ctrl-btn plus">+</button>
            </div>
          ) : (
            <button onClick={() => onAdd(item)} className="bm-add-btn">
              + Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Main MenuGrid ──────────────────────────────────────────────────────── */
export default function BistroMenuView({
  menuItems, categories, cart, cartTotal, cartCount, cartOpen,
  onAdd, onUpdateQty, onRemove, onPlaceOrder, onCloseCart,
  specialRequests, onSpecialRequestsChange,
  tableNumber, customerId, orderLoading, loading,
}) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [sortBy,       setSortBy]       = useState('Popularity')

  const getCartQty = (id) => cart.find((c) => c.id === id)?.qty || 0

  /* Map categories to display labels */
  const CAT_LABELS = {
    'Main Course': 'Signature Mains',
    'Appetizer':   'Starters',
    'Dessert':     'Desserts',
    'Drinks':      'Beverages',
    'Side':        'Sides',
  }

  const filterTabs = ['All', ...categories.map((c) => CAT_LABELS[c] || c)]

  const filteredItems = menuItems.filter((item) => {
    if (activeFilter === 'All') return true
    const label = CAT_LABELS[item.category] || item.category
    return label === activeFilter
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'Price: Low–High')  return a.price - b.price
    if (sortBy === 'Price: High–Low')  return b.price - a.price
    if (sortBy === 'Prep Time')        return a.prepTimeMinutes - b.prepTimeMinutes
    return 0
  })

  return (
    <div className="bm-view">

      {/* Hero banner */}
      <div className="bm-hero">
        <div className="bm-hero-overlay" />
        <div className="bm-hero-content">
          <span className="bm-hero-badge">CHEF'S SPECIAL</span>
          <h1 className="bm-hero-title">Artisan Flavors</h1>
          <p className="bm-hero-sub">
            Experience a symphony of tastes, crafted with quality
            sourced ingredients and time-honored traditions.
          </p>
          <button className="bm-hero-btn">Explore Story →</button>
        </div>
        <div className="bm-hero-visual">🍷</div>
      </div>

      {/* Filters row */}
      <div className="bm-filters-bar">
        <div className="bm-filter-tabs">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`bm-filter-tab ${activeFilter === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="bm-sort-wrap">
          <span className="bm-sort-label">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bm-sort-select"
          >
            {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="bm-grid-area">
        {loading ? (
          <div className="bm-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bm-skeleton" />
            ))}
          </div>
        ) : (
          <div className="bm-grid">
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

      {/* Cart Drawer */}
      <CartDrawer
        cart={cart}
        cartTotal={cartTotal}
        cartCount={cartCount}
        open={cartOpen}
        onClose={onCloseCart}
        onUpdateQty={onUpdateQty}
        onRemove={onRemove}
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