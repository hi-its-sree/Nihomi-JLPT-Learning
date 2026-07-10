import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../lib/api'

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  isAuthenticated: false,
})
const STORAGE_KEY = 'jlpt-auth'

function readStoredAuth() {
  if (typeof window === 'undefined') return { user: null, token: null }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { user: null, token: null }
    return JSON.parse(raw)
  } catch {
    return { user: null, token: null }
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredAuth().user)
  const [token, setToken] = useState(() => readStoredAuth().token)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && token) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [user, token])

  useEffect(() => {
    const bootstrap = async () => {
      const stored = readStoredAuth()
      if (!stored.token) {
        setLoading(false)
        return
      }

      try {
        const { data } = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${stored.token}` },
        })
        setUser(data.user)
        setToken(stored.token)
      } catch {
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    setUser(data.user)
    setToken(data.token)
    return data
  }

  const signup = async (email, password, username, recoveryAnswers = []) => {
    const { data } = await api.post('/auth/register', { email, password, username, recoveryAnswers })
    setUser(data.user)
    setToken(data.token)
    return data
  }

  const forgotPassword = async (email, answers, newPassword) => {
    const { data } = await api.post('/auth/forgot-password', { email, answers, newPassword })
    return data
  }

  const logout = () => {
    setUser(null)
    setToken(null)
  }

  const value = useMemo(
    () => ({ user, token, loading, login, signup, forgotPassword, logout, isAuthenticated: Boolean(user && token) }),
    [user, token, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
