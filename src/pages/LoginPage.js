import React, { useState, useContext } from 'react'
import { ToastContext } from '../App'
import { login as apiLogin } from '../api/auth'
import './LoginPage.css'

export default function LoginPage({ onSuccess, onBack, onRegister }) {
  const showToast = useContext(ToastContext)

  const [email, setEmail] = useState(() => localStorage.getItem('df_remember_email') || '')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('df_remember_email'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!email || !password) {
      setError('Email and password are required')
      return
    }
    
    setError('')
    setLoading(true)
    try {
      const res = await apiLogin(email, password)
      const { token, role, email: userEmail } = res?.data || res
      
      if (rememberMe) {
        localStorage.setItem('df_remember_email', email)
      } else {
        localStorage.removeItem('df_remember_email')
      }
      
      onSuccess({ token, role, email: userEmail })
      showToast(`Welcome back, ${userEmail}!`, 'success')
    } catch (err) {
      setError(err?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <div className="login-header">
          <div className="login-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"/><path d="M12 7v5l3 3"/></svg>
          </div>
          <h1>Welcome Back</h1>
          <p>Login to manage your restaurant portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="checkbox-container">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <span className="checkmark"></span>
              Remember me
            </label>
            <button type="button" className="forgot-link">Forgot password?</button>
          </div>

          {error && <div className="error-alert">{error}</div>}

          <button type="submit" disabled={loading} className="login-submit-btn">
            {loading ? <span className="spinner"></span> : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account?</p>
          <button className="register-link" onClick={onRegister}>Create account</button>
        </div>
      </div>

      <div className="login-bg">
        <div className="bg-blob blob-1"></div>
        <div className="bg-blob blob-2"></div>
        <div className="bg-blob blob-3"></div>
      </div>
    </div>
  )
}