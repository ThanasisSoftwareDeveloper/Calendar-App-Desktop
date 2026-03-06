import { format, isToday } from 'date-fns'
import { useCalendarStore } from '../../store'
import TaskCard from '../tasks/TaskCard'
import { Plus, Clock } from 'lucide-react'

export default function DayView() {
  const { currentDate, tasks, openTaskModal } = useCalendarStore()
  const dateStr = format(currentDate, 'yyyy-MM-dd')
  const dayTasks = tasks[dateStr] || []

  const pending = dayTasks.filter(t => t.status === 'pending' || t.status === 'in_progress')
  const completed = dayTasks.filter(t => t.status === 'completed')

  return (
    <div className="h-full flex flex-col overflow-hidden p-5">
      {/* Day header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] text-text-muted tracking-widest mb-1">
            {format(currentDate, 'EEEE').toUpperCase()}
          </div>
          <h2 className="font-display text-4xl font-bold text-text-primary">
            {format(currentDate, 'd')}
            <span className={`ml-2 text-lg font-normal ${isToday(currentDate) ? 'text-accent' : 'text-text-secondary'}`}>
              {format(currentDate, 'MMMM yyyy')}
            </span>
          </h2>
          {isToday(currentDate) && (
            <div className="mt-1 font-mono text-xs text-accent">// today</div>
          )}
        </div>
        <button
          onClick={() => openTaskModal(null, dateStr)}
          className="btn-primary flex items-center gap-1.5"
        >
          <Plus size={14} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Active tasks */}
        <section>
          <div className="font-mono text-[10px] text-text-muted tracking-wider mb-3 flex items-center gap-2">
            <Clock size={11} />
            <span>TASKS ({pending.length})</span>
          </div>
          {pending.length === 0 ? (
            <div className="font-mono text-sm text-text-muted py-6 text-center border border-dashed border-bg-border rounded-sm">
              // no tasks for today
            </div>
          ) : (
            <div className="space-y-2">
              {pending.map(task => (
                <TaskCard key={task.id} task={task} onClick={() => openTaskModal(task)} />
              ))}
            </div>
          )}
        </section>

        {/* Completed */}
        {completed.length > 0 && (
          <section>
            <div className="font-mono text-[10px] text-text-muted tracking-wider mb-3">
              COMPLETED ({completed.length})
            </div>
            <div className="space-y-2 opacity-60">
              {completed.map(task => (
                <TaskCard key={task.id} task={task} onClick={() => openTaskModal(task)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
