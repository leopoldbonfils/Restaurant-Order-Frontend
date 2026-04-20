import React from 'react'
import './OrderTracker.css'

const STEPS = [
  { key: 'PENDING',   label: 'Received',  icon: '🕐' },
  { key: 'PREPARING', label: 'Cooking',   icon: '👨‍🍳' },
  { key: 'READY',     label: 'Ready',     icon: '✅' },
  { key: 'DELIVERED', label: 'Delivered', icon: '🚚' },
  { key: 'PAID',      label: 'Paid',      icon: '💳' },
]

const STATUS_MSG = {
  PENDING:   'Your order has been received by the kitchen.',
  PREPARING: 'The chef is preparing your meal right now.',
  READY:     'Your order is ready! A waiter is on the way.',
  DELIVERED: 'Enjoy your meal! Ask your waiter when ready to pay.',
  PAID:      'Payment confirmed. Thank you for dining with us!',
  CANCELLED: 'This order was cancelled.',
}

export default function OrderTracker({ order }) {
  const currentIdx = STEPS.findIndex((s) => s.key === order.status)

  if (order.status === 'CANCELLED') {
    return (
      <div className="tracker-cancelled">
        <p className="tracker-cancelled-title">Order #{order.id} · Cancelled</p>
        <p className="tracker-cancelled-sub">{STATUS_MSG.CANCELLED}</p>
      </div>
    )
  }

  return (
    <div className="tracker-card">
      <div className="tracker-header">
        <div>
          <p className="tracker-order-id">
            Order #{order.id} <span className="tracker-live">· Live tracking</span>
          </p>
          {order.estimatedPrepMinutes &&
            !['READY', 'DELIVERED', 'PAID'].includes(order.status) && (
            <p className="tracker-eta">Est. {order.estimatedPrepMinutes} min</p>
          )}
        </div>
        <span className={`tracker-status-pill tracker-status-${order.status.toLowerCase()}`}>
          {order.status}
        </span>
      </div>

      <div className="tracker-steps">
        {STEPS.map((step, idx) => {
          const done   = idx < currentIdx
          const active = idx === currentIdx
          return (
            <React.Fragment key={step.key}>
              <div className="tracker-step">
                <div className={`tracker-step-circle ${done ? 'done' : active ? 'active' : 'pending'}`}>
                  {done ? '✓' : step.icon}
                </div>
                <p className={`tracker-step-label ${done ? 'done' : active ? 'active' : 'pending'}`}>
                  {step.label}
                </p>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`tracker-line ${idx < currentIdx ? 'done' : ''}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      <p className="tracker-msg">{STATUS_MSG[order.status] || ''}</p>

      <div className="tracker-items">
        {(order.items || []).map((item, i) => (
          <span key={i} className="tracker-item-chip">
            {item.quantity}× {item.menuItemName}
          </span>
        ))}
      </div>
    </div>
  )
}