import React, { useState, useEffect, useContext, useCallback } from 'react'
import { ToastContext } from '../App'
import {
  AdminMetricCards,
  SalesAnalyticsChart,
  PopularDishes,
  AdminMenuTable,
} from '../components/admin/AdminComponents'
import { getAllOrders, getAnalytics } from '../api/orders'
import { getAllMenu, toggleAvailability } from '../api/menu'
import './AdminPage.css'

export default function AdminPage({ onLogout }) {
  const showToast   = useContext(ToastContext)
  const [activeTab, setActiveTab] = useState('dashboard')
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
      setOrders(oRes?.data || oRes || [])
      setAnalytics(aRes?.data || aRes)
      setMenuItems(mRes?.data || mRes || [])
    } catch (e) {
      showToast(e?.message || 'Failed to sync data.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { fetchData() }, [fetchData])

  const handleToggle = useCallback(async (itemId) => {
    try {
      const res = await toggleAvailability(itemId)
      const updatedItem = res?.data || res
      setMenuItems((prev) => prev.map((m) => m.id === itemId ? updatedItem : m))
      showToast(`${updatedItem?.name} status updated.`, 'info')
    } catch (e) {
      showToast(e?.message || 'Update failed.', 'error')
    }
  }, [showToast])

  const categories   = ['All Categories', ...new Set(menuItems.map((m) => m.category))]
  const filteredMenu = menuItems.filter((m) => {
    const matchCat = catFilter === 'All Categories' || m.category === catFilter
    const matchQ   = !search.trim() || m.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchQ
  })

  return (
    <div className="bistro-admin-layout">
      {/* Left Sidebar */}
      <aside className="ba-sidebar">
        <div className="ba-brand">
          <div className="ba-brand-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>
          </div>
          <div className="ba-brand-text">
            <h2>Bistro Admin</h2>
            <p>PREMIUM MANAGEMENT</p>
          </div>
        </div>

        <nav className="ba-nav">
          <button className={`ba-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </button>
          <button className={`ba-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            Orders
          </button>
          <button className={`ba-nav-item ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Menu Management
          </button>
          <button className={`ba-nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            Analytics
          </button>
          <button className={`ba-nav-item ${activeTab === 'staff' ? 'active' : ''}`} onClick={() => setActiveTab('staff')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Staff
          </button>
        </nav>

        <div className="ba-nav-bottom">
          <button className="ba-nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Settings
          </button>
          <button className="ba-nav-item" onClick={onLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ba-main">
        {/* Top Header */}
        <header className="ba-topbar">
          <div className="ba-search">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search orders, dishes, or staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="ba-topbar-right">
            <button className="icon-btn-light">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </button>
            <button className="icon-btn-light">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </button>
            
            <button className="ba-create-btn" onClick={() => showToast('Order creation coming soon!', 'info')}>
              + Create Order
            </button>
            
            <div className="ba-profile">
              <div className="ba-profile-text">
                <span className="name">Chef Julian</span>
                <span className="role">MANAGER</span>
              </div>
              <div className="ba-avatar">
                <img src="https://i.pravatar.cc/100?img=11" alt="Profile" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Region */}
        <div className="ba-content-scroll">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Gathering analytics...</p>
            </div>
          ) : (
            <div className="ba-dashboard-grid">
              {activeTab === 'dashboard' && (
                <>
                  <AdminMetricCards
                    analytics={analytics}
                    orders={orders}
                    activeTables={orders.filter(o => !['PAID','CANCELLED'].includes(o.status)).length}
                    staffOnDuty={12}
                  />
                  <div className="dashboard-middle-row">
                    <SalesAnalyticsChart
                      orders={orders}
                      range={chartRange}
                      onRangeChange={setChartRange}
                    />
                    <PopularDishes items={analytics?.topSellingItems} menuItems={menuItems} />
                  </div>
                  
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
              
              {activeTab === 'menu' && (
                <AdminMenuTable
                  menuItems={filteredMenu}
                  allMenuItems={menuItems}
                  categories={categories}
                  catFilter={catFilter}
                  onCatFilter={setCatFilter}
                  onToggle={handleToggle}
                  onRefresh={() => fetchData(true)}
                />
              )}
              
              {(activeTab === 'orders' || activeTab === 'analytics' || activeTab === 'staff') && (
                <div className="placeholder-view">
                  <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h3>
                  <p>This section is currently being updated for the new design system.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}