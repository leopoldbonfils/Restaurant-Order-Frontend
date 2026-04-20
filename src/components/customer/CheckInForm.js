import React, { useState } from 'react'
import './CheckInForm.css'

export default function CheckInForm({ onCheckIn }) {
  const [table,   setTable]   = useState('')
  const [language, setLang]   = useState('en')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async () => {
    if (!table.trim()) { setError('Please enter a table number'); return }
    setError('')
    setLoading(true)
    try {
      await onCheckIn(table.trim(), language)
    } catch (e) {
      setError(e.message || 'Check-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="checkin-card">
      <div className="checkin-header">
        <div className="checkin-icon">📍</div>
        <div>
          <p className="checkin-title">Find your table</p>
          <p className="checkin-sub">Enter your table number to start ordering</p>
        </div>
      </div>

      <div className="checkin-row">
        <input
          type="text"
          value={table}
          onChange={(e) => setTable(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="e.g. Table 5"
          className="checkin-input"
        />
        <select
          value={language}
          onChange={(e) => setLang(e.target.value)}
          className="checkin-select"
        >
          <option value="en">🇺🇸 EN</option>
          <option value="fr">🇫🇷 FR</option>
          <option value="sw">🇰🇪 SW</option>
        </select>
        <button
          onClick={handleSubmit}
          disabled={loading || !table.trim()}
          className="checkin-btn"
        >
          {loading ? '...' : 'Check in'}
        </button>
      </div>

      {error && <p className="checkin-error">{error}</p>}
    </div>
  )
}