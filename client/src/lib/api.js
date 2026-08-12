import axios from 'axios'

// Prefer an explicit API URL when provided; otherwise use the current browser origin so
// requests work through the reverse proxy in Docker and through Vite's dev proxy locally.
const defaultHost = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')

const api = axios.create({
  baseURL: defaultHost,
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
})

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  try {
    const raw = window.localStorage.getItem('jlpt-auth')
    if (raw) {
      const { token } = JSON.parse(raw)
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // ignore
  }
  return config
})

export default api
