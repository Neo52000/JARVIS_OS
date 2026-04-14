import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { tasksAPI } from '@/api/endpoints';
import type { Task, TaskStatus, TaskPriority } from '@/types';
import Modal from '@/components/Modal';
import LoadingSpinner from '@/components/LoadingSpinner';

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  done: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  medium: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<string>('');
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' as TaskPriority, due_date: '' });

  const fetchTasks = () => {
    setLoading(true);
    tasksAPI.list({ status: filter || undefined }).then((r) => {
      setTasks(r.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchTasks(); }, [filter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await tasksAPI.create({
      title: form.title,
      description: form.description || undefined,
      priority: form.priority,
      due_date: form.due_date || undefined,
    });
    setShowModal(false);
    setForm({ title: '', description: '', priority: 'medium', due_date: '' });
    fetchTasks();
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    await tasksAPI.updateStatus(id, status);
    fetchTasks();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this task?')) {
      await tasksAPI.delete(id);
      fetchTasks();
    }
  };

  const columns: TaskStatus[] = ['todo', 'in_progress', 'done'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Task
        </button>
      </div>

      <div className="flex gap-2">
        <button className={`px-3 py-1 rounded-full text-sm ${!filter ? 'bg-jarvis-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} onClick={() => setFilter('')}>All</button>
        {columns.map((s) => (
          <button key={s} className={`px-3 py-1 rounded-full text-sm ${filter === s ? 'bg-jarvis-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} onClick={() => setFilter(s)}>
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><LoadingSpinner /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {columns.map((col) => {
            const colTasks = (filter ? tasks : tasks.filter((t) => t.status === col));
            if (filter && filter !== col) return null;
            return (
              <div key={col} className="space-y-3">
                <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-500">
                  {STATUS_LABELS[col]} ({filter ? colTasks.length : colTasks.length})
                </h2>
                {colTasks.map((task) => (
                  <div key={task.id} className="card !p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium">{task.title}</h3>
                      <button onClick={() => handleDelete(task.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                    {task.description && <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                      {task.due_date && <span className="text-xs text-gray-500">{new Date(task.due_date).toLocaleDateString()}</span>}
                    </div>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      className={`text-xs px-2 py-1 rounded font-medium border-0 ${STATUS_COLORS[task.status]}`}
                    >
                      {columns.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Task">
        <form onSubmit={handleCreate} className="space-y-3">
          <input className="input" placeholder="Task title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className="input" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <input className="input" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          <button type="submit" className="btn-primary w-full">Create Task</button>
        </form>
      </Modal>
    </div>
  );
}
