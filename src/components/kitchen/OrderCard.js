import React, { useState, useEffect } from 'react'
import './OrderCard.css'

function useElapsed(createdAt) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const tick = () => {
      if (!createdAt) return
      setElapsed(Math.floor((Date.now() - new Date(createdAt)) / 60000))
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [createdAt])
  return elapsed
}

function elapsedLabel(mins) {
  if (mins < 1)   return 'just now'
  if (mins === 1) return '1m ago'
  return `${mins}m ago`
}

export default function KitchenOrderCard({ order, onAdvance }) {
  const elapsed  = useElapsed(order.createdAt)
  const isUrgent = elapsed >= 20 && order.status === 'PENDING'

  const cardClass = [
    'koc-card',
    order.status === 'PENDING'   ? 'koc-pending'   : '',
    order.status === 'PREPARING' ? 'koc-preparing'  : '',
    order.status === 'READY'     ? 'koc-ready'      : '',
    isUrgent                     ? 'koc-urgent'     : '',
  ].filter(Boolean).join(' ')

  /* Progress bar width for PREPARING (assume 20-min target) */
  const progress = order.status === 'PREPARING'
    ? Math.min(100, Math.round((elapsed / (order.estimatedPrepMinutes || 20)) * 100))
    : 0

  return (
    <div className={cardClass}>

      {/* Header row */}
      <div className="koc-header">
        <div className="koc-table-wrap">
          <span className="koc-table">{order.tableNumber?.replace('Table ', 'T-') || `#${order.id}`}</span>
          {order.status === 'READY' && <span className="koc-ready-check">✓</span>}
        </div>
        <div className="koc-meta">
          {order.status === 'PENDING' && (
            <span className="koc-badge koc-badge-received">RECEIVED</span>
          )}
          {order.status === 'PREPARING' && (
            <span className="koc-badge koc-badge-progress">IN PROGRESS</span>
          )}
          {order.status === 'READY' && (
            <span className="koc-badge koc-badge-ready">READY SINCE</span>
          )}
          <span className="koc-time">{elapsedLabel(elapsed)}</span>
        </div>
      </div>

      {/* Progress bar — only for PREPARING */}
      {order.status === 'PREPARING' && (
        <div className="koc-progress-wrap">
          <div className="koc-progress-bar">
            <div
              className="koc-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="koc-progress-label">{elapsed}m elapsed</span>
        </div>
      )}

      {/* Items */}
      <div className="koc-items">
        {(order.items || []).map((item, i) => (
          <div key={i} className="koc-item">
            <span className="koc-item-qty">{item.quantity}×</span>
            <span className="koc-item-name">{item.menuItemName}</span>
            {item.itemNotes && (
              <span className="koc-item-note">{item.itemNotes}</span>
            )}
          </div>
        ))}
      </div>

      {/* Special instructions */}
      {order.specialRequests && (
        <div className="koc-instructions">
          <p className="koc-instructions-label">⚡ INSTRUCTIONS</p>
          <p className="koc-instructions-text">{order.specialRequests}</p>
        </div>
      )}

      {/* Action buttons */}
      {order.status === 'PENDING' && (
        <button
          onClick={() => onAdvance(order.id, 'PREPARING')}
          className="koc-btn koc-btn-start"
        >
          Start Preparing
        </button>
      )}

      {order.status === 'PREPARING' && (
        <button
          onClick={() => onAdvance(order.id, 'READY')}
          className="koc-btn koc-btn-ready"
        >
          Mark as Ready
        </button>
      )}

      {order.status === 'READY' && (
        <div className="koc-btn-row">
          <button className="koc-btn koc-btn-print">
            Print Tag
          </button>
          <button
            onClick={() => onAdvance(order.id, 'DELIVERED')}
            className="koc-btn koc-btn-clear"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}