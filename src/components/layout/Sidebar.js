import React from 'react'
import './Sidebar.css'

const NAV_ITEMS = [
  { key: 'customer', label: 'Customer',  icon: '🍽', description: 'Browse & order',  requiresRole: null },
  { key: 'kitchen',  label: 'Kitchen',   icon: '👨‍🍳', description: 'Order board',     requiresRole: 'KITCHEN' },
  { key: 'admin',    label: 'Admin',     icon: '📊', description: 'Dashboard',       requiresRole: 'ADMIN' },
]

export default function Sidebar({ currentPage, onNavigate, auth, onLogout }) {
  const canAccess = (item) => {
    if (!item.requiresRole) return true
    if (!auth) return false
    if (item.requiresRole === 'KITCHEN') return auth.role === 'KITCHEN' || auth.role === 'ADMIN'
    if (item.requiresRole === 'ADMIN')   return auth.role === 'ADMIN'
    return false
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🍴</div>
        <div>
          <p className="sidebar-brand-name">DineFlow</p>
          <p className="sidebar-brand-sub">Order Management</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-nav-label">Portals</p>
        {NAV_ITEMS.map((item) => {
          const active   = currentPage === item.key
          const locked   = !canAccess(item)
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              disabled={locked}
              className={`sidebar-nav-item ${active ? 'active' : ''} ${locked ? 'locked' : ''}`}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <div className="sidebar-nav-text">
                <p className="sidebar-nav-title">{item.label}</p>
                <p className="sidebar-nav-desc">
                  {locked ? 'Login required' : item.description}
                </p>
              </div>
              {active && <span className="sidebar-nav-dot" />}
            </button>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        {auth ? (
          <>
            <div className="sidebar-user">
              <span className="sidebar-user-icon">
                {auth.role === 'ADMIN' ? '🛡' : '👤'}
              </span>
              <div className="sidebar-user-info">
                <p className="sidebar-user-email">{auth.email}</p>
                <p className="sidebar-user-role">{auth.role?.toLowerCase()}</p>
              </div>
            </div>
            <button className="sidebar-logout-btn" onClick={onLogout}>
              <span>🚪</span> Sign out
            </button>
          </>
        ) : (
          <button className="sidebar-login-btn" onClick={() => onNavigate('login')}>
            <span>👤</span>
            <div>
              <p>Staff login</p>
              <p className="sidebar-login-sub">Kitchen &amp; Admin</p>
            </div>
          </button>
        )}
      </div>
    </aside>
  )
}