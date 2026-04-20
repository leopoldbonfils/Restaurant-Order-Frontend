import React, { useState, useContext } from 'react'
import { ToastContext } from '../App'
import { login as apiLogin } from '../api/auth'
import './LoginPage.css'

export default function LoginPage({ onSuccess, onBack }) {
  const showToast = useContext(ToastContext)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!email || !password) { setError('Email and password are required'); return }
    setError('')
    setLoading(true)
    try {
      const res = await apiLogin(email, password)
      const { token, role, email: userEmail } = res.data
      onSuccess({ token, role, email: userEmail })
      showToast(`Logged in as ${role.toLowerCase()}`, 'success')
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-wrap">
        <button onClick={onBack} className="login-back">← Back to customer view</button>

        <div className="login-card">
          <div className="login-card-header">
            <div className="login-icons">
              <span className="login-icon-box">👨‍🍳</span>
              <span className="login-icon-box">🛡</span>
            </div>
            <h1 className="login-title">Staff login</h1>
            <p className="login-sub">Kitchen staff and admin access</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label className="login-label">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@restaurant.rw"
                autoComplete="email"
                className="login-input"
              />
            </div>

            <div className="login-field">
              <label className="login-label">Password</label>
              <div className="login-pwd-wrap">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="login-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="login-pwd-toggle"
                >
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" disabled={loading} className="login-submit-btn">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="login-demo">
            <p className="login-demo-title">Demo credentials</p>
            <div className="login-demo-rows">
              <div className="login-demo-row">
                <span>👨‍🍳</span>
                <code>kitchen@demo.rw · kitchen123</code>
              </div>
              <div className="login-demo-row">
                <span>🛡</span>
                <code>admin@demo.rw · admin123</code>
              </div>
            </div>
            <p className="login-demo-note">
              Register via <code>POST /api/auth/register</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}