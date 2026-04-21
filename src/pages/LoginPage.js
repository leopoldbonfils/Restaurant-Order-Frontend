import React, { useState, useContext } from 'react'
import { ToastContext } from '../App'
import { login as apiLogin } from '../api/auth'
import './LoginPage.css'

export default function LoginPage({ onSuccess, onBack, onRegister }) {
  const showToast = useContext(ToastContext)

  const [accessLevel, setAccessLevel] = useState('CUSTOMER')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPwd,     setShowPwd]     = useState(false)
  const [rememberMe,  setRememberMe]  = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  /* Pre-fill demo credentials when access level changes */
  const handleAccessChange = (e) => {
    const role = e.target.value
    setAccessLevel(role)
    setError('')
    if (role === 'KITCHEN') { setEmail('kitchen@demo.rw'); setPassword('kitchen123') }
    else if (role === 'ADMIN') { setEmail('admin@demo.rw'); setPassword('admin123') }
    else { setEmail(''); setPassword('') }
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!email || !password) { setError('Email and password are required'); return }
    setError('')
    setLoading(true)
    try {
      const res = await apiLogin(email, password)
      const { token, role, email: userEmail } = res.data
      onSuccess({ token, role, email: userEmail })
      showToast(`Logged in as ${role.toLowerCase()} 👋`, 'success')
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="lp-page">

      {/* ── Left panel (form) ─────────────────────────────── */}
      <div className="lp-left">
        <div className="lp-left-inner">

          {/* Brand */}
          <div className="lp-brand">
            <div className="lp-brand-icon">🍴</div>
            <h1 className="lp-brand-name">DineFlow</h1>
            <p className="lp-brand-sub">Welcome to Digital Dine-In System</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="lp-form">

            {/* Access Level */}
            <div className="lp-field">
              <label className="lp-label">Access Level</label>
              <div className="lp-select-wrap">
                <select
                  value={accessLevel}
                  onChange={handleAccessChange}
                  className="lp-select"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="KITCHEN">Kitchen Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <span className="lp-select-arrow">▾</span>
              </div>
            </div>

            {/* Email */}
            <div className="lp-field">
              <label className="lp-label">Email / Username</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@dineflow.rw"
                className="lp-input"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="lp-field">
              <label className="lp-label">Password</label>
              <div className="lp-pwd-wrap">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="lp-input"
                  autoComplete="current-password"
                />
                <button type="button" className="lp-eye" onClick={() => setShowPwd((v) => !v)}>
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="lp-row-aux">
              <label className="lp-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="lp-checkbox"
                />
                <span className="lp-checkbox-box" />
                <span className="lp-remember-label">Remember me</span>
              </label>
              <button type="button" className="lp-forgot">Forgot Password?</button>
            </div>

            {/* Error */}
            {error && <div className="lp-error">{error}</div>}

            {/* Submit */}
            <button type="submit" disabled={loading} className="lp-submit">
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>

          {/* Create Account */}
          <div className="lp-create">
            <p className="lp-create-label">New to DineFlow?</p>
            <button
              className="lp-create-btn"
              onClick={onRegister || onBack}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="lp-footer">
          <span className="lp-footer-brand">DineFlow</span>
          <div className="lp-footer-links">
            <button className="lp-footer-link">Privacy Policy</button>
            <button className="lp-footer-link">Terms of Service</button>
            <button className="lp-footer-link">Contact Support</button>
          </div>
          <span className="lp-footer-copy">© 2024 DineFlow Hospitality. All rights reserved.</span>
        </footer>
      </div>

      {/* ── Right panel (image) ───────────────────────────── */}
      <div className="lp-right">
        <div className="lp-right-overlay" />
        <div className="lp-right-content">
          <div className="lp-hero-card">
            <h2 className="lp-hero-headline">
              Effortless Dining,<br />Modern Service.
            </h2>
            <p className="lp-hero-sub">
              Experience the next generation of hospitality where speed meets
              sophistication. From kitchen displays to customer self-service,
              DineFlow powers your culinary journey.
            </p>
            <div className="lp-stats">
              <div className="lp-stat">
                <span className="lp-stat-value">99%</span>
                <span className="lp-stat-label">ORDER ACCURACY</span>
              </div>
              <div className="lp-stat">
                <span className="lp-stat-value">2.4k</span>
                <span className="lp-stat-label">RESTAURANTS CHOICE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}