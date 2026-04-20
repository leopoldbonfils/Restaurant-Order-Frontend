import React, { useState } from 'react'
import MenuCard from './MenuCard'
import './MenuGrid.css'

const FILTERS = [
  { key: 'ALL',         label: 'All items'   },
  { key: 'VEGAN',       label: 'Vegan'       },
  { key: 'HALAL',       label: 'Halal'       },
  { key: 'GLUTEN_FREE', label: 'Gluten-free' },
]

export default function MenuGrid({ menuItems, categories, cart, onAdd, onUpdateQty, loading }) {
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [search, setSearch]             = useState('')

  const getCartQty = (itemId) => cart.find((c) => c.id === itemId)?.qty || 0

  const filterItems = (items) => {
    let filtered = items
    if (activeFilter !== 'ALL') {
      filtered = filtered.filter((i) => (i.dietaryTags || []).includes(activeFilter))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
      )
    }
    return filtered
  }

  if (loading) {
    return (
      <div className="menu-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="menu-skeleton" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="menu-controls">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search menu items…"
          className="menu-search"
        />
        <div className="menu-filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`menu-filter-btn ${activeFilter === f.key ? 'active' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {categories.map((cat) => {
        const items = filterItems(menuItems.filter((m) => m.category === cat))
        if (!items.length) return null
        return (
          <div key={cat} className="menu-category">
            <div className="menu-category-header">
              <h2 className="menu-category-title">{cat}</h2>
              <div className="menu-category-line" />
              <span className="menu-category-count">{items.length}</span>
            </div>
            <div className="menu-grid">
              {items.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  inCartQty={getCartQty(item.id)}
                  onAdd={onAdd}
                  onUpdateQty={onUpdateQty}
                />
              ))}
            </div>
          </div>
        )
      })}

      {categories.every((cat) => !filterItems(menuItems.filter((m) => m.category === cat)).length) && (
        <div className="menu-empty">
          <p className="menu-empty-icon">🔍</p>
          <p className="menu-empty-title">No items found</p>
          <p className="menu-empty-sub">Try a different filter or search term</p>
        </div>
      )}
    </div>
  )
}