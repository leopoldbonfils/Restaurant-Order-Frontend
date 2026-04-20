import React from 'react'
import './AdminComponents.css'

const DIETARY_BADGE = {
  VEGAN:       { label: 'Vegan', cls: 'badge-green'  },
  HALAL:       { label: 'Halal', cls: 'badge-amber'  },
  GLUTEN_FREE: { label: 'GF',    cls: 'badge-purple' },
  VEGETARIAN:  { label: 'Veg',   cls: 'badge-green'  },
}

// ── MetricCards ──────────────────────────────────────────────────────────────
export function MetricCards({ analytics }) {
  const cards = [
    { label: 'Total orders',    value: analytics?.totalOrders      ?? '—', icon: '🛍' },
    { label: 'Completed today', value: analytics?.completedOrders  ?? '—', icon: '📈' },
    { label: 'Revenue (RWF)',   value: analytics?.totalRevenue ? Math.round(analytics.totalRevenue).toLocaleString() : '—', icon: '💰' },
    { label: 'Customers',       value: analytics?.uniqueCustomers  ?? '—', icon: '👥' },
  ]

  return (
    <div className="metric-cards">
      {cards.map((card) => (
        <div key={card.label} className="metric-card">
          <div className="metric-card-top">
            <p className="metric-card-label">{card.label}</p>
            <span className="metric-card-icon">{card.icon}</span>
          </div>
          <p className="metric-card-value">{card.value}</p>
        </div>
      ))}
    </div>
  )
}

// ── OrderPipeline ────────────────────────────────────────────────────────────
const PIPELINE_STEPS = [
  { key: 'PENDING',   color: '#f59e0b' },
  { key: 'PREPARING', color: '#3b82f6' },
  { key: 'READY',     color: '#22c55e' },
  { key: 'DELIVERED', color: '#8b5cf6' },
  { key: 'PAID',      color: '#14b8a6' },
  { key: 'CANCELLED', color: '#f87171' },
]

export function OrderPipeline({ orders, analytics }) {
  const total = orders.length || 1
  const avgValue = analytics?.averageOrderValue
    ? Math.round(analytics.averageOrderValue).toLocaleString() : '—'

  return (
    <div className="pipeline-card">
      <h2 className="admin-card-title">Order pipeline</h2>
      <div className="pipeline-steps">
        {PIPELINE_STEPS.map(({ key, color }) => {
          const count = orders.filter((o) => o.status === key).length
          const pct   = Math.max(4, Math.round((count / total) * 100))
          return (
            <div key={key} className="pipeline-row">
              <div className="pipeline-row-info">
                <span className="pipeline-label">{key.toLowerCase()}</span>
                <span className="pipeline-count">{count}</span>
              </div>
              <div className="pipeline-bar-track">
                <div
                  className="pipeline-bar-fill"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="pipeline-footer">
        <div className="pipeline-footer-row">
          <span>Avg order value</span>
          <span className="pipeline-footer-val">{avgValue} RWF</span>
        </div>
        {analytics?.totalLoyaltyPoints > 0 && (
          <div className="pipeline-footer-row">
            <span>Loyalty points issued</span>
            <span className="pipeline-footer-val">{analytics.totalLoyaltyPoints.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── TopItems ─────────────────────────────────────────────────────────────────
export function TopItems({ items }) {
  return (
    <div className="top-items-card">
      <h2 className="admin-card-title">Top selling items</h2>
      {!items || items.length === 0 ? (
        <div className="top-items-empty">No sales data yet</div>
      ) : (
        <div className="top-items-list">
          {items.slice(0, 6).map((item, i) => (
            <div key={i} className="top-item-row">
              <span className="top-item-rank">{i + 1}</span>
              <span className="top-item-name">{item.name}</span>
              <span className="top-item-sold">{item.quantitySold} sold</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── MenuManager ──────────────────────────────────────────────────────────────
export function MenuManager({ menuItems, onToggle }) {
  const available = menuItems.filter((m) => m.isAvailable).length

  return (
    <div className="menu-manager-card">
      <div className="menu-manager-header">
        <h2 className="admin-card-title">Menu management</h2>
        <span className="menu-manager-count">{available} of {menuItems.length} available</span>
      </div>
      <div className="menu-manager-list">
        {menuItems.map((item) => (
          <div key={item.id} className="menu-manager-item">
            <span className="menu-manager-emoji">{item.imageEmoji || '🍽'}</span>
            <div className="menu-manager-info">
              <div className="menu-manager-name-row">
                <p className="menu-manager-name">{item.name}</p>
                {!item.isAvailable && (
                  <span className="badge badge-red">Unavailable</span>
                )}
              </div>
              <p className="menu-manager-meta">{item.category} · {item.price?.toLocaleString()} RWF</p>
            </div>
            <div className="menu-manager-tags">
              {(item.dietaryTags || []).map((tag) => {
                const b = DIETARY_BADGE[tag]
                return b ? <span key={tag} className={`badge ${b.cls}`}>{b.label}</span> : null
              })}
              {item.isSpicy && <span className="badge badge-red">Spicy</span>}
            </div>
            <button
              onClick={() => onToggle(item.id)}
              className={`toggle-btn ${item.isAvailable ? 'on' : 'off'}`}
            >
              <span className={`toggle-knob ${item.isAvailable ? 'on' : 'off'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}