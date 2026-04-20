import React from 'react'
import './Toast.css'

const ICONS = { success: '✅', error: '❌', info: 'ℹ️' }

export default function Toast({ message, type = 'info' }) {
  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{ICONS[type] || ICONS.info}</span>
      <p className="toast-message">{message}</p>
    </div>
  )
}