import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { tasksAPI } from '@/api/endpoints';
import type { Task, TaskStatus, TaskPriority } from '@/types';
import Modal from '@/components/Modal';
import LoadingSpinner from '@/components/LoadingSpinner';

const STATUS_LABELS: Record<TaskStatus, string> = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };
const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'text-[#ff9100]',
  in_progress: 'text-[#00f0ff]',
  done: 'text-[#00e676]',
};
const STATUS_BG: Record<TaskStatus, React.CSSProperties> = {
  todo: { background: 'rgba(255,145,0,0.15)', border: '1px solid rgba(255,145,0,0.3)', color: '#ff9100' },
  in_progress: { background: 'rgba(0,240,255,0.15)', border: '1px solid rgba(0,240,255,0.3)', color: '#00f0ff' },
  done: { background: 'rgba(0,230,118,0.15)', border: '1px solid rgba(0,230,118,0.3)', color: '#00e676' },
};
const PRIORITY_STYLES: Record<TaskPriority, React.CSSProperties> = {
  low: { background: 'rgba(122,139,160,0.15)', color: '#7a8ba0' },
  medium: { background: 'rgba(255,145,0,0.15)', color: '#ff9100' },
  high: { background: 'rgba(255,56,96,0.15)', color: '#ff3860' },
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<string>('');
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' as TaskPriority, due_date: '' });

  const fetchTasks = () => {
    setLoading(true);
    tasksAPI.list(filter || undefined).then((data) => { setTasks(data); setLoading(false); });
  };

  useEffect(() => { fetchTasks(); }, [filter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await tasksAPI.create({ title: form.title, description: form.description || undefined, priority: form.priority, due_date: form.due_date || undefined });
    setShowModal(false);
    setForm({ title: '', description: '', priority: 'medium', due_date: '' });
    fetchTasks();
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    await tasksAPI.updateStatus(id, status);
    fetchTasks();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this task?')) { await tasksAPI.delete(id); fetchTasks(); }
  };

  const columns: TaskStatus[] = ['todo', 'in_progress', 'done'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-orbitron font-bold text-[#00f0ff] uppercase tracking-wider" style={{ textShadow: '0 0 20px rgba(0,240,255,0.4)' }}>Tasks</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}><Plus size={18} /> Add Task</button>
      </div>
      <div className="flex gap-2">
        <button
          className="px-4 py-1 rounded-sm text-sm uppercase tracking-wider font-semibold transition-all"
          style={!filter ? { background: 'rgba(0,240,255,0.15)', border: '1px solid #00f0ff', color: '#00f0ff' } : { background: 'transparent', border: '1px solid rgba(0,240,255,0.2)', color: '#7a8ba0' }}
          onClick={() => setFilter('')}
        >All</button>
        {columns.map((s) => (
          <button
            key={s}
            className="px-4 py-1 rounded-sm text-sm uppercase tracking-wider font-semibold transition-all"
            style={filter === s ? STATUS_BG[s] : { background: 'transparent', border: '1px solid rgba(0,240,255,0.2)', color: '#7a8ba0' }}
            onClick={() => setFilter(s)}
          >{STATUS_LABELS[s]}</button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-10"><LoadingSpinner /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {columns.map((col) => {
            const colTasks = filter ? tasks : tasks.filter((t) => t.status === col);
            if (filter && filter !== col) return null;
            return (
              <div key={col} className="space-y-3">
                <h2 className={`font-orbitron text-xs uppercase tracking-wider font-bold ${STATUS_COLORS[col]}`}>{STATUS_LABELS[col]} ({colTasks.length})</h2>
                {colTasks.map((task) => (
                  <div key={task.id} className="card !p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium">{task.title}</h3>
                      <button onClick={() => handleDelete(task.id)} className="text-[#7a8ba0] hover:text-[#ff3860] transition-colors"><Trash2 size={14} /></button>
                    </div>
                    {task.description && <p className="text-sm text-[#7a8ba0] line-clamp-2">{task.description}</p>}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-sm text-xs font-semibold uppercase tracking-wider" style={PRIORITY_STYLES[task.priority]}>{task.priority}</span>
                      {task.due_date && <span className="text-xs text-[#7a8ba0]">{new Date(task.due_date).toLocaleDateString()}</span>}
                    </div>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      className="text-xs px-2 py-1 rounded-sm font-semibold uppercase tracking-wider cursor-pointer"
                      style={{ ...STATUS_BG[task.status], outline: 'none' }}
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
            <option value="low">Low Priority</option><option value="medium">Medium Priority</option><option value="high">High Priority</option>
          </select>
          <input className="input" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          <button type="submit" className="btn-primary w-full">Create Task</button>
        </form>
      </Modal>
    </div>
  );
}
