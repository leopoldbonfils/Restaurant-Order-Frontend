import React, { useState } from 'react'
import './RewardsView.css'

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Halal', 'Gluten-Free', 'Nut Allergy', 'Dairy-Free']

export default function BistroRewards({ loyaltyPts, customerName, tableNumber, pastOrders }) {
  const [selectedDietary, setSelectedDietary] = useState(['Vegetarian', 'Nut Allergy'])

  const TIER_THRESHOLDS = { BRONZE: 0, SILVER: 500, GOLD: 1000, PLATINUM: 2000 }
  const tier = loyaltyPts >= 2000 ? 'PLATINUM'
             : loyaltyPts >= 1000 ? 'GOLD'
             : loyaltyPts >= 500  ? 'SILVER'
             : 'BRONZE'

  const nextTier     = tier === 'BRONZE' ? 'SILVER' : tier === 'SILVER' ? 'GOLD' : tier === 'GOLD' ? 'PLATINUM' : null
  const nextThresh   = nextTier ? TIER_THRESHOLDS[nextTier] : TIER_THRESHOLDS.PLATINUM
  const ptsToNext    = Math.max(0, nextThresh - loyaltyPts)
  const tierProgress = nextTier
    ? Math.min(100, Math.round((loyaltyPts - TIER_THRESHOLDS[tier]) / (nextThresh - TIER_THRESHOLDS[tier]) * 100))
    : 100

  const TIER_COLORS = {
    BRONZE:   { from: '#92400e', to: '#b45309', text: '#f59e0b' },
    SILVER:   { from: '#374151', to: '#6b7280', text: '#d1d5db' },
    GOLD:     { from: '#92400e', to: '#d97706', text: '#fcd34d' },
    PLATINUM: { from: '#1e3a5f', to: '#2563eb', text: '#93c5fd' },
  }

  const tc = TIER_COLORS[tier]

  const toggleDietary = (tag) => {
    setSelectedDietary((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="brw-view">
      {/* ── Left main column ── */}
      <div className="brw-main">

        {/* Welcome header */}
        <div className="brw-welcome">
          <h1 className="brw-welcome-title">Welcome back, {customerName}!</h1>
          <p className="brw-welcome-sub">Your gourmet journey continues here.</p>
        </div>

        {/* Membership card */}
        <div
          className="brw-membership-card"
          style={{ background: `linear-gradient(135deg, ${tc.from}, ${tc.to})` }}
        >
          <div className="brw-tier-badge">
            <span className="brw-tier-label" style={{ color: tc.text }}>MEMBERSHIP TIER</span>
            <span className="brw-tier-name"  style={{ color: tc.text }}>— {tier}</span>
          </div>
          <div className="brw-pts-row">
            <span className="brw-pts-value">{loyaltyPts.toLocaleString()}</span>
            <span className="brw-pts-label"> Points</span>
          </div>

          {/* Progress */}
          {ptsToNext > 0 ? (
            <>
              <div className="brw-progress-bar">
                <div className="brw-progress-fill" style={{ width: `${tierProgress}%` }} />
              </div>
              <p className="brw-progress-label">
                Only <strong>{ptsToNext}</strong> points away from a complimentary signature dessert.
              </p>
            </>
          ) : (
            <p className="brw-progress-label" style={{ color: tc.text }}>
              🏆 You've reached Platinum status!
            </p>
          )}

          {/* Trophy watermark */}
          <div className="brw-trophy-watermark">🏆</div>
        </div>

        {/* Recent Orders */}
        <div className="brw-orders-section">
          <div className="brw-section-header">
            <h3 className="brw-section-title">Recent Orders</h3>
            <button className="brw-view-all">View All</button>
          </div>

          {pastOrders.length === 0 ? (
            <div className="brw-orders-empty">No orders yet — start exploring the menu!</div>
          ) : (
            <div className="brw-orders-list">
              {pastOrders.slice(0, 4).map((order) => (
                <div key={order.id} className="brw-order-row">
                  <div className="brw-order-emoji-wrap">
                    <span className="brw-order-emoji">
                      {order.items?.[0]?.menuItemEmoji || '🍽'}
                    </span>
                  </div>
                  <div className="brw-order-info">
                    <p className="brw-order-name">
                      {order.items?.slice(0, 2).map((i) => i.menuItemName).join(' & ')}
                      {order.items?.length > 2 && ` +${order.items.length - 2} more`}
                    </p>
                    <p className="brw-order-meta">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      }) : ''}
                      {order.tableNumber && ` · ${order.tableNumber}`}
                    </p>
                    <span className={`brw-order-status ${order.status === 'PAID' ? 'paid' : 'cancelled'}`}>
                      {order.status}
                    </span>
                  </div>
                  <button className="brw-reorder-btn">Reorder</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dietary restrictions */}
        <div className="brw-dietary-section">
          <div className="brw-section-header">
            <h3 className="brw-section-title">🍃 Dietary Restrictions</h3>
          </div>
          <div className="brw-dietary-tags">
            {DIETARY_OPTIONS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleDietary(tag)}
                className={`brw-dietary-tag ${selectedDietary.includes(tag) ? 'active' : ''}`}
              >
                {tag}
              </button>
            ))}
            <button className="brw-dietary-tag add">+ Add</button>
          </div>
        </div>
      </div>

      {/* ── Right sidebar ── */}
      <div className="brw-sidebar">

        {/* Your seat */}
        <div className="brw-seat-card">
          <div className="brw-seat-label">Your Seat</div>
          <div className="brw-seat-info">
            {tableNumber ? tableNumber : 'Window Room, Table 12'}
          </div>
          <div className="brw-seat-img">
            <div className="brw-seat-img-inner">
              🪑
              <div className="brw-seat-img-label">Window Room</div>
            </div>
          </div>
          <button className="brw-seat-btn">Visit Dining Room →</button>
          <button className="brw-quick-reserve">Quick Reserve →</button>
        </div>

        {/* Payment methods */}
        <div className="brw-payment-card">
          <h3 className="brw-payment-title">💳 Payment Methods</h3>
          <div className="brw-payment-list">
            <div className="brw-payment-row">
              <span className="brw-payment-icon">💳</span>
              <div>
                <p className="brw-payment-name">Visa •••• 4242</p>
                <p className="brw-payment-type">Credit Card</p>
              </div>
              <span className="brw-payment-default">Default</span>
            </div>
            <div className="brw-payment-row">
              <span className="brw-payment-icon">📱</span>
              <div>
                <p className="brw-payment-name">Apple Pay</p>
                <p className="brw-payment-type">Mobile Wallet</p>
              </div>
            </div>
          </div>
          <button className="brw-manage-btn">+ Manage Wallets</button>
        </div>
      </div>
    </div>
  )
}