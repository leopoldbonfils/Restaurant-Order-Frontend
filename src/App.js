import React, { useState, useCallback } from 'react'
import Sidebar       from './components/layout/Sidebar'
import Toast         from './components/layout/Toast'
import CustomerPage  from './pages/CustomerPage'
import KitchenPage   from './pages/KitchenPage'
import AdminPage     from './pages/AdminPage'
import LoginPage     from './pages/LoginPage'
import RegisterPage  from './pages/RegisterPage'
import './App.css'

export const ToastContext = React.createContext(null)
export const AuthContext  = React.createContext(null)
export const ThemeContext = React.createContext(null)

/* Pages that render full-screen (no sidebar) */
const FULL_SCREEN = new Set(['login', 'register'])

export default function App() {
  const [page,  setPage]  = useState('customer')
  const [toast, setToast] = useState(null)

  // ── Theme ────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('df_theme') || 'light'
    document.documentElement.setAttribute('data-theme', saved)
    return saved
  })

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('df_theme', next)
      document.documentElement.setAttribute('data-theme', next)
      return next
    })
  }, [])

  // ── Auth ─────────────────────────────────────────────────────────────────
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('df_token')
    const role  = localStorage.getItem('df_role')
    const email = localStorage.getItem('df_email')
    return token ? { token, role, email } : null
  })

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = useCallback(({ token, role, email }) => {
    localStorage.setItem('df_token', token)
    localStorage.setItem('df_role',  role)
    localStorage.setItem('df_email', email)
    setAuth({ token, role, email })

    if (role === 'ADMIN')        setPage('admin')
    else if (role === 'KITCHEN') setPage('kitchen')
    else                         setPage('customer')
  }, [])

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    localStorage.removeItem('df_token')
    localStorage.removeItem('df_role')
    localStorage.removeItem('df_email')
    setAuth(null)
    setPage('customer')
  }, [])

  // ── Navigation ────────────────────────────────────────────────────────────
  const navigateTo = useCallback((target) => {
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
  }, [auth])

  // ── Page renderer ─────────────────────────────────────────────────────────
  const renderPage = () => {
    switch (page) {
      case 'customer':
        return <CustomerPage />
      case 'kitchen':
        return <KitchenPage onLogout={handleLogout} />
      case 'admin':
        return <AdminPage onLogout={handleLogout} />
      case 'login':
        return (
          <LoginPage
            onSuccess={handleLogin}
            onBack={() => setPage('customer')}
            onRegister={() => setPage('register')}
          />
        )
      case 'register':
        return (
          <RegisterPage
            onSuccess={handleLogin}
            onBack={() => setPage('login')}
          />
        )
      default:
        return <CustomerPage />
    }
  }

  const isFullScreen = FULL_SCREEN.has(page)

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthContext.Provider value={{ auth, handleLogin, handleLogout }}>
        <ToastContext.Provider value={showToast}>
          <div className="app-shell">
            {!isFullScreen && (
              <Sidebar
                currentPage={page}
                onNavigate={navigateTo}
                auth={auth}
                onLogout={handleLogout}
                theme={theme}
                onToggleTheme={toggleTheme}
              />
            )}
            <main className={!isFullScreen ? 'main-content' : 'main-full'}>
              {renderPage()}
            </main>
          </div>
          {toast && <Toast message={toast.message} type={toast.type} />}
        </ToastContext.Provider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  )
}