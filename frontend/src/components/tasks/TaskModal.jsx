import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Trash2, RefreshCw, Bell, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { useCalendarStore } from '../../store'
import { tasksAPI, authAPI } from '../../api'
import toast from 'react-hot-toast'

const PRIORITIES = ['low', 'medium', 'high', 'urgent']
const PRIORITY_COLORS = { low: '#3a7bd5', medium: '#f59e0b', high: '#ef4444', urgent: '#ff2d55' }

export default function TaskModal() {
  const { editingTask, selectedDate, closeTaskModal, addTask, updateTask, removeTask, categories, tags } = useCalendarStore()
  const isEdit = !!editingTask

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: selectedDate || format(new Date(), 'yyyy-MM-dd'),
    time: '',
    end_time: '',
    priority: 'medium',
    status: 'pending',
    category: '',
    tag_ids: [],
    reminder_at: '',
  })
  const [saving, setSaving] = useState(false)
  const [syncingGcal, setSyncingGcal] = useState(false)

  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title || '',
        description: editingTask.description || '',
        date: editingTask.date || '',
        time: editingTask.time?.slice(0, 5) || '',
        end_time: editingTask.end_time?.slice(0, 5) || '',
        priority: editingTask.priority || 'medium',
        status: editingTask.status || 'pending',
        category: editingTask.category || '',
        tag_ids: editingTask.tags?.map(t => t.id) || [],
        reminder_at: editingTask.reminder_at ? editingTask.reminder_at.slice(0, 16) : '',
      })
    }
  }, [editingTask])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return }
    setSaving(true)
    const payload = {
      ...form,
      category: form.category || null,
      tag_ids: form.tag_ids,
      reminder_at: form.reminder_at || null,
    }
    try {
      if (isEdit) {
        const { data } = await tasksAPI.update(editingTask.id, payload)
        updateTask(data)
        toast.success('Task updated')
      } else {
        const { data } = await tasksAPI.create(payload)
        addTask(data)
        toast.success('Task created')
      }
      closeTaskModal()
    } catch (e) {
      toast.error('Failed to save task')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return
    try {
      await tasksAPI.delete(editingTask.id)
      removeTask(editingTask.id)
      toast.success('Task deleted')
      closeTaskModal()
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const handleSyncGcal = async () => {
    if (!editingTask) return
    setSyncingGcal(true)
    try {
      // Create or update Google Calendar event
      const { data } = await tasksAPI.update(editingTask.id, { ...form, sync_to_google: true })
      updateTask(data)
      toast.success('Synced to Google Calendar')
    } catch {
      toast.error('Sync failed')
    } finally {
      setSyncingGcal(false)
    }
  }

  const toggleTag = (id) => {
    setForm(f => ({
      ...f,
      tag_ids: f.tag_ids.includes(id) ? f.tag_ids.filter(t => t !== id) : [...f.tag_ids, id]
    }))
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-40"
        onClick={closeTaskModal}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="bg-bg-secondary border border-bg-border rounded-sm shadow-card-hover w-full max-w-lg pointer-events-auto max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border flex-shrink-0">
            <div>
              <div className="font-mono text-[10px] text-text-muted tracking-wider">
                {isEdit ? '// EDIT TASK' : '// NEW TASK'}
              </div>
              {isEdit && editingTask.imported_from_gmail && (
                <div className="font-mono text-[10px] text-text-muted mt-0.5">✉ imported from gmail</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEdit && (
                <>
                  <button
                    onClick={handleSyncGcal}
                    disabled={syncingGcal}
                    title="Sync to Google Calendar"
                    className="btn-icon text-text-muted hover:text-accent"
                  >
                    <RefreshCw size={14} className={syncingGcal ? 'animate-spin' : ''} />
                  </button>
                  <button onClick={handleDelete} className="btn-icon text-text-muted hover:text-priority-high">
                    <Trash2 size={14} />
                  </button>
                </>
              )}
              <button onClick={closeTaskModal} className="btn-icon">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Title */}
            <input
              className="input text-base font-sans"
              placeholder="Task title..."
              value={form.title}
              onChange={set('title')}
              autoFocus
            />

            {/* Description */}
            <textarea
              className="input resize-none font-sans"
              rows={3}
              placeholder="Description (optional)..."
              value={form.description}
              onChange={set('description')}
            />

            {/* Date + Time row */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="field-label">Date</label>
                <input type="date" className="input" value={form.date} onChange={set('date')} />
              </div>
              <div>
                <label className="field-label">Start time</label>
                <input type="time" className="input" value={form.time} onChange={set('time')} />
              </div>
              <div>
                <label className="field-label">End time</label>
                <input type="time" className="input" value={form.end_time} onChange={set('end_time')} />
              </div>
            </div>

            {/* Priority + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Priority</label>
                <div className="flex gap-1.5 flex-wrap">
                  {PRIORITIES.map(p => (
                    <button
                      key={p}
                      onClick={() => setForm(f => ({ ...f, priority: p }))}
                      className={`font-mono text-[10px] px-2 py-1 rounded-sm transition-all border ${
                        form.priority === p
                          ? 'border-current'
                          : 'border-bg-border text-text-muted'
                      }`}
                      style={form.priority === p ? {
                        color: PRIORITY_COLORS[p],
                        background: PRIORITY_COLORS[p] + '20',
                        borderColor: PRIORITY_COLORS[p],
                      } : {}}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="field-label">Status</label>
                <select className="input" value={form.status} onChange={set('status')}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Category */}
            {categories.length > 0 && (
              <div>
                <label className="field-label">Category</label>
                <select className="input" value={form.category} onChange={set('category')}>
                  <option value="">— None —</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div>
                <label className="field-label">Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`tag-pill transition-all border ${
                        form.tag_ids.includes(tag.id)
                          ? 'border-current'
                          : 'border-bg-border text-text-muted bg-bg-tertiary'
                      }`}
                      style={form.tag_ids.includes(tag.id) ? {
                        color: tag.color,
                        background: tag.color + '20',
                        borderColor: tag.color,
                      } : {}}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reminder */}
            <div>
              <label className="field-label flex items-center gap-1.5">
                <Bell size={11} /> Reminder (Gmail)
              </label>
              <input
                type="datetime-local"
                className="input"
                value={form.reminder_at}
                onChange={set('reminder_at')}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-bg-border flex items-center justify-end gap-3 flex-shrink-0">
            <button onClick={closeTaskModal} className="btn-ghost">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary min-w-[80px]">
              {saving ? '...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </motion.div>

      <style>{`
        .field-label {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #555;
          letter-spacing: 0.1em;
          margin-bottom: 6px;
        }
      `}</style>
    </>
  )
}
