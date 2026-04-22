import React, { useState } from 'react'
import './AdminComponents.css'

/* ══════════════════════════════════════════════════════════════════════════
   METRIC CARDS
══════════════════════════════════════════════════════════════════════════ */
export function AdminMetricCards({ analytics, orders, activeTables, staffOnDuty }) {
  const totalOrders  = analytics?.totalOrders    ?? 0
  const totalRevenue = analytics?.totalRevenue   ?? 0
  const totalTables  = 14  // demo value
  const tablePercent = totalTables ? Math.round((activeTables / totalTables) * 100) : 0

  const cards = [
    {
      label: 'TOTAL ORDERS TODAY',
      value: totalOrders,
      change: '+12%',
      changeUp: true,
      icon: '◫',
      iconBg: '#fde8df',
      iconColor: '#e05a2b',
      sub: null,
    },
    {
      label: 'TOTAL REVENUE',
      value: `$${Number(totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: '+8.4%',
      changeUp: true,
      icon: '💵',
      iconBg: '#fde8df',
      iconColor: '#e05a2b',
      sub: null,
    },
    {
      label: 'ACTIVE TABLES',
      value: `${tablePercent}%`,
      change: `${activeTables}/${totalTables}`,
      changeUp: null,
      icon: '⊟',
      iconBg: '#f0fdf4',
      iconColor: '#16a34a',
      sub: 'Occ.',
      badge: 'Checked-In',
      badgeColor: '#16a34a',
      badgeBg: '#dcfce7',
    },
    {
      label: 'STAFF ACTIVITY',
      value: staffOnDuty,
      change: 'On-Duty',
      changeUp: null,
      icon: '👤',
      iconBg: '#f8f7f4',
      iconColor: '#64748b',
      sub: null,
    },
  ]

  return (
    <div className="bac-metric-grid">
      {cards.map((card, i) => (
        <div key={i} className="bac-metric-card">
          <div className="bac-metric-top">
            <div className="bac-metric-left">
              <div className="bac-metric-icon-wrap" style={{ background: card.iconBg }}>
                <span className="bac-metric-icon" style={{ color: card.iconColor }}>{card.icon}</span>
              </div>
              {card.change && (
                card.changeUp !== null ? (
                  <span className={`bac-metric-change ${card.changeUp ? 'up' : 'down'}`}>
                    {card.changeUp ? '▲' : '▼'} {card.change}
                  </span>
                ) : card.badge ? (
                  <span className="bac-metric-badge" style={{ color: card.badgeColor, background: card.badgeBg }}>
                    {card.badge}
                  </span>
                ) : null
              )}
            </div>
          </div>
          <p className="bac-metric-label">{card.label}</p>
          <div className="bac-metric-value-row">
            <span className="bac-metric-value">{card.value}</span>
            {card.sub && <span className="bac-metric-sub">{card.sub}</span>}
            {card.changeUp === null && !card.badge && (
              <span className="bac-metric-duty">{card.change}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   SALES ANALYTICS CHART
══════════════════════════════════════════════════════════════════════════ */
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MOCK_WEEK  = [3200, 4800, 3900, 5200, 4100, 6800, 4821]
const MOCK_MONTH = [2800, 3200, 4100, 3800, 5200, 4600, 4821, 5800,
                    4200, 3900, 5100, 4700, 6200, 5400, 4900, 5300,
                    4100, 4800, 5600, 4300, 5900, 4700, 5200, 4800,
                    5100, 4600, 5800, 4200, 4900, 4821]

export function SalesAnalyticsChart({ range, onRangeChange }) {
  const data      = range === 'week' ? MOCK_WEEK : MOCK_MONTH.slice(-14)
  const labels    = range === 'week' ? DAY_LABELS : MOCK_MONTH.slice(-14).map((_, i) => `${i + 1}`)
  const maxVal    = Math.max(...data)
  const chartH    = 120
  const chartW    = 100
  const padB      = 24
  const padT      = 10

  /* Build SVG polyline points */
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * chartW
    const y = padT + ((maxVal - v) / maxVal) * (chartH - padB - padT)
    return `${x},${y}`
  }).join(' ')

  /* Area fill points */
  const areaPoints = [
    `0,${chartH - padB}`,
    ...data.map((v, i) => {
      const x = (i / (data.length - 1)) * chartW
      const y = padT + ((maxVal - v) / maxVal) * (chartH - padB - padT)
      return `${x},${y}`
    }),
    `${chartW},${chartH - padB}`,
  ].join(' ')

  return (
    <div className="bac-chart-card">
      <div className="bac-chart-header">
        <div>
          <h2 className="bac-card-title">Sales Analytics</h2>
          <p className="bac-card-sub">Peak hours and revenue trends</p>
        </div>
        <div className="bac-chart-tabs">
          <button
            onClick={() => onRangeChange('week')}
            className={`bac-chart-tab ${range === 'week' ? 'active' : ''}`}
          >Week</button>
          <button
            onClick={() => onRangeChange('month')}
            className={`bac-chart-tab ${range === 'month' ? 'active' : ''}`}
          >Month</button>
        </div>
      </div>

      <div className="bac-chart-area">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none" className="bac-svg">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#e05a2b" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#e05a2b" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill="url(#chartGrad)" />
          <polyline
            points={points}
            fill="none"
            stroke="#e05a2b"
            strokeWidth="1.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Dots */}
          {data.map((v, i) => {
            const x = (i / (data.length - 1)) * chartW
            const y = padT + ((maxVal - v) / maxVal) * (chartH - padB - padT)
            return <circle key={i} cx={x} cy={y} r="1.2" fill="#e05a2b" />
          })}
        </svg>

        {/* X-axis labels */}
        <div className="bac-chart-labels">
          {labels.map((l, i) => (
            <span key={i} className="bac-chart-label">{l}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   POPULAR DISHES
══════════════════════════════════════════════════════════════════════════ */
const DISH_EMOJIS = {
  'Brochette':          '🍢',
  'Truffle Avocado Toast': '🥑',
  'Wild Mushroom Pizza':   '🍕',
  'Dry-Aged Ribeye':       '🥩',
  'Lemon Butter Salmon':   '🐟',
  'Sambaza':            '🐟',
  'Isombe':             '🥬',
  'Ugali':              '🍚',
  'Ibihaza':            '🎃',
  'Mizuzu':             '🍌',
  'Chips':              '🍟',
  'Primus Beer':        '🍺',
  'Fanta':              '🥤',
  'Ikawa (Coffee)':     '☕',
  'Passion Fruit Juice':'🍹',
  'Akabanga Wings':     '🍗',
}

export function PopularDishes({ items, menuItems }) {
  const priceMap = {}
  ;(menuItems || []).forEach((m) => { priceMap[m.name] = m.price })

  const dishes = (items || []).slice(0, 5).map((item) => ({
    name:     item.name,
    orders:   item.quantitySold,
    price:    priceMap[item.name] ?? 0,
    emoji:    DISH_EMOJIS[item.name] || '🍽',
  }))

  return (
    <div className="bac-popular-card">
      <h2 className="bac-card-title" style={{ marginBottom: 4 }}>Popular Dishes</h2>

      {dishes.length === 0 ? (
        <div className="bac-popular-empty">No sales data yet</div>
      ) : (
        <div className="bac-popular-list">
          {dishes.map((dish, i) => (
            <div key={i} className="bac-popular-row">
              <div className="bac-popular-emoji-wrap">
                <span className="bac-popular-emoji">{dish.emoji}</span>
              </div>
              <div className="bac-popular-info">
                <p className="bac-popular-name">{dish.name}</p>
                <p className="bac-popular-orders">{dish.orders} orders this month</p>
              </div>
              <span className="bac-popular-price">
                {Number(dish.price).toLocaleString()} RWF
              </span>
            </div>
          ))}
        </div>
      )}

      <button className="bac-popular-link">
        View detailed menu reports →
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   MENU TABLE
══════════════════════════════════════════════════════════════════════════ */
const CAT_COLORS = {
  'Main Course': { bg: '#fde8df', color: '#e05a2b' },
  'Appetizer':   { bg: '#fef3c7', color: '#d97706' },
  'Side':        { bg: '#f0fdf4', color: '#16a34a' },
  'Drinks':      { bg: '#eff6ff', color: '#2563eb' },
}

export function AdminMenuTable({
  menuItems, allMenuItems, categories,
  catFilter, onCatFilter, onToggle, onRefresh,
}) {
  return (
    <div className="bac-menu-card">
      <div className="bac-menu-header">
        <div>
          <h2 className="bac-card-title">Menu Management</h2>
          <p className="bac-card-sub">Update prices and item availability</p>
        </div>
        <div className="bac-menu-header-right">
          <div className="bac-cat-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCatFilter(cat)}
                className={`bac-cat-tab ${catFilter === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button className="bac-add-btn">+ Add New Item</button>
        </div>
      </div>

      <table className="bac-table">
        <thead>
          <tr>
            <th>DISH NAME</th>
            <th>CATEGORY</th>
            <th>PRICE</th>
            <th>AVAILABILITY</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {menuItems.map((item) => {
            const catStyle = CAT_COLORS[item.category] || { bg: '#f3f4f6', color: '#6b7280' }
            return (
              <tr key={item.id}>
                <td>
                  <div className="bac-table-dish">
                    <div className="bac-table-emoji-wrap">
                      <span className="bac-table-emoji">{item.imageEmoji || '🍽'}</span>
                    </div>
                    <div>
                      <p className="bac-table-name">{item.name}</p>
                      <p className="bac-table-desc">
                        {item.description?.slice(0, 32) || `#menu-${item.id}`}
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className="bac-cat-pill"
                    style={{ background: catStyle.bg, color: catStyle.color }}
                  >
                    {item.category}
                  </span>
                </td>
                <td>
                  <span className="bac-table-price">
                    {Number(item.price).toLocaleString()} RWF
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => onToggle(item.id)}
                    className={`bac-toggle ${item.isAvailable ? 'on' : 'off'}`}
                  >
                    <span className={`bac-toggle-knob ${item.isAvailable ? 'on' : 'off'}`} />
                  </button>
                </td>
                <td>
                  <button className="bac-action-btn" title="Edit">✏</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="bac-table-footer">
        <p className="bac-table-count">
          Showing 1–{Math.min(menuItems.length, 10)} of {allMenuItems.length} dishes
        </p>
        <div className="bac-pagination">
          <button className="bac-page-btn">‹</button>
          <button className="bac-page-btn">›</button>
        </div>
      </div>
    </div>
  )
}