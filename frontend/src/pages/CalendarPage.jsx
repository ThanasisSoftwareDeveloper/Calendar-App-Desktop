import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCalendarStore } from '../store'
import { tasksAPI, categoriesAPI, tagsAPI } from '../api'
import Sidebar from '../components/ui/Sidebar'
import TopBar from '../components/ui/TopBar'
import MonthView from '../components/calendar/MonthView'
import WeekView from '../components/calendar/WeekView'
import DayView from '../components/calendar/DayView'
import TaskModal from '../components/tasks/TaskModal'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function CalendarPage() {
  const { view, currentDate, setCategories, setTags, setMonthTasks, isTaskModalOpen } = useCalendarStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  // Load categories, tags, initial tasks
  useEffect(() => {
    const init = async () => {
      try {
        const [cats, tags, statsRes] = await Promise.all([
          categoriesAPI.list(),
          tagsAPI.list(),
          tasksAPI.getStats(),
        ])
        setCategories(cats.data.results || cats.data)
        setTags(tags.data.results || tags.data)
        setStats(statsRes.data)
      } catch (e) {
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Load tasks when month/date changes
  useEffect(() => {
    if (view === 'month') {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      tasksAPI.getByMonth(year, month)
        .then(({ data }) => setMonthTasks(data.results || data))
        .catch(() => toast.error('Failed to load tasks'))
    }
  }, [view, currentDate.getMonth(), currentDate.getFullYear()])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="font-mono text-accent text-xs mb-3">// loading workspace</div>
          <div className="w-5 h-5 border border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      <Sidebar stats={stats} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {view === 'month' && (
              <motion.div
                key="month"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <MonthView />
              </motion.div>
            )}
            {view === 'week' && (
              <motion.div
                key="week"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <WeekView />
              </motion.div>
            )}
            {view === 'day' && (
              <motion.div
                key="day"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <DayView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {isTaskModalOpen && <TaskModal />}
      </AnimatePresence>
    </div>
  )
}
