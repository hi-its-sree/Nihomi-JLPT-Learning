import axios from 'axios'

// Prefer explicit VITE_API_URL when set; otherwise use relative paths so Vite can proxy requests.
const defaultHost = import.meta.env.VITE_API_URL || ''

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
