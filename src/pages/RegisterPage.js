import React, { useState, useContext } from 'react'
import { ToastContext } from '../App'
import { register as apiRegister } from '../api/auth'
import './RegisterPage.css'

function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 8)              score++
  if (/[A-Z]/.test(pwd))            score++
  if (/[0-9]/.test(pwd))            score++
  if (/[^A-Za-z0-9]/.test(pwd))     score++
  const levels = [
    { label: '',        color: '' },
    { label: 'Weak',    color: '#ef4444' },
    { label: 'Fair',    color: '#f97316' },
    { label: 'Medium',  color: '#eab308' },
    { label: 'Strong',  color: '#22c55e' },
  ]
  return { score, ...levels[score] }
}

export default function RegisterPage({ onSuccess, onBack }) {
  const showToast = useContext(ToastContext)

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    diningPreferences: '',
  })
  const [showPwd,     setShowPwd]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed,      setAgreed]      = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [errors,      setErrors]      = useState({})

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.fullName.trim())                         e.fullName = 'Full name is required'
    if (!form.email.trim())                            e.email    = 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (form.password.length < 6)                      e.password = 'Minimum 6 characters'
    if (form.password !== form.confirmPassword)        e.confirmPassword = 'Passwords do not match'
    if (!agreed)                                       e.agreed   = 'You must agree to the terms'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    try {
      const res = await apiRegister(form.email, form.password, form.fullName, 'CUSTOMER')
      const { token, role, email } = res.data
      onSuccess({ token, role, email })
      showToast('Account created! Welcome to DineFlow 🎉', 'success')
    } catch (err) {
      showToast(err.message || 'Registration failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const strength = getPasswordStrength(form.password)

  return (
    <div className="reg-page">
      {/* ── Left panel ─────────────────────────────────────── */}
      <div className="reg-left">
        <div className="reg-left-overlay" />
        <div className="reg-left-content">
          <div className="reg-left-logo">
            <span className="reg-left-logo-icon">🍴</span>
            <span className="reg-left-logo-name">DineFlow</span>
          </div>
          <div className="reg-left-body">
            <h1 className="reg-left-headline">Join the<br />Table.</h1>
            <p className="reg-left-sub">
              Experience seamless dining,<br />
              personalized rewards, and priority<br />
              booking at DineFlow.
            </p>
          </div>
          <div className="reg-left-dots">
            <span className="reg-dot active" />
            <span className="reg-dot" />
            <span className="reg-dot" />
          </div>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────── */}
      <div className="reg-right">
        <div className="reg-form-wrap">
          <h2 className="reg-title">Create Account</h2>
          <p className="reg-sub">Start your culinary journey with us today.</p>

          {/* Full Name */}
          <div className="reg-field">
            <label className="reg-label">Full Name</label>
            <div className={`reg-input-wrap ${errors.fullName ? 'error' : ''}`}>
              <span className="reg-input-icon">👤</span>
              <input
                type="text"
                placeholder="John Doe"
                value={form.fullName}
                onChange={set('fullName')}
                className="reg-input"
              />
            </div>
            {errors.fullName && <p className="reg-error">{errors.fullName}</p>}
          </div>

          {/* Email + Phone */}
          <div className="reg-row">
            <div className="reg-field">
              <label className="reg-label">Email Address</label>
              <div className={`reg-input-wrap ${errors.email ? 'error' : ''}`}>
                <span className="reg-input-icon">✉️</span>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={set('email')}
                  className="reg-input"
                />
              </div>
              {errors.email && <p className="reg-error">{errors.email}</p>}
            </div>

            <div className="reg-field">
              <label className="reg-label">Phone Number</label>
              <div className="reg-input-wrap">
                <span className="reg-input-icon">📞</span>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={set('phone')}
                  className="reg-input"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="reg-field">
            <label className="reg-label">Password</label>
            <div className={`reg-input-wrap ${errors.password ? 'error' : ''}`}>
              <span className="reg-input-icon">🔒</span>
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                className="reg-input"
              />
              <button className="reg-eye-btn" onClick={() => setShowPwd((v) => !v)}>
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
            {form.password && (
              <div className="reg-strength">
                <div className="reg-strength-bar">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      className="reg-strength-seg"
                      style={{ background: s <= strength.score ? strength.color : '#e5e7eb' }}
                    />
                  ))}
                </div>
                <span className="reg-strength-label" style={{ color: strength.color }}>
                  Strength: {strength.label}
                </span>
              </div>
            )}
            {errors.password && <p className="reg-error">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="reg-field">
            <label className="reg-label">Confirm Password</label>
            <div className={`reg-input-wrap ${errors.confirmPassword ? 'error' : ''}`}>
              <span className="reg-input-icon">🔒</span>
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                className="reg-input"
              />
              <button className="reg-eye-btn" onClick={() => setShowConfirm((v) => !v)}>
                {showConfirm ? '🙈' : '👁'}
              </button>
            </div>
            {errors.confirmPassword && <p className="reg-error">{errors.confirmPassword}</p>}
          </div>

          {/* Dining Preferences */}
          <div className="reg-field">
            <label className="reg-label">Dining Preferences <span className="reg-optional">(Optional)</span></label>
            <div className="reg-input-wrap reg-textarea-wrap">
              <span className="reg-input-icon" style={{ alignSelf: 'flex-start', marginTop: 10 }}>🍽</span>
              <textarea
                placeholder="Window seat, quiet corner, dietary restrictions…"
                value={form.diningPreferences}
                onChange={set('diningPreferences')}
                className="reg-input reg-textarea"
                rows={2}
              />
            </div>
          </div>

          {/* Terms */}
          <div className="reg-terms">
            <label className={`reg-checkbox-wrap ${errors.agreed ? 'error' : ''}`}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="reg-checkbox"
              />
              <span className="reg-checkbox-custom" />
              <span className="reg-terms-text">
                I agree to the{' '}
                <span className="reg-link">Terms &amp; Conditions</span>
                {' '}and{' '}
                <span className="reg-link">Privacy Policy</span>
                {' '}of DineFlow Hospitality.
              </span>
            </label>
            {errors.agreed && <p className="reg-error">{errors.agreed}</p>}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="reg-submit-btn"
          >
            {loading ? 'CREATING ACCOUNT…' : 'REGISTER'}
          </button>

          {/* Login link */}
          <p className="reg-login-link">
            Already have an account?{' '}
            <button className="reg-link reg-link-btn" onClick={onBack}>Login</button>
          </p>
        </div>
      </div>
    </div>
  )
}