import { useMemo, useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from 'date-fns'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCenter, useDroppable,
} from '@dnd-kit/core'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useCalendarStore } from '../../store'
import { tasksAPI } from '../../api'
import TaskChip from '../tasks/TaskChip'
import TaskCard from '../tasks/TaskCard'
import toast from 'react-hot-toast'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function MonthView() {
  const { currentDate, tasks, openTaskModal, moveTask, updateTask } = useCalendarStore()
  const [activeTask, setActiveTask] = useState(null)

  const days = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start, end })

    // Pad start with days from previous month (Mon start)
    const startDow = (start.getDay() + 6) % 7 // 0=Mon
    const prevDays = startDow > 0
      ? eachDayOfInterval({ start: new Date(start.getTime() - startDow * 86400000), end: new Date(start.getTime() - 86400000) })
      : []

    // Pad end
    const totalCells = Math.ceil((prevDays.length + days.length) / 7) * 7
    const nextCount = totalCells - prevDays.length - days.length
    const nextDays = nextCount > 0
      ? eachDayOfInterval({ start: new Date(end.getTime() + 86400000), end: new Date(end.getTime() + nextCount * 86400000) })
      : []

    return [...prevDays, ...days, ...nextDays]
  }, [currentDate])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleDragStart = ({ active }) => {
    // Find the task across all dates
    for (const [, dayTasks] of Object.entries(tasks)) {
      const task = dayTasks?.find(t => t.id === active.id)
      if (task) { setActiveTask(task); break }
    }
  }

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null)
    if (!over || active.id === over.id) return

    const toDate = over.id // over.id is the date string for droppable cells
    const fromDate = activeTask?.date
    if (!fromDate || toDate === fromDate) return

    // Optimistic update
    moveTask(active.id, fromDate, toDate)

    try {
      await tasksAPI.move(active.id, toDate, 0)
    } catch {
      // Revert
      moveTask(active.id, toDate, fromDate)
      toast.error('Failed to move task')
    }
  }

  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-bg-border flex-shrink-0">
          {WEEKDAYS.map(d => (
            <div key={d} className="py-2.5 text-center font-mono text-[11px] text-text-muted tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-rows-[repeat(auto-fill,minmax(120px,1fr))] h-full" style={{ gridTemplateRows: `repeat(${weeks.length}, 1fr)` }}>
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 border-b border-bg-border last:border-b-0" style={{ minHeight: '120px' }}>
                {week.map((day) => (
                  <DayCell
                    key={day.toISOString()}
                    day={day}
                    isCurrentMonth={isSameMonth(day, currentDate)}
                    tasks={tasks[format(day, 'yyyy-MM-dd')] || []}
                    onAddTask={() => openTaskModal(null, format(day, 'yyyy-MM-dd'))}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="drag-overlay">
            <TaskChip task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

function DayCell({ day, isCurrentMonth, tasks, onAddTask }) {
  const dateStr = format(day, 'yyyy-MM-dd')
  const today = isToday(day)
  const { setDroppable, isOver, setNodeRef } = useDroppable({ id: dateStr })
  const { openTaskModal } = useCalendarStore()

  const { isOver: isDragOver, setNodeRef: setRef } = useDroppable({ id: dateStr })

  const maxVisible = 3
  const visibleTasks = tasks.slice(0, maxVisible)
  const overflow = tasks.length - maxVisible

  return (
    <div
      ref={setRef}
      className={`border-r border-bg-border last:border-r-0 p-1.5 flex flex-col calendar-day-hover relative group
        ${!isCurrentMonth ? 'opacity-30' : ''}
        ${isDragOver ? 'drag-over' : ''}
      `}
      onDoubleClick={onAddTask}
    >
      {/* Day number */}
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-mono w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 transition-all ${
          today
            ? 'bg-accent text-bg-primary font-semibold'
            : 'text-text-secondary'
        }`}>
          {format(day, 'd')}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onAddTask() }}
          className="opacity-0 group-hover:opacity-100 transition-opacity btn-icon p-0.5"
        >
          <Plus size={11} />
        </button>
      </div>

      {/* Tasks */}
      <div className="flex flex-col gap-0.5 overflow-hidden">
        {visibleTasks.map(task => (
          <TaskChip
            key={task.id}
            task={task}
            onClick={() => openTaskModal(task)}
          />
        ))}
        {overflow > 0 && (
          <div className="font-mono text-[10px] text-text-muted px-1 py-0.5">
            +{overflow} more
          </div>
        )}
      </div>
    </div>
  )
}
