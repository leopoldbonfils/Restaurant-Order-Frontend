import React from 'react'
import './MenuCard.css'

const DIETARY_BADGE = {
  VEGAN:       { label: 'Vegan',       cls: 'badge-green'  },
  VEGETARIAN:  { label: 'Veg',         cls: 'badge-green'  },
  HALAL:       { label: 'Halal',       cls: 'badge-amber'  },
  GLUTEN_FREE: { label: 'Gluten-free', cls: 'badge-purple' },
}

export default function MenuCard({ item, inCartQty, onAdd, onUpdateQty }) {
  return (
    <div className="menu-card">
      <div className="menu-card-inner">
        <div className="menu-card-emoji">{item.imageEmoji || '🍽'}</div>

        <div className="menu-card-body">
          <div className="menu-card-top">
            <h3 className="menu-card-name">{item.name}</h3>
            <span className="menu-card-price">
              {item.price?.toLocaleString()}
              <span className="menu-card-currency"> RWF</span>
            </span>
          </div>

          <p className="menu-card-desc">{item.description}</p>

          <div className="menu-card-bottom">
            <div className="menu-card-tags">
              <span className="badge badge-gray">⏱ {item.prepTimeMinutes}m</span>
              {(item.dietaryTags || []).map((tag) => {
                const b = DIETARY_BADGE[tag]
                return b ? (
                  <span key={tag} className={`badge ${b.cls}`}>{b.label}</span>
                ) : null
              })}
              {item.isSpicy && <span className="badge badge-red">🌶 Spicy</span>}
            </div>

            {inCartQty > 0 ? (
              <div className="menu-card-qty">
                <button onClick={() => onUpdateQty(item.id, -1)} className="qty-btn qty-minus">−</button>
                <span className="qty-num">{inCartQty}</span>
                <button onClick={() => onUpdateQty(item.id, 1)}  className="qty-btn qty-plus">+</button>
              </div>
            ) : (
              <button onClick={() => onAdd(item)} className="menu-card-add">+</button>
            )}
          </div>

          {(item.allergens || []).length > 0 && (
            <p className="menu-card-allergen">⚠ Contains: {item.allergens.join(', ')}</p>
          )}
        </div>
      </div>
    </div>
  )
}