import React, { useState, useContext } from 'react'
import { ToastContext } from '../App'
import { register as apiRegister } from '../api/auth'
import './RegisterPage.css'

export default function RegisterPage({ onSuccess, onBack }) {
  const showToast = useContext(ToastContext)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'CUSTOMER'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await apiRegister(formData)
      const data = res?.data || res
      onSuccess(data)
      showToast(`Welcome to BistroFlow, ${data.fullName}!`, 'success')
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <div className="register-card fade-in">
        <div className="register-header">
          <button className="back-btn" onClick={onBack}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <h1>Create Account</h1>
          <p>Join the future of restaurant management</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              required
              minLength="8"
            />
          </div>

          <div className="input-group">
            <label>Account Type</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="CUSTOMER">Customer / Diner</option>
              <option value="KITCHEN">Kitchen Staff</option>
              <option value="ADMIN">Restaurant Manager</option>
            </select>
          </div>

          {error && <div className="error-alert">{error}</div>}

          <button type="submit" disabled={loading} className="register-submit-btn">
            {loading ? <span className="spinner"></span> : 'Create Account'}
          </button>
        </form>

        <div className="register-footer">
          <p>Already have an account?</p>
          <button className="login-link" onClick={onBack}>Sign In</button>
        </div>
      </div>

      <div className="register-bg">
        <div className="bg-blob blob-1"></div>
        <div className="bg-blob blob-2"></div>
      </div>
    </div>
  )
}