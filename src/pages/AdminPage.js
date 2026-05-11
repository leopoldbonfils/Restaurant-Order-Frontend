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
    <div className="admin-portal fade-in">
      <header className="portal-header">
        <div className="header-info">
          <h1>Management Console</h1>
          <p>Business Analytics & Restaurant Control</p>
        </div>
        
        <div className="header-actions">
          <div className="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Global search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="create-btn" onClick={() => showToast('Order creation coming soon!', 'info')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>New Item</span>
          </button>
        </div>
      </header>

      <div className="admin-tabs">
        {['dashboard', 'orders', 'menu', 'analytics', 'staff'].map(tab => (
          <button
            key={tab}
            className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Gathering analytics...</p>
          </div>
        ) : (
          <div className="dashboard-grid">
            {activeTab === 'dashboard' && (
              <>
                <AdminMetricCards
                  analytics={analytics}
                  orders={orders}
                  activeTables={orders.filter(o => !['PAID','CANCELLED'].includes(o.status)).length}
                  staffOnDuty={12}
                />
                <div className="dashboard-charts">
                  <SalesAnalyticsChart
                    orders={orders}
                    range={chartRange}
                    onRangeChange={setChartRange}
                  />
                  <PopularDishes items={analytics?.topSellingItems} menuItems={menuItems} />
                </div>
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
    </div>
  )
}