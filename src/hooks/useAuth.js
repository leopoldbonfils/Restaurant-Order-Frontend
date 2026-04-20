import { useState } from 'react'

export function useAuth() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('df_token')
    const role  = localStorage.getItem('df_role')
    const email = localStorage.getItem('df_email')
    return token ? { token, role, email } : null
  })

  const handleLogin = ({ token, role, email }) => {
    localStorage.setItem('df_token', token)
    localStorage.setItem('df_role', role)
    localStorage.setItem('df_email', email)
    setAuth({ token, role, email })
  }

  const handleLogout = () => {
    localStorage.removeItem('df_token')
    localStorage.removeItem('df_role')
    localStorage.removeItem('df_email')
    setAuth(null)
  }

  return { auth, handleLogin, handleLogout }
}
