import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
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
