import React from 'react'
import './OrderTracker.css'

const STEPS = [
  { key: 'PENDING',   label: 'Pending'   },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'READY',     label: 'Ready'     },
  { key: 'DELIVERED', label: 'Delivered' },
]

const STATUS_MSG = {
  PENDING:   (id)        => `Order #${id} has been received — the kitchen will start soon.`,
  PREPARING: (id, items) => `Chef is preparing your ${items?.[0]?.menuItemName || 'order'}.`,
  READY:     (id)        => `Order #${id} is ready! A waiter is on the way.`,
  DELIVERED: (id)        => `Order #${id} delivered. Enjoy your meal! 🍽`,
  PAID:      (id)        => `Payment confirmed for order #${id}. Thank you!`,
  CANCELLED: (id)        => `Order #${id} was cancelled.`,
}

const STATUS_ICONS = {
  PENDING:   '🕐',
  PREPARING: '👨‍🍳',
  READY:     '✅',
  DELIVERED: '🛵',
  PAID:      '💳',
  CANCELLED: '❌',
}

function timeAgo(iso) {
  if (!iso) return ''
  const mins = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (mins < 1) return 'just now'
  if (mins === 1) return '1 minute ago'
  return `${mins} minutes ago`
}

/* ── Item Thumbnail ──────────────────────────────────────────────────────── */
function ItemThumb({ item }) {
  const [imgError, setImgError] = React.useState(false)
  const hasImage = item.imageUrl && !imgError

  return (
    <div className="ot-thumb">
      {hasImage ? (
        <img
          src={item.imageUrl}
          alt={item.menuItemName}
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="ot-thumb-fallback">{item.menuItemEmoji || '🍽'}</span>
      )}
    </div>
  )
}

/* ── Order Summary Panel ─────────────────────────────────────────────────── */
function OrderSummary({ order }) {
  if (!order) return null

  const subtotal = order.totalAmount || 0
  const deliveryFee = order.deliveryFee || 0
  const total = subtotal + deliveryFee

  return (
    <div className="ot-summary-panel">
      <h3 className="ot-summary-title">Order Summary</h3>

      <div className="ot-summary-items">
        {(order.items || []).map((item, i) => (
          <div key={i} className="ot-summary-row">
            <ItemThumb item={item} />
            <div className="ot-summary-info">
              <p className="ot-summary-name">{item.menuItemName}</p>
              {item.menuItemDescription && (
                <p className="ot-summary-sub">{item.menuItemDescription}</p>
              )}
            </div>
            <span className="ot-summary-price">
              {Number(item.lineTotal).toLocaleString()} RWF
            </span>
          </div>
        ))}
      </div>

      <div className="ot-summary-totals">
        <div className="ot-total-row">
          <span>Subtotal</span>
          <span>{Number(subtotal).toLocaleString()} RWF</span>
        </div>
        {deliveryFee > 0 && (
          <div className="ot-total-row">
            <span>Delivery Fee</span>
            <span>{Number(deliveryFee).toLocaleString()} RWF</span>
          </div>
        )}
        <div className="ot-total-row ot-total-grand">
          <span>Total</span>
          <span className="ot-grand-val">
            {Number(deliveryFee > 0 ? total : subtotal).toLocaleString()} RWF
          </span>
        </div>
      </div>

      <div className="ot-support-box">
        <p className="ot-support-label">Need to adjust your order?</p>
        <div className="ot-support-row">
          <button className="ot-support-btn outline">Contact Support</button>
          <button className="ot-support-btn filled">Call Waiter</button>
        </div>
      </div>
    </div>
  )
}

