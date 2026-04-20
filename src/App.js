import React, { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import Toast from './components/layout/Toast'
import CustomerPage from './pages/CustomerPage'
import KitchenPage from './pages/KitchenPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import './App.css'

export const ToastContext = React.createContext(null)
export const AuthContext  = React.createContext(null)

export default function App() {
  const [page,  setPage]  = useState('customer')
  const [toast, setToast] = useState(null)

  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('df_token')
    const role  = localStorage.getItem('df_role')
    const email = localStorage.getItem('df_email')
    return token ? { token, role, email } : null
  })

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleLogin = ({ token, role, email }) => {
    localStorage.setItem('df_token', token)
    localStorage.setItem('df_role', role)
    localStorage.setItem('df_email', email)
    setAuth({ token, role, email })
  }

  const handleLogout = () => {
    localStorage.removeItem('df_token')
    localStorage.removeItem('df_role')
    localStorage.removeItem('df_email')
    setAuth(null)
    setPage('customer')
  }

  const navigateTo = (target) => {
    if (target === 'kitchen') {
      if (!auth || (auth.role !== 'KITCHEN' && auth.role !== 'ADMIN')) {
        setPage('login'); return
      }
    }
    if (target === 'admin') {
      if (!auth || auth.role !== 'ADMIN') {
        setPage('login'); return
      }
    }
    setPage(target)
  }

  const renderPage = () => {
    switch (page) {
      case 'customer': return <CustomerPage />
      case 'kitchen':  return <KitchenPage />
      case 'admin':    return <AdminPage />
      case 'login':    return <LoginPage onSuccess={handleLogin} onBack={() => setPage('customer')} />
      default:         return <CustomerPage />
    }
  }

  return (
    <AuthContext.Provider value={{ auth, handleLogin, handleLogout }}>
      <ToastContext.Provider value={showToast}>
        <div className="app-shell">
          {page !== 'login' && (
            <Sidebar currentPage={page} onNavigate={navigateTo} auth={auth} onLogout={handleLogout} />
          )}
          <main className={page !== 'login' ? 'main-content' : 'main-full'}>
            {renderPage()}
          </main>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </ToastContext.Provider>
    </AuthContext.Provider>
  )
}