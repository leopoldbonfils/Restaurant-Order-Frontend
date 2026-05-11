import React from 'react'
import './Sidebar.css'

const NAV_ITEMS = [
  { key: 'customer', label: 'Customer Portal', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ), description: 'Order & Dine-In', requiresRole: null },
  { key: 'kitchen', label: 'Kitchen Hub', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>
  ), description: 'Active Orders', requiresRole: 'KITCHEN' },
  { key: 'admin', label: 'Management', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
  ), description: 'Analytics & Staff', requiresRole: 'ADMIN' },
]

export default function Sidebar({ currentPage, onNavigate, auth, onLogout, theme, onToggleTheme }) {
  const canAccess = (item) => {
    if (!item.requiresRole) return true
    if (!auth) return false
    if (item.requiresRole === 'KITCHEN') return auth.role === 'KITCHEN' || auth.role === 'ADMIN'
    if (item.requiresRole === 'ADMIN')   return auth.role === 'ADMIN'
    return false
  }

  const isDark = theme === 'dark'

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"/><path d="M12 7v5l3 3"/></svg>
          </div>
          <div className="brand-text">
            <p className="brand-name">BistroFlow</p>
            <p className="brand-tag">Smart Ordering</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="nav-section-label">Portals</p>
          {NAV_ITEMS.map((item) => {
            const active = currentPage === item.key
            const locked = !canAccess(item)
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                disabled={locked}
                className={`nav-item ${active ? 'active' : ''} ${locked ? 'locked' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <div className="nav-info">
                  <p className="nav-label">{item.label}</p>
                  <p className="nav-desc">{locked ? 'Staff Access Only' : item.description}</p>
                </div>
                {active && <div className="active-indicator" />}
                {locked && <span className="lock-icon">🔒</span>}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* Theme Toggle */}
          <button className="theme-toggle" onClick={onToggleTheme}>
            <div className={`toggle-track ${isDark ? 'dark' : 'light'}`}>
              <div className="toggle-thumb">
                {isDark ? '🌙' : '☀️'}
              </div>
            </div>
            <span className="theme-text">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
          </button>

          {/* User Section */}
          {auth ? (
            <div className="user-profile">
              <div className="user-avatar">
                {auth.email.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <p className="user-email">{auth.email}</p>
                <p className="user-role">{auth.role}</p>
              </div>
              <button className="logout-btn" onClick={onLogout} title="Logout">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          ) : (
            <button className="login-cta" onClick={() => onNavigate('login')}>
              <div className="login-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              </div>
              <span>Staff Login</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}