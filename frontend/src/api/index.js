import axios from 'axios'
import { useAuthStore } from '../store'

// Production: VITE_API_URL = Render backend URL
// Local dev:  uses Vite proxy → localhost:8000
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const { refreshToken, setAuth, logout } = useAuthStore.getState()
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/token/refresh/`, { refresh: refreshToken })
          setAuth(useAuthStore.getState().user, data.access, refreshToken)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          logout()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export const tasksAPI = {
  getByMonth: (year, month) => api.get(`/tasks/by_month/?year=${year}&month=${month}`),
  getByWeek: (year, week) => api.get(`/tasks/by_week/?year=${year}&week=${week}`),
  getByDate: (date) => api.get(`/tasks/?date=${date}`),
  getToday: () => api.get('/tasks/today/'),
  getOverdue: () => api.get('/tasks/overdue/'),
  getStats: () => api.get('/tasks/stats/'),
  create: (data) => api.post('/tasks/', data),
  update: (id, data) => api.patch(`/tasks/${id}/`, data),
  delete: (id) => api.delete(`/tasks/${id}/`),
  complete: (id) => api.post(`/tasks/${id}/complete/`),
  move: (id, date, order) => api.patch(`/tasks/${id}/move/`, { date, order }),
  reorder: (taskOrders) => api.post('/tasks/reorder/', { task_orders: taskOrders }),
  importFromGmail: () => api.post('/tasks/import_from_gmail/'),
}

export const categoriesAPI = {
  list: () => api.get('/tasks/categories/'),
  create: (data) => api.post('/tasks/categories/', data),
  update: (id, data) => api.patch(`/tasks/categories/${id}/`, data),
  delete: (id) => api.delete(`/tasks/categories/${id}/`),
}

export const tagsAPI = {
  list: () => api.get('/tasks/tags/'),
  create: (data) => api.post('/tasks/tags/', data),
}

export const authAPI = {
  getGoogleAuthUrl: () => api.get('/auth/google/url/'),
  getGoogleProfile: () => api.get('/auth/google/profile/'),
  updateGoogleProfile: (data) => api.patch('/auth/google/profile/', data),
  syncGoogleCalendar: () => api.post('/auth/google/calendar/sync/'),
  importFromGmail: () => api.post('/auth/google/gmail/import/'),
  disconnectGoogle: () => api.delete('/auth/google/disconnect/'),
}

export const calendarAPI = {
  getSettings: () => api.get('/calendar/settings/'),
  updateSettings: (data) => api.patch('/calendar/settings/', data),
}

export default api
