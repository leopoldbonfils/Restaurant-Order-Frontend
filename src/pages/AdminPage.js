import React, { useState, useEffect, useContext, useCallback } from 'react'
import { ToastContext } from '../App'
import {
  AdminMetricCards,
  SalesAnalyticsChart,
  PopularDishes,
  AdminMenuTable,
} from '../components/admin/AdminComponents'
import { getAllOrders, getAnalytics } from '../api/orders'
import { getAllMenu, toggleAvailability, createMenuItem } from '../api/menu'
import './AdminPage.css'

const SIDEBAR_NAV = [
  { key: 'dashboard', label: 'Dashboard',       icon: '⊞' },
  { key: 'orders',    label: 'Orders',           icon: '◫' },
  { key: 'menu',      label: 'Menu Management',  icon: '☰' },
  { key: 'analytics', label: 'Analytics',        icon: '◷' },
  { key: 'staff',     label: 'Staff',            icon: '👤' },
]

export default function AdminPage({ onLogout }) {
  const showToast   = useContext(ToastContext)
  const [activePage, setActivePage] = useState('dashboard')
  const [chartRange, setChartRange] = useState('month')
  const [catFilter,  setCatFilter]  = useState('All Categories')
  const [search,     setSearch]     = useState('')
  const [orders,     setOrders]     = useState([])
  const [analytics,  setAnalytics]  = useState(null)
  const [menuItems,  setMenuItems]  = useState([])
  const [loading,    setLoading]    = useState(true)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [oRes, aRes, mRes] = await Promise.all([
        getAllOrders(), getAnalytics(), getAllMenu(),
      ])
      setOrders(oRes.data   || [])
      setAnalytics(aRes.data)
      setMenuItems(mRes.data || [])
    } catch (e) {
      showToast(e.message || 'Failed to load data.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { fetchData() }, [fetchData])

  const handleToggle = useCallback(async (itemId) => {
    try {
      const res = await toggleAvailability(itemId)
      setMenuItems((prev) => prev.map((m) => m.id === itemId ? res.data : m))
      const item = menuItems.find((m) => m.id === itemId)
      showToast(
        item?.isAvailable ? `${item.name} marked unavailable` : `${item.name} is now available`,
        'info'
      )
    } catch (e) {
      showToast(e.message || 'Failed to update.', 'error')
    }
  }, [menuItems, showToast])

  /* Derived */
  const categories   = ['All Categories', ...new Set(menuItems.map((m) => m.category))]
  const filteredMenu = menuItems.filter((m) => {
    const matchCat = catFilter === 'All Categories' || m.category === catFilter
    const matchQ   = !search.trim() ||
      m.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchQ
  })

  const activeTables  = orders.filter((o) => !['PAID','CANCELLED'].includes(o.status))
  const staffOnDuty   = 12   // static demo value

  return (
    <div className="ba-shell">

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="ba-sidebar">
        <div className="ba-sidebar-brand">
          <div className="ba-brand-icon">🍴</div>
          <div>
            <p className="ba-brand-name">Bistro Admin</p>
            <p className="ba-brand-sub">Premium Management</p>
          </div>
        </div>

        <nav className="ba-nav">
          {SIDEBAR_NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => setActivePage(item.key)}
              className={`ba-nav-item ${activePage === item.key ? 'active' : ''}`}
            >
              <span className="ba-nav-icon">{item.icon}</span>
              <span className="ba-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="ba-sidebar-footer">
          <button className="ba-footer-btn">
            <span>⚙</span> Settings
          </button>
          <button className="ba-footer-btn ba-logout" onClick={onLogout}>
            <span>↩</span> Logout
          </button>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────── */}
      <div className="ba-main">

        {/* Top bar */}
        <header className="ba-topbar">
          <div className="ba-search-wrap">
            <span className="ba-search-icon">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders, dishes, or staff..."
              className="ba-search"
            />
          </div>

          <div className="ba-topbar-right">
            <button className="ba-icon-btn">🔔</button>
            <button className="ba-icon-btn">❓</button>
            <button className="ba-create-btn" onClick={() => showToast('Create order coming soon!', 'info')}>
              + Create Order
            </button>
            <div className="ba-avatar-wrap">
              <div className="ba-avatar">👨‍🍳</div>
              <div className="ba-avatar-info">
                <p className="ba-avatar-name">Chef Julian</p>
                <p className="ba-avatar-role">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="ba-content">
          {loading ? (
            <div className="ba-loading">
              <div className="ba-spinner" />
              <p>Loading dashboard…</p>
            </div>
          ) : (
            <>
              {/* Metric cards */}
              <AdminMetricCards
                analytics={analytics}
                orders={orders}
                activeTables={activeTables.length}
                staffOnDuty={staffOnDuty}
              />

              {/* Middle row: chart + popular dishes */}
              <div className="ba-mid-row">
                <SalesAnalyticsChart
                  orders={orders}
                  range={chartRange}
                  onRangeChange={setChartRange}
                />
                <PopularDishes items={analytics?.topSellingItems} menuItems={menuItems} />
              </div>

              {/* Menu management */}
              <AdminMenuTable
                menuItems={filteredMenu}
                allMenuItems={menuItems}
                categories={categories}
                catFilter={catFilter}
                onCatFilter={setCatFilter}
                onToggle={handleToggle}
                onRefresh={() => fetchData(true)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}