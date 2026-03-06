import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Clock, Calendar, Tag, CheckCircle2 } from 'lucide-react'
import { useCalendarStore } from '../../store'
import { tasksAPI } from '../../api'
import toast from 'react-hot-toast'

const PRIORITY_COLORS = {
  low: '#3a7bd5',
  medium: '#f59e0b',
  high: '#ef4444',
  urgent: '#ff2d55',
}

const PRIORITY_LABELS = { low: 'LOW', medium: 'MED', high: 'HIGH', urgent: 'URGENT' }

export default function TaskCard({ task, compact = false, onClick }) {
  const { updateTask } = useCalendarStore()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    borderLeftColor: PRIORITY_COLORS[task.priority] || '#555',
  }

  const handleComplete = async (e) => {
    e.stopPropagation()
    try {
      const { data } = await tasksAPI.complete(task.id)
      updateTask(data)
    } catch {
      toast.error('Failed to update task')
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`
        card border-l-2 cursor-grab active:cursor-grabbing group
        hover:border-bg-border-bright transition-all duration-150
        ${compact ? 'p-2' : 'p-3'}
        ${task.status === 'completed' ? 'opacity-50' : ''}
        ${task.is_overdue && task.status !== 'completed' ? 'border-l-priority-high' : ''}
      `}
    >
      <div className="flex items-start gap-2">
        {/* Complete button */}
        <button
          onClick={handleComplete}
          className={`mt-0.5 flex-shrink-0 transition-colors ${
            task.status === 'completed'
              ? 'text-accent'
              : 'text-text-muted hover:text-accent'
          }`}
        >
          <CheckCircle2 size={compact ? 13 : 15} />
        </button>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className={`font-sans text-sm text-text-primary leading-tight truncate ${
            task.status === 'completed' ? 'line-through text-text-muted' : ''
          }`}>
            {task.title}
          </div>

          {!compact && (
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {/* Time */}
              {task.time && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-text-muted">
                  <Clock size={10} />
                  {task.time.slice(0, 5)}
                </span>
              )}
              {/* Category */}
              {task.category_detail && (
                <span
                  className="flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: task.category_detail.color + '20',
                    color: task.category_detail.color,
                  }}
                >
                  {task.category_detail.icon} {task.category_detail.name}
                </span>
              )}
              {/* Priority */}
              <span
                className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm"
                style={{
                  background: PRIORITY_COLORS[task.priority] + '15',
                  color: PRIORITY_COLORS[task.priority],
                }}
              >
                {PRIORITY_LABELS[task.priority]}
              </span>
              {/* Gmail badge */}
              {task.imported_from_gmail && (
                <span className="font-mono text-[9px] text-text-muted">✉ gmail</span>
              )}
              {/* GCal badge */}
              {task.synced_with_google && (
                <span className="font-mono text-[9px] text-text-muted">⟳ gcal</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
