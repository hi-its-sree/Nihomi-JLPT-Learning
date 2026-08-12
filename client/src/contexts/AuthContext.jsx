import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../lib/api'

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  setSecurityQuestions: async () => {},
  logout: () => {},
  isAuthenticated: false,
})
const STORAGE_KEY = 'jlpt-auth'

function persistAuth(user, token) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }))
}

function clearStoredAuth() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

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
      persistAuth(user, token)
    } else {
      clearStoredAuth()
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
    const nextAuth = { user: data.user, token: data.token }
    persistAuth(nextAuth.user, nextAuth.token)
    setUser(nextAuth.user)
    setToken(nextAuth.token)
    return data
  }

  const signup = async (email, password, username) => {
    const { data } = await api.post('/auth/register', { email, password, username })
    const nextAuth = { user: data.user, token: data.token }
    persistAuth(nextAuth.user, nextAuth.token)
    setUser(nextAuth.user)
    setToken(nextAuth.token)
    return data
  }

  const setSecurityQuestions = async (answers) => {
    const { data } = await api.post('/auth/security-questions', { answers })
    setUser(prev => (prev ? { ...prev, hasRecoveryAnswers: true } : prev))
    return data
  }

  const verifyRecoveryAnswers = async (email, answers) => {
    const { data } = await api.post('/auth/forgot-password/verify', { email, answers })
    return data
  }

  const resetPassword = async (resetToken, newPassword) => {
    const { data } = await api.post('/auth/forgot-password/reset', { resetToken, newPassword })
    return data
  }

  const logout = () => {
    clearStoredAuth()
    setUser(null)
    setToken(null)
  }

  const value = useMemo(
    () => ({ user, token, loading, login, signup, setSecurityQuestions, verifyRecoveryAnswers, resetPassword, logout, isAuthenticated: Boolean(user && token) }),
    [user, token, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
