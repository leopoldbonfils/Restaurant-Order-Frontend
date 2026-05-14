import React, { useState } from 'react'
import './MenuGrid.css'

const SORT_OPTIONS = ['Popularity', 'Price: Low–High', 'Price: High–Low', 'Prep Time']

function fakeRating(id) {
  const r = 4.0 + ((id * 17) % 10) / 10
  return Math.min(r, 5.0).toFixed(1)
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

  // Mock images to match demo
  const mockImages = [
    process.env.PUBLIC_URL + '/images/heritage_ribs_1778704978299.png',
    process.env.PUBLIC_URL + '/images/truffle_pizza_1778705144793.png',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
    'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=400&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80',
    'https://images.unsplash.com/photo-1578985545062-69928b1ea610?w=400&q=80'
  ]
  
  // Use a simple hash of the name to pick a consistent mock image
  const hash = item.name ? item.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  const fallbackImg = mockImages[hash % mockImages.length];

  // Use the backend image if it exists and isn't just whitespace, otherwise use fallback
  const bgImg = (item.imageUrl && item.imageUrl.trim() !== '') ? item.imageUrl : fallbackImg;

  const tags = []
  if (item.category === 'Starters') tags.push('VEGETARIAN')
  else if (item.id % 3 === 0) tags.push('GLUTEN FREE')
  else if (item.id % 5 === 0) tags.push('HEALTHY')
  else tags.push('SIGNATURE')

  // Convert price to look like the mock ($xx.xx)
  const displayPrice = `$${(item.price / 100).toFixed(2)}`

  return (
    <div className="menu-card fade-in">
      <div className="card-media" style={{ backgroundImage: `url(${bgImg})` }}>
        <div className="card-price-overlay">{displayPrice}</div>
      </div>

      <div className="card-content">
        <div className="card-header-row">
          <h3 className="item-name">{item.name}</h3>
          <div className="item-rating">
            <span className="star">★</span> {rating}
          </div>
        </div>

        <p className="item-desc">{item.description}</p>

        <div className="card-footer-action">
          <div className="item-tags">
            {tags.map(t => <span key={t} className="tag-pill">{t}</span>)}
          </div>
          
          {inCartQty > 0 ? (
            <div className="card-qty-toggle">
              <button onClick={() => onUpdateQty(item.id, -1)}>−</button>
              <span>{inCartQty}</span>
              <button onClick={() => onUpdateQty(item.id, 1)}>+</button>
            </div>
          ) : (
            <button onClick={() => onAdd(item)} className="add-to-cart-btn-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              Add to Cart
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

  // Try to find the banner image, else fallback to unsplash
  const bannerImage = process.env.PUBLIC_URL + '/images/artisan_banner_1778705821600.png';

  return (
    <div className="menu-view">
      {/* Featured Header */}
      <div className="featured-banner" style={{ backgroundImage: `url(${bannerImage}), linear-gradient(135deg, var(--gray-900), var(--gray-800))` }}>
        <div className="banner-overlay"></div>
        <div className="banner-text">
          <span className="label">CHEF'S SPECIAL SELECTION</span>
          <h2>Artisan Flavors</h2>
          <p>Experience a symphony of tastes crafted with locally sourced ingredients and time-honored techniques.</p>
          <button className="explore-btn">Explore Story</button>
        </div>
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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          <span className="sort-label">Sort by:</span>
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