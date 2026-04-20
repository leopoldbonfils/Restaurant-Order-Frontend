import React from 'react'
import './OrderCard.css'

const ACTION = {
  PENDING:   { label: 'Start cooking',   cls: 'btn-blue',   next: 'PREPARING' },
  PREPARING: { label: 'Mark ready',      cls: 'btn-green',  next: 'READY'     },
  READY:     { label: 'Mark delivered',  cls: 'btn-purple', next: 'DELIVERED' },
  DELIVERED: { label: 'Confirm payment', cls: 'btn-teal',   next: 'PAID'      },
}

function timeAgo(iso) {
  if (!iso) return ''
  const mins = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (mins < 1)   return 'just now'
  if (mins === 1) return '1 min ago'
  return `${mins} min ago`
}

export default function OrderCard({ order, onAdvance }) {
  const action = ACTION[order.status]
  const elapsedMins = order.createdAt
    ? Math.floor((Date.now() - new Date(order.createdAt)) / 60000) : 0
  const isUrgent = elapsedMins >= 20 && order.status === 'PENDING'

  return (
    <div className={`order-card ${isUrgent ? 'urgent' : ''}`}>
      <div className="order-card-header">
        <div>
          <p className="order-card-table">{order.tableNumber}</p>
          <p className={`order-card-time ${isUrgent ? 'urgent-text' : ''}`}>
            🕐 {timeAgo(order.createdAt)}{isUrgent && ' — urgent!'}
          </p>
        </div>
        <div className="order-card-right">
          <p className="order-card-amount">{order.totalAmount?.toLocaleString()} RWF</p>
          <p className="order-card-id">#{order.id}</p>
        </div>
      </div>

      <div className="order-card-items">
        {(order.items || []).map((item, i) => (
          <div key={i} className="order-card-item">
            <span>
              <span className="order-card-qty">{item.quantity}×</span> {item.menuItemName}
            </span>
            {item.itemNotes && (
              <span className="order-card-note">{item.itemNotes}</span>
            )}
          </div>
        ))}
      </div>

      {order.specialRequests && (
        <div className="order-card-special">
          <span>💬</span>
          <p>{order.specialRequests}</p>
        </div>
      )}

      {action && (
        <button
          onClick={() => onAdvance(order.id, action.next)}
          className={`order-card-btn ${action.cls}`}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}