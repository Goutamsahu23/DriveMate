import axios from 'axios'
import { API_URL } from '../config/env'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const currentPath = window.location.pathname
    const requestUrl = error.config?.url || ''

    if (currentPath.includes('/login') || currentPath.includes('/register')) {
      return Promise.reject(error)
    }

    if (requestUrl.includes('/users/me')) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      if (!currentPath.includes('/login')) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export default api