/* ── Map Section ─────────────────────────────────────────────────────────── */
function OrderMap({ order }) {
  return (
    <div className="ot-map-wrap">
      <iframe
        className="ot-map-iframe"
        title="Restaurant Location"
        src="https://www.openstreetmap.org/export/embed.html?bbox=29.9900%2C-2.0200%2C30.1400%2C-1.8700&amp;layer=mapnik"
        loading="lazy"
        allowFullScreen
      />
      <div className="ot-courier-card">
        <div className="ot-courier-avatar">👨‍🍳</div>
        <div className="ot-courier-info">
          <p className="ot-courier-name">Your waiter</p>
          <p className="ot-courier-rating">
            <span className="ot-star">★</span> 4.9
            <span className="ot-courier-orders"> · On the way</span>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Main Order Tracking View ────────────────────────────────────────────── */
export default function BistroOrderView({ orders, activeOrder, pastOrders }) {

  if (!orders.length && !pastOrders.length) {
    return (
      <div className="ot-empty">
        <div className="ot-empty-icon">🍽</div>
        <h3 className="ot-empty-title">No orders yet</h3>
        <p className="ot-empty-sub">Your order history will appear here once you place an order.</p>
      </div>
    )
  }

  const trackOrder = activeOrder || orders[0]
  const currentIdx  = STEPS.findIndex((s) => s.key === trackOrder?.status)
  const isCancelled = trackOrder?.status === 'CANCELLED'
  const isPaid      = trackOrder?.status === 'PAID'

  return (
    <div className="ot-view">
      {/* ── Left column ── */}
      <div className="ot-main-col">

        {/* Active tracker card */}
        {trackOrder && !isPaid && (
          <div className="ot-tracker-card">
            {/* Header */}
            <div className="ot-tracker-header">
              <div>
                <h2 className="ot-tracker-title">Track Your Feast</h2>
                <p className="ot-tracker-sub">
                  Order #{trackOrder.id}
                  {trackOrder.estimatedPrepMinutes &&
                    !['READY', 'DELIVERED', 'PAID'].includes(trackOrder.status) && (
                      <> · <span className="ot-eta">Expected in {trackOrder.estimatedPrepMinutes} minutes</span></>
                  )}
                </p>
              </div>
            </div>

            {/* Progress steps */}
            {!isCancelled && (
              <div className="ot-steps">
                {STEPS.map((step, idx) => {
                  const done   = idx < currentIdx
                  const active = idx === currentIdx
                  const last   = idx === STEPS.length - 1
                  return (
                    <React.Fragment key={step.key}>
                      <div className="ot-step">
                        <div className={`ot-step-circle ${done ? 'done' : active ? 'active' : 'pending'}`}>
                          {done ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          ) : active ? (
                            <div className="ot-step-pulse" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                        <p className={`ot-step-label ${active ? 'active' : done ? 'done' : ''}`}>
                          {step.label}
                        </p>
                      </div>
                      {!last && (
                        <div className={`ot-step-line ${done ? 'done' : active ? 'half' : ''}`} />
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            )}

            {/* Cancelled badge */}
            {isCancelled && (
              <div className="ot-cancelled-badge">
                ❌ This order was cancelled
              </div>
            )}

            {/* Status message */}
            {trackOrder.status && !isCancelled && (
              <div className="ot-status-msg">
                <span className="ot-status-icon">
                  {STATUS_ICONS[trackOrder.status] || '🍽'}
                </span>
                <div>
                  <p className="ot-status-text">
                    {(STATUS_MSG[trackOrder.status] || (() => ''))(trackOrder.id, trackOrder.items)}
                  </p>
                  <p className="ot-status-time">
                    Started {timeAgo(trackOrder.updatedAt || trackOrder.createdAt)}
                  </p>
                </div>
              </div>
            )}

            {/* Map */}
            {!isCancelled && <OrderMap order={trackOrder} />}
          </div>
        )}

        {/* Paid order summary card */}
        {isPaid && (
          <div className="ot-tracker-card ot-paid-card">
            <div className="ot-paid-icon">🎉</div>
            <h2 className="ot-tracker-title">Thank You!</h2>
            <p className="ot-tracker-sub">
              {STATUS_MSG.PAID(trackOrder.id)}
            </p>
          </div>
        )}

        {/* Past orders */}
        {pastOrders.length > 0 && (
          <div className="ot-past-section">
            <h3 className="ot-past-title">Recent Orders</h3>
            <div className="ot-past-list">
              {pastOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="ot-past-row">
                  <div className="ot-past-icon">
                    {order.status === 'PAID' ? '✅' : '❌'}
                  </div>
                  <div className="ot-past-info">
                    <p className="ot-past-id">Order #{order.id}</p>
                    <p className="ot-past-meta">
                      {order.items?.slice(0, 2).map((i) => i.menuItemName).join(', ')}
                      {order.items?.length > 2 && ` +${order.items.length - 2} more`}
                    </p>
                    <p className="ot-past-date">{timeAgo(order.createdAt)}</p>
                  </div>
                  <div className="ot-past-right">
                    <span className={`ot-past-badge ${order.status === 'PAID' ? 'paid' : 'cancelled'}`}>
                      {order.status}
                    </span>
                    <p className="ot-past-amount">{Number(order.totalAmount).toLocaleString()} RWF</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Right summary panel ── */}
      <OrderSummary order={trackOrder} />
    </div>
  )
}