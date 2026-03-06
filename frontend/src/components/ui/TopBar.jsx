import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react'
import { useCalendarStore } from '../../store'
import { motion } from 'framer-motion'

export default function TopBar() {
  const { view, currentDate, setCurrentDate, openTaskModal } = useCalendarStore()

  const navigate = (dir) => {
    if (view === 'month') setCurrentDate(dir > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1))
    else if (view === 'week') setCurrentDate(dir > 0 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1))
    else setCurrentDate(dir > 0 ? addDays(currentDate, 1) : subDays(currentDate, 1))
  }

  const getTitle = () => {
    if (view === 'month') return format(currentDate, 'MMMM yyyy')
    if (view === 'week') return `Week ${format(currentDate, 'w')} · ${format(currentDate, 'yyyy')}`
    return format(currentDate, 'EEEE, MMMM d yyyy')
  }

  return (
    <header className="h-14 border-b border-bg-border bg-bg-secondary flex items-center px-5 gap-4 flex-shrink-0">
      {/* Date navigation */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="btn-icon">
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => navigate(1)} className="btn-icon">
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => setCurrentDate(new Date())}
          className="font-mono text-xs text-text-muted hover:text-accent px-2 py-1 rounded-sm hover:bg-accent/5 transition-all"
        >
          Today
        </button>
      </div>

      {/* Title */}
      <motion.h2
        key={getTitle()}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display font-semibold text-text-primary text-lg"
      >
        {getTitle()}
      </motion.h2>

      <div className="flex-1" />

      {/* Actions */}
      <button className="btn-icon">
        <Search size={15} />
      </button>

      <button
        onClick={() => openTaskModal(null, format(currentDate, 'yyyy-MM-dd'))}
        className="btn-primary flex items-center gap-1.5"
      >
        <Plus size={14} />
        <span>New Task</span>
      </button>
    </header>
  )
}
