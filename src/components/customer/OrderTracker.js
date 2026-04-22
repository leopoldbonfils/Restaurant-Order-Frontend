import React from 'react'
import './OrderTracker.css'

const STEPS = [
  { key: 'PENDING',   label: 'Pending'   },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'READY',     label: 'Ready'     },
  { key: 'DELIVERED', label: 'Delivered' },
]

const STATUS_MSG = {
  PENDING:   (id) => `Order #${id} has been received — the kitchen will start soon.`,
  PREPARING: (id, items) => `Chef is preparing your ${items?.[0]?.menuItemName || 'order'}.`,
  READY:     (id) => `Order #${id} is ready! A waiter is on the way.`,
  DELIVERED: (id) => `Order #${id} delivered. Enjoy your meal! 🍽`,
  PAID:      (id) => `Payment confirmed for order #${id}. Thank you!`,
  CANCELLED: (id) => `Order #${id} was cancelled.`,
}

function timeAgo(iso) {
  if (!iso) return ''
  const mins = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (mins < 1) return 'just now'
  if (mins === 1) return '1 minute ago'
  return `${mins} minutes ago`
}

/* ── Order Summary Panel ─────────────────────────────────────────────────── */
function OrderSummary({ order }) {
  if (!order) return null

  const subtotal = order.totalAmount || 0

  return (
    <div className="bot-summary-panel">
      <h3 className="bot-summary-title">Order Summary</h3>

      <div className="bot-summary-items">
        {(order.items || []).map((item, i) => (
          <div key={i} className="bot-summary-row">
            <div className="bot-summary-emoji-wrap">
              <span className="bot-summary-emoji">{item.menuItemEmoji || '🍽'}</span>
            </div>
            <div className="bot-summary-info">
              <p className="bot-summary-name">{item.menuItemName}</p>
              <p className="bot-summary-sub">×{item.quantity}</p>
            </div>
            <span className="bot-summary-price">
              {Number(item.lineTotal).toLocaleString()} RWF
            </span>
          </div>
        ))}
      </div>

      <div className="bot-summary-totals">
        <div className="bot-total-row">
          <span>Subtotal</span>
          <span>{Number(subtotal).toLocaleString()} RWF</span>
        </div>
        <div className="bot-total-row bot-total-grand">
          <span>Total</span>
          <span className="bot-grand-val">{Number(subtotal).toLocaleString()} RWF</span>
        </div>
      </div>

      <div className="bot-support-btns">
        <p className="bot-support-label">Need to adjust your order?</p>
        <div className="bot-support-row">
          <button className="bot-support-btn outline">Contact Support</button>
          <button className="bot-support-btn filled">Call Waiter</button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Order Tracking View ────────────────────────────────────────────── */
export default function BistroOrderView({ orders, activeOrder, pastOrders }) {

  if (!orders.length && !pastOrders.length) {
    return (
      <div className="bot-empty">
        <span className="bot-empty-icon">🍽</span>
        <h3 className="bot-empty-title">No orders yet</h3>
        <p className="bot-empty-sub">Your order history will appear here</p>
      </div>
    )
  }

  const trackOrder = activeOrder || orders[0]
  const currentIdx = STEPS.findIndex((s) => s.key === trackOrder?.status)
  const isCancelled = trackOrder?.status === 'CANCELLED'
  const isPaid      = trackOrder?.status === 'PAID'

  return (
    <div className="bot-view">
      <div className="bot-main-col">

        {/* ── Active order tracker ── */}
        {trackOrder && !isPaid && (
          <div className="bot-tracker-card">
            <div className="bot-tracker-header">
              <h2 className="bot-tracker-title">Track Your Feast</h2>
              <p className="bot-tracker-sub">
                Order #{trackOrder.id}
                {trackOrder.estimatedPrepMinutes && !['READY','DELIVERED','PAID'].includes(trackOrder.status) && (
                  <> · Expected in {trackOrder.estimatedPrepMinutes} minutes</>
                )}
              </p>
            </div>

            {/* Step progress */}
            {!isCancelled && (
              <div className="bot-steps">
                {STEPS.map((step, idx) => {
                  const done   = idx < currentIdx
                  const active = idx === currentIdx
                  const last   = idx === STEPS.length - 1
                  return (
                    <React.Fragment key={step.key}>
                      <div className="bot-step">
                        <div className={`bot-step-circle ${done ? 'done' : active ? 'active' : 'pending'}`}>
                          {done ? '✓' : idx + 1}
                        </div>
                        <p className={`bot-step-label ${active ? 'active' : done ? 'done' : ''}`}>
                          {step.label}
                        </p>
                      </div>
                      {!last && (
                        <div className={`bot-step-line ${done ? 'done' : active ? 'active-line' : ''}`} />
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            )}

            {/* Status message */}
            {trackOrder.status && (
              <div className="bot-status-msg">
                <span className="bot-status-dot" />
                <p className="bot-status-text">
                  {(STATUS_MSG[trackOrder.status] || (() => ''))(trackOrder.id, trackOrder.items)}
                  {' '}
                  <span className="bot-status-time">Started {timeAgo(trackOrder.updatedAt || trackOrder.createdAt)}</span>
                </p>
              </div>
            )}

            {/* Map placeholder */}
            <div className="bot-map-placeholder">
              <div className="bot-map-bg">
                <div className="bot-map-label">📍 {trackOrder.tableNumber}</div>
                <div className="bot-map-grid">
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className="bot-map-cell" />
                  ))}
                </div>
                <div className="bot-courier-card">
                  <span className="bot-courier-avatar">👨‍🍳</span>
                  <div>
                    <p className="bot-courier-name">Your waiter</p>
                    <p className="bot-courier-sub">On the way</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Past orders ── */}
        {pastOrders.length > 0 && (
          <div className="bot-past-section">
            <h3 className="bot-past-title">Recent Orders</h3>
            <div className="bot-past-list">
              {pastOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="bot-past-row">
                  <div className="bot-past-info">
                    <p className="bot-past-id">Order #{order.id}</p>
                    <p className="bot-past-meta">
                      {order.items?.slice(0, 2).map((i) => i.menuItemName).join(', ')}
                      {order.items?.length > 2 && ` +${order.items.length - 2} more`}
                    </p>
                    <p className="bot-past-date">{timeAgo(order.createdAt)}</p>
                  </div>
                  <div className="bot-past-right">
                    <span className={`bot-past-status ${order.status === 'PAID' ? 'paid' : 'cancelled'}`}>
                      {order.status}
                    </span>
                    <p className="bot-past-amount">{Number(order.totalAmount).toLocaleString()} RWF</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Summary sidebar ── */}
      <OrderSummary order={trackOrder} />
    </div>
  )
}