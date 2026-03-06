import { useState } from 'react'
import { motion } from 'framer-motion'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth, isToday } from 'date-fns'
import { LayoutGrid, CalendarDays, Clock, Tag, Settings, LogOut, RefreshCw, Mail, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCalendarStore, useAuthStore } from '../../store'
import { authAPI } from '../../api'
import toast from 'react-hot-toast'

export default function Sidebar({ stats }) {
  const { view, setView, currentDate, setCurrentDate, categories } = useCalendarStore()
  const { user, googleProfile, logout } = useAuthStore()
  const [miniDate, setMiniDate] = useState(new Date())
  const [syncing, setSyncing] = useState(false)

  const navItems = [
    { id: 'month', label: 'Month', icon: LayoutGrid },
    { id: 'week', label: 'Week', icon: CalendarDays },
    { id: 'day', label: 'Day', icon: Clock },
  ]

  const handleSync = async () => {
    setSyncing(true)
    try {
      const { data } = await authAPI.syncGoogleCalendar()
      toast.success(data.message)
    } catch {
      toast.error('Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const handleGmailImport = async () => {
    try {
      const { data } = await authAPI.importFromGmail()
      toast.success(data.message)
    } catch {
      toast.error('Gmail import failed')
    }
  }

  // Mini calendar
  const miniDays = eachDayOfInterval({
    start: startOfMonth(miniDate),
    end: endOfMonth(miniDate),
  })
  const startDow = getDay(startOfMonth(miniDate)) // 0=Sun

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-56 bg-bg-secondary border-r border-bg-border flex flex-col h-full flex-shrink-0"
    >
      {/* Brand */}
      <div className="px-4 py-5 border-b border-bg-border">
        <div className="font-mono text-[10px] text-text-muted tracking-[0.25em] mb-1">DEVCALENDAR</div>
        <div className="font-mono text-xs text-accent">{format(new Date(), 'EEE, dd MMM yyyy')}</div>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-3 border-b border-bg-border">
        <div className="font-mono text-[10px] text-text-muted tracking-wider mb-2 px-1">// VIEW</div>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm text-sm font-sans transition-all duration-150 mb-0.5 ${
              view === id
                ? 'bg-accent/10 text-accent border border-accent/20'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Mini Calendar */}
      <div className="px-3 py-3 border-b border-bg-border">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs text-text-secondary">
            {format(miniDate, 'MMM yyyy')}
          </span>
          <div className="flex gap-1">
            <button onClick={() => setMiniDate(subMonths(miniDate, 1))} className="btn-icon p-0.5">
              <ChevronLeft size={12} />
            </button>
            <button onClick={() => setMiniDate(addMonths(miniDate, 1))} className="btn-icon p-0.5">
              <ChevronRight size={12} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-0">
          {['M','T','W','T','F','S','S'].map((d, i) => (
            <div key={i} className="text-center text-[9px] font-mono text-text-muted py-0.5">{d}</div>
          ))}
          {/* Offset for month start */}
          {Array.from({ length: (startDow + 6) % 7 }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {miniDays.map((day) => (
            <button
              key={day.toISOString()}
              onClick={() => {
                setCurrentDate(day)
                setMiniDate(day)
              }}
              className={`text-center text-[10px] py-0.5 rounded-sm transition-all font-mono ${
                isToday(day)
                  ? 'bg-accent text-bg-primary font-semibold'
                  : isSameDay(day, currentDate)
                  ? 'bg-accent/20 text-accent'
                  : isSameMonth(day, miniDate)
                  ? 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                  : 'text-text-muted'
              }`}
            >
              {format(day, 'd')}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="px-3 py-3 border-b border-bg-border">
          <div className="font-mono text-[10px] text-text-muted tracking-wider mb-2">// STATS</div>
          <div className="space-y-1.5">
            <StatRow label="Today" value={stats.today} accent />
            <StatRow label="Overdue" value={stats.overdue} warn={stats.overdue > 0} />
            <StatRow label="This week" value={stats.this_week} />
          </div>
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div className="px-3 py-3 border-b border-bg-border flex-1 overflow-y-auto">
          <div className="font-mono text-[10px] text-text-muted tracking-wider mb-2">// CATEGORIES</div>
          <div className="space-y-1">
            {categories.slice(0, 8).map(cat => (
              <div key={cat.id} className="flex items-center gap-2 text-xs text-text-secondary">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                <span className="truncate font-sans">{cat.name}</span>
                {cat.task_count > 0 && (
                  <span className="ml-auto font-mono text-[10px] text-text-muted">{cat.task_count}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Google Actions */}
      <div className="px-3 py-3 border-b border-bg-border space-y-1">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="w-full flex items-center gap-2 text-xs text-text-secondary hover:text-accent py-1.5 px-2 rounded-sm hover:bg-accent/5 transition-all font-mono"
        >
          <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
          <span>Sync Calendar</span>
        </button>
        <button
          onClick={handleGmailImport}
          className="w-full flex items-center gap-2 text-xs text-text-secondary hover:text-accent py-1.5 px-2 rounded-sm hover:bg-accent/5 transition-all font-mono"
        >
          <Mail size={12} />
          <span>Import Gmail</span>
        </button>
      </div>

      {/* User */}
      <div className="px-3 py-3 mt-auto">
        <div className="flex items-center gap-2 mb-2">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-7 h-7 rounded-full border border-bg-border" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-xs font-mono">
              {user?.name?.[0] || user?.username?.[0] || '?'}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-xs font-sans text-text-primary truncate">{user?.name || user?.username}</div>
            <div className="text-[10px] font-mono text-text-muted truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 text-xs text-text-muted hover:text-text-secondary py-1 px-2 rounded-sm hover:bg-bg-hover transition-all font-mono"
        >
          <LogOut size={11} />
          <span>Sign out</span>
        </button>
      </div>
    </motion.aside>
  )
}

function StatRow({ label, value, accent, warn }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-mono text-text-muted">{label}</span>
      <span className={`text-[11px] font-mono font-semibold ${
        accent ? 'text-accent' : warn ? 'text-priority-high' : 'text-text-secondary'
      }`}>{value}</span>
    </div>
  )
}
