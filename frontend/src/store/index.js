import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      googleProfile: null,
      setAuth: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),
      setGoogleProfile: (googleProfile) => set({ googleProfile }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null, googleProfile: null }),
    }),
    { name: 'calendar-app-desktop-auth' }
  )
)

export const useCalendarStore = create((set, get) => ({
  // View state
  view: 'month', // 'month' | 'week' | 'day'
  currentDate: new Date(),
  selectedDate: null,

  // Tasks data  
  tasks: {},        // { 'YYYY-MM-DD': Task[] }
  tasksByMonth: {}, // cache key: 'YYYY-MM'
  categories: [],
  tags: [],

  // UI state
  isTaskModalOpen: false,
  editingTask: null,
  isDragging: false,

  // Actions
  setView: (view) => set({ view }),
  setCurrentDate: (date) => set({ currentDate: date }),
  setSelectedDate: (date) => set({ selectedDate: date }),

  openTaskModal: (task = null, date = null) => set({
    isTaskModalOpen: true,
    editingTask: task,
    selectedDate: date || get().selectedDate,
  }),
  closeTaskModal: () => set({ isTaskModalOpen: false, editingTask: null }),

  setTasks: (dateStr, tasks) => set((state) => ({
    tasks: { ...state.tasks, [dateStr]: tasks }
  })),

  setMonthTasks: (tasks) => {
    const grouped = {}
    tasks.forEach(task => {
      const key = task.date
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(task)
    })
    set((state) => ({ tasks: { ...state.tasks, ...grouped } }))
  },

  addTask: (task) => set((state) => {
    const key = task.date
    const existing = state.tasks[key] || []
    return { tasks: { ...state.tasks, [key]: [...existing, task].sort((a, b) => a.order - b.order) } }
  }),

  updateTask: (updatedTask) => set((state) => {
    const newTasks = { ...state.tasks }
    // Remove from old date if date changed
    Object.keys(newTasks).forEach(date => {
      newTasks[date] = newTasks[date].filter(t => t.id !== updatedTask.id)
    })
    // Add to new date
    const key = updatedTask.date
    newTasks[key] = [...(newTasks[key] || []), updatedTask].sort((a, b) => a.order - b.order)
    return { tasks: newTasks }
  }),

  removeTask: (taskId) => set((state) => {
    const newTasks = { ...state.tasks }
    Object.keys(newTasks).forEach(date => {
      newTasks[date] = newTasks[date].filter(t => t.id !== taskId)
    })
    return { tasks: newTasks }
  }),

  moveTask: (taskId, fromDate, toDate, newOrder = 0) => set((state) => {
    const newTasks = { ...state.tasks }
    const task = (newTasks[fromDate] || []).find(t => t.id === taskId)
    if (!task) return state

    newTasks[fromDate] = (newTasks[fromDate] || []).filter(t => t.id !== taskId)
    const updatedTask = { ...task, date: toDate, order: newOrder }
    newTasks[toDate] = [...(newTasks[toDate] || []), updatedTask].sort((a, b) => a.order - b.order)
    return { tasks: newTasks }
  }),

  setCategories: (categories) => set({ categories }),
  setTags: (tags) => set({ tags }),
  setIsDragging: (isDragging) => set({ isDragging }),
}))
