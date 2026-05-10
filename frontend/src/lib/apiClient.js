import axios from 'axios'

const DEFAULT_API_BASE = 'http://127.0.0.1:8000/api'

function getApiBase() {
  return import.meta.env.VITE_API_URL || DEFAULT_API_BASE
}

export const api = axios.create({
  baseURL: getApiBase(),
  headers: { Accept: 'application/json' },
})

let activeRequests = 0
function updateLoader() {
  window.dispatchEvent(new CustomEvent('global-loader', { detail: activeRequests > 0 }))
}

api.interceptors.request.use((config) => {
  activeRequests++
  updateLoader()
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, (error) => {
  activeRequests--
  updateLoader()
  return Promise.reject(error)
})

api.interceptors.response.use((response) => {
  activeRequests--
  updateLoader()
  return response
}, (error) => {
  activeRequests--
  updateLoader()
  return Promise.reject(error)
})
