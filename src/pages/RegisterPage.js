import React, { useState, useContext } from 'react'
import { ToastContext } from '../App'
import { register as apiRegister } from '../api/auth'
import './RegisterPage.css'

const ROLES = [
  {
    id: 'CUSTOMER',
    label: 'Customer',
    subtitle: 'Dine & Order',
    description: 'Create an account to browse menus, place orders, track deliveries & earn rewards.',
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
    description: 'Set up your manager account. Requires an admin invite code provided by the owner.',
    color: '#7c3aed',
    colorLight: 'rgba(124,58,237,0.12)',
    colorBorder: 'rgba(124,58,237,0.35)',
    gradient: 'linear-gradient(135deg,#6d28d9 0%,#7c3aed 60%,#a78bfa 100%)',
    requiresCode: true,
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
    description: 'Register as kitchen staff to manage incoming orders, prep status and workflow.',
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

export default function RegisterPage({ onSuccess, onBack }) {
  const showToast = useContext(ToastContext)

  const [selectedRole, setSelectedRole] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    inviteCode: '',
  })
  const [showPwd, setShowPwd]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [pwdStrength, setPwdStrength] = useState(0)

  const role = ROLES.find(r => r.id === selectedRole)

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'password') setPwdStrength(calcStrength(value))
  }

  const calcStrength = (pwd) => {
    let s = 0
    if (pwd.length >= 8) s++
    if (/[A-Z]/.test(pwd)) s++
    if (/[0-9]/.test(pwd)) s++
    if (/[^A-Za-z0-9]/.test(pwd)) s++
    return s
  }

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColor = ['', '#ef4444', '#f59e0b', '#10b981', '#059669']

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        ...(role.requiresCode ? { inviteCode: formData.inviteCode } : {}),
      }
      const res = await apiRegister(payload)
      const data = res?.data || res
      onSuccess(data)
      showToast(`Welcome to BistroStream, ${data.fullName || formData.fullName}!`, 'success')
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Role Selector ─────────────────────────────────────────────────── */
  if (!selectedRole) {
    return (
      <div className="rp-root">
        <div className="rp-decor">
          <div className="rp-orb rp-orb1" />
          <div className="rp-orb rp-orb2" />
          <div className="rp-orb rp-orb3" />
        </div>

        <div className="rp-selector-wrap fade-in">
          {/* Brand */}
          <div className="rp-brand">
            <div className="rp-brand-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
                <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
              </svg>
            </div>
            <span className="rp-brand-name">BistroStream</span>
          </div>

          <h1 className="rp-selector-title">Create Your Account</h1>
          <p className="rp-selector-sub">Who are you registering as?</p>

          <div className="rp-role-cards">
            {ROLES.map(r => (
              <button
                key={r.id}
                className="rp-role-card"
                style={{ '--rc': r.color, '--rc-light': r.colorLight, '--rc-border': r.colorBorder, '--rc-grad': r.gradient }}
                onClick={() => { setSelectedRole(r.id); setError('') }}
              >
                <div className="rp-rc-icon-wrap">{r.icon}</div>
                <div className="rp-rc-body">
                  <strong className="rp-rc-label">{r.label}</strong>
                  <span className="rp-rc-subtitle">{r.subtitle}</span>
                  <p className="rp-rc-desc">{r.description}</p>
                </div>
                {r.requiresCode && (
                  <span className="rp-rc-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                    Invite only
                  </span>
                )}
                <div className="rp-rc-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </button>
            ))}
          </div>

          <p className="rp-selector-footer">
            Already have an account?&nbsp;
            <button className="rp-link" onClick={onBack}>Sign in</button>
          </p>
        </div>
      </div>
    )
  }

  /* ── Register Form ──────────────────────────────────────────────────── */
  return (
    <div className="rp-root rp-split" style={{ '--rc': role.color, '--rc-light': role.colorLight, '--rc-border': role.colorBorder, '--rc-grad': role.gradient }}>
      {/* Left gradient panel */}
      <div className="rp-panel-left">
        <div className="rp-panel-left-content">
          <div className="rp-brand rp-brand-light">
            <div className="rp-brand-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
                <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
              </svg>
            </div>
            <span className="rp-brand-name">BistroStream</span>
          </div>

          <div className="rp-panel-hero">
            <div className="rp-panel-role-icon">{role.icon}</div>
            <h2 className="rp-panel-heading">Join as {role.label}</h2>
            <p className="rp-panel-desc">{role.description}</p>
          </div>

          <div className="rp-panel-perks">
            {selectedRole === 'CUSTOMER' && (
              <>
                <div className="rp-perk">✅ Browse full restaurant menu</div>
                <div className="rp-perk">✅ Real-time order tracking</div>
                <div className="rp-perk">✅ Earn loyalty reward points</div>
                <div className="rp-perk">✅ Table reservation system</div>
              </>
            )}
            {selectedRole === 'ADMIN' && (
              <>
                <div className="rp-perk">✅ Full dashboard & analytics</div>
                <div className="rp-perk">✅ Menu & inventory management</div>
                <div className="rp-perk">✅ Staff & role management</div>
                <div className="rp-perk">✅ Revenue & sales reports</div>
              </>
            )}
            {selectedRole === 'KITCHEN' && (
              <>
                <div className="rp-perk">✅ Live order Kanban board</div>
                <div className="rp-perk">✅ Prep timer & alerts</div>
                <div className="rp-perk">✅ Inventory tracking</div>
                <div className="rp-perk">✅ Order history & reports</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="rp-panel-right">
        <div className="rp-form-wrap fade-in">
          <button className="rp-back-btn" onClick={() => { setSelectedRole(null); setError('') }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            All roles
          </button>

          <div className="rp-role-badge">
            <span className="rp-role-badge-icon">{role.icon}</span>
            {role.label} — {role.subtitle}
          </div>

          <h1 className="rp-form-title">Create Account</h1>
          <p className="rp-form-sub">Set up your {role.label.toLowerCase()} profile to get started</p>

          <form className="rp-form" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="rp-field">
              <label htmlFor="rp-name">Full Name</label>
              <div className="rp-input-wrap">
                <span className="rp-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input id="rp-name" type="text" name="fullName" value={formData.fullName}
                  onChange={handleChange} placeholder="John Doe" required autoComplete="name" />
              </div>
            </div>

            {/* Email */}
            <div className="rp-field">
              <label htmlFor="rp-email">Email Address</label>
              <div className="rp-input-wrap">
                <span className="rp-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input id="rp-email" type="email" name="email" value={formData.email}
                  onChange={handleChange} placeholder="name@restaurant.com" required autoComplete="email" />
              </div>
            </div>

            {/* Password */}
            <div className="rp-field">
              <label htmlFor="rp-pwd">Password</label>
              <div className="rp-input-wrap">
                <span className="rp-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </span>
                <input id="rp-pwd" type={showPwd ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleChange}
                  placeholder="Min. 8 characters" required minLength="8" autoComplete="new-password" />
                <button type="button" className="rp-pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
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
              {/* Strength bar */}
              {formData.password && (
                <div className="rp-strength">
                  <div className="rp-strength-bars">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="rp-strength-bar" style={{ background: i <= pwdStrength ? strengthColor[pwdStrength] : 'var(--gray-200)' }} />
                    ))}
                  </div>
                  <span className="rp-strength-label" style={{ color: strengthColor[pwdStrength] }}>
                    {strengthLabel[pwdStrength]}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="rp-field">
              <label htmlFor="rp-confirm">Confirm Password</label>
              <div className="rp-input-wrap">
                <span className="rp-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </span>
                <input id="rp-confirm" type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                  value={formData.confirmPassword} onChange={handleChange}
                  placeholder="Re-enter password" required autoComplete="new-password" />
                <button type="button" className="rp-pwd-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? (
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

            {/* Admin invite code */}
            {role.requiresCode && (
              <div className="rp-field">
                <label htmlFor="rp-code">Admin Invite Code</label>
                <div className="rp-input-wrap">
                  <span className="rp-input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </span>
                  <input id="rp-code" type="text" name="inviteCode" value={formData.inviteCode}
                    onChange={handleChange} placeholder="ADMIN-XXXX-XXXX" required />
                </div>
                <p className="rp-field-hint">Contact your restaurant owner to obtain an invite code.</p>
              </div>
            )}

            {error && <div className="rp-error">{error}</div>}

            <button type="submit" className="rp-submit-btn" disabled={loading}>
              {loading ? <span className="spinner" /> : `Create ${role.label} Account`}
            </button>
          </form>

          <p className="rp-form-footer">
            Already have an account?&nbsp;
            <button className="rp-link" onClick={onBack}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  )
}