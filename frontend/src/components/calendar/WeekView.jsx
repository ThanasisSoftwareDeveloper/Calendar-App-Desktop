import { useMemo, useState } from 'react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, addDays } from 'date-fns'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core'
import { useCalendarStore } from '../../store'
import { tasksAPI } from '../../api'
import TaskCard from '../tasks/TaskCard'
import TaskChip from '../tasks/TaskChip'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function WeekView() {
  const { currentDate, tasks, openTaskModal, moveTask } = useCalendarStore()
  const [activeTask, setActiveTask] = useState(null)

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end: addDays(start, 6) })
  }, [currentDate])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleDragStart = ({ active }) => {
    for (const dayTasks of Object.values(tasks)) {
      const task = dayTasks?.find(t => t.id === active.id)
      if (task) { setActiveTask(task); break }
    }
  }

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null)
    if (!over || !activeTask) return
    const toDate = over.id
    const fromDate = activeTask.date
    if (toDate === fromDate) return

    moveTask(active.id, fromDate, toDate)
    try {
      await tasksAPI.move(active.id, toDate, 0)
    } catch {
      moveTask(active.id, toDate, fromDate)
      toast.error('Failed to move task')
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-7 border-b border-bg-border flex-shrink-0">
          {weekDays.map(day => (
            <div key={day.toISOString()} className="py-3 px-3 border-r border-bg-border last:border-r-0">
              <div className="font-mono text-[10px] text-text-muted tracking-wider mb-1">
                {format(day, 'EEE').toUpperCase()}
              </div>
              <div className={`font-display text-xl font-semibold w-8 h-8 flex items-center justify-center rounded-sm ${
                isToday(day) ? 'bg-accent text-bg-primary' : 'text-text-primary'
              }`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className="grid grid-cols-7 flex-1 overflow-y-auto">
          {weekDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayTasks = tasks[dateStr] || []
            return (
              <WeekDayColumn
                key={dateStr}
                dateStr={dateStr}
                tasks={dayTasks}
                onAdd={() => openTaskModal(null, dateStr)}
                onEdit={(task) => openTaskModal(task)}
              />
            )
          })}
        </div>
      </div>

      <DragOverlay>
        {activeTask && <div className="drag-overlay"><TaskChip task={activeTask} /></div>}
      </DragOverlay>
    </DndContext>
  )
}

function WeekDayColumn({ dateStr, tasks, onAdd, onEdit }) {
  const { isOver, setNodeRef } = useDroppable({ id: dateStr })

  return (
    <div
      ref={setNodeRef}
      className={`border-r border-bg-border last:border-r-0 p-2 flex flex-col gap-1 group transition-colors ${
        isOver ? 'bg-accent/5 border-accent/30' : ''
      }`}
    >
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} compact onClick={() => onEdit(task)} />
      ))}
      <button
        onClick={onAdd}
        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-mono text-text-muted hover:text-accent py-1 px-1 rounded-sm hover:bg-accent/5"
      >
        <Plus size={11} /> add
      </button>
    </div>
  )
}
