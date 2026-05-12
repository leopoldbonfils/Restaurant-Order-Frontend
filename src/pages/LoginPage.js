import React, { useState, useContext } from 'react'
import { ToastContext } from '../App'
import { login as apiLogin } from '../api/auth'
import './LoginPage.css'

const ROLES = [
  {
    id: 'CUSTOMER',
    label: 'Customer',
    subtitle: 'Dine & Order',
    description: 'Browse menus, place orders and track your feast in real time.',
    color: '#e8600a',
    colorLight: 'rgba(232,96,10,0.12)',
    colorBorder: 'rgba(232,96,10,0.35)',
    gradient: 'linear-gradient(135deg,#e8600a 0%,#f97316 60%,#fbbf24 100%)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l19-9-9 19-2-8-8-2z"/>
      </svg>
    ),
  },
  {
    id: 'ADMIN',
    label: 'Admin',
    subtitle: 'Restaurant Manager',
    description: 'Full control over menu, orders, staff and analytics.',
    color: '#7c3aed',
    colorLight: 'rgba(124,58,237,0.12)',
    colorBorder: 'rgba(124,58,237,0.35)',
    gradient: 'linear-gradient(135deg,#6d28d9 0%,#7c3aed 60%,#a78bfa 100%)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    id: 'KITCHEN',
    label: 'Kitchen',
    subtitle: 'Kitchen Staff',
    description: 'Manage orders, prep status and kitchen workflow.',
    color: '#0891b2',
    colorLight: 'rgba(8,145,178,0.12)',
    colorBorder: 'rgba(8,145,178,0.35)',
    gradient: 'linear-gradient(135deg,#0e7490 0%,#0891b2 60%,#22d3ee 100%)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 13.87A4 4 0 017.41 6a5.11 5.11 0 011.05-1.54 5 5 0 017.08 0A5.11 5.11 0 0117 6a4 4 0 011.41 7.87V19a2 2 0 01-2 2H8.59a2 2 0 01-2-2z"/>
        <line x1="6" y1="17" x2="18" y2="17"/>
      </svg>
    ),
  },
]

export default function LoginPage({ onSuccess, onRegister }) {
  const showToast = useContext(ToastContext)

  const [selectedRole, setSelectedRole] = useState(null)
  const [email, setEmail]   = useState(() => localStorage.getItem('df_remember_email') || '')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('df_remember_email'))
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const role = ROLES.find(r => r.id === selectedRole)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!email || !password) { setError('Email and password are required'); return }
    setError('')
    setLoading(true)
    try {
      const res = await apiLogin(email, password)
      const { token, role: userRole, email: userEmail } = res?.data || res
      if (rememberMe) localStorage.setItem('df_remember_email', email)
      else            localStorage.removeItem('df_remember_email')
      onSuccess({ token, role: userRole, email: userEmail })
      showToast(`Welcome back, ${userEmail}!`, 'success')
    } catch (err) {
      setError(err?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Role Selector ─────────────────────────────────────────────────────── */
  if (!selectedRole) {
    return (
      <div className="lp-root">
        <div className="lp-decor">
          <div className="lp-decor-orb lp-orb1" />
          <div className="lp-decor-orb lp-orb2" />
          <div className="lp-decor-orb lp-orb3" />
        </div>

        <div className="lp-selector-wrap fade-in">
          {/* Brand */}
          <div className="lp-brand">
            <div className="lp-brand-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
              </svg>
            </div>
            <span className="lp-brand-name">BistroStream</span>
          </div>

          <h1 className="lp-selector-title">Sign In to Your Portal</h1>
          <p className="lp-selector-sub">Select your role to continue</p>

          <div className="lp-role-cards">
            {ROLES.map(r => (
              <button
                key={r.id}
                className="lp-role-card"
                style={{ '--rc': r.color, '--rc-light': r.colorLight, '--rc-border': r.colorBorder, '--rc-grad': r.gradient }}
                onClick={() => { setSelectedRole(r.id); setError('') }}
              >
                <div className="lp-rc-icon-wrap">
                  {r.icon}
                </div>
                <div className="lp-rc-body">
                  <strong className="lp-rc-label">{r.label}</strong>
                  <span className="lp-rc-subtitle">{r.subtitle}</span>
                  <p className="lp-rc-desc">{r.description}</p>
                </div>
                <div className="lp-rc-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </button>
            ))}
          </div>

          <p className="lp-selector-footer">
            New here?&nbsp;
            <button className="lp-link" onClick={onRegister}>Create an account</button>
          </p>
        </div>
      </div>
    )
  }

  /* ── Login Form ────────────────────────────────────────────────────────── */
  return (
    <div className="lp-root lp-split" style={{ '--rc': role.color, '--rc-light': role.colorLight, '--rc-border': role.colorBorder, '--rc-grad': role.gradient }}>
      {/* Left decorative panel */}
      <div className="lp-panel-left">
        <div className="lp-panel-left-content">
          <div className="lp-brand lp-brand-light">
            <div className="lp-brand-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
            </div>
            <span className="lp-brand-name">BistroStream</span>
          </div>

          <div className="lp-panel-hero">
            <div className="lp-panel-role-icon">{role.icon}</div>
            <h2 className="lp-panel-heading">{role.label} Portal</h2>
            <p className="lp-panel-desc">{role.description}</p>
          </div>

          <div className="lp-panel-badges">
            <span className="lp-panel-badge">🔒 Secure Login</span>
            <span className="lp-panel-badge">⚡ Real-time</span>
            <span className="lp-panel-badge">📱 Responsive</span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="lp-panel-right">
        <div className="lp-form-wrap fade-in">
          <button className="lp-back-btn" onClick={() => { setSelectedRole(null); setError('') }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            All roles
          </button>

          <div className="lp-role-badge">
            <span className="lp-role-badge-icon">{role.icon}</span>
            {role.label} — {role.subtitle}
          </div>

          <h1 className="lp-form-title">Welcome back</h1>
          <p className="lp-form-sub">Enter your credentials to access the {role.label.toLowerCase()} portal</p>

          <form className="lp-form" onSubmit={handleSubmit}>
            <div className="lp-field">
              <label htmlFor="lp-email">Email Address</label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  id="lp-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@restaurant.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="lp-field">
              <label htmlFor="lp-pwd">Password</label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </span>
                <input
                  id="lp-pwd"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="lp-pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="lp-options">
              <label className="lp-check">
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                <span className="lp-checkmark" />
                Remember me
              </label>
              <button type="button" className="lp-forgot">Forgot password?</button>
            </div>

            {error && <div className="lp-error">{error}</div>}

            <button type="submit" className="lp-submit-btn" disabled={loading}>
              {loading ? <span className="spinner" /> : `Sign In as ${role.label}`}
            </button>
          </form>

          <p className="lp-form-footer">
            Don't have an account?&nbsp;
            <button className="lp-link" onClick={onRegister}>Create account</button>
          </p>
        </div>
      </div>
    </div>
  )
}