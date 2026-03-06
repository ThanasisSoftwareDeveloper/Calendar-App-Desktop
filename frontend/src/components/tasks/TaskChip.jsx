import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

const PRIORITY_COLORS = {
  low: '#3a7bd5',
  medium: '#f59e0b',
  high: '#ef4444',
  urgent: '#ff2d55',
}

const STATUS_OPACITY = {
  completed: 'opacity-50 line-through',
  cancelled: 'opacity-30 line-through',
  pending: '',
  in_progress: '',
}

export default function TaskChip({ task, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    borderLeftColor: PRIORITY_COLORS[task.priority] || '#555',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => { e.stopPropagation(); onClick?.() }}
      className={`
        text-[11px] font-sans px-1.5 py-0.5 rounded-sm border-l-2 cursor-grab active:cursor-grabbing
        bg-bg-tertiary hover:bg-bg-hover text-text-secondary hover:text-text-primary
        transition-colors truncate select-none
        ${STATUS_OPACITY[task.status] || ''}
      `}
      title={task.title}
    >
      <span className="truncate">{task.title}</span>
    </div>
  )
}
