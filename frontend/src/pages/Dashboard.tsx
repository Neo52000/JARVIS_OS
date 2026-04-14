import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckSquare, CalendarDays, AlertCircle } from 'lucide-react';
import { dashboardAPI } from '@/api/endpoints';
import type { DashboardStats } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats().then((r) => {
      setStats(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  }

  if (!stats) {
    return <p className="text-center text-gray-500 py-20">Failed to load dashboard data.</p>;
  }

  const statCards = [
    { label: 'Contacts', value: stats.total_contacts, icon: Users, color: 'bg-blue-500', link: '/contacts' },
    { label: 'Tasks (To Do)', value: stats.tasks_by_status.todo || 0, icon: CheckSquare, color: 'bg-yellow-500', link: '/tasks' },
    { label: 'Tasks (In Progress)', value: stats.tasks_by_status.in_progress || 0, icon: CheckSquare, color: 'bg-jarvis-500', link: '/tasks' },
    { label: 'Tasks Due Today', value: stats.tasks_due_today, icon: AlertCircle, color: 'bg-red-500', link: '/tasks' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link to={card.link} key={card.label} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`${card.color} p-3 rounded-lg text-white`}>
                <card.icon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CalendarDays size={20} /> Upcoming Events
          </h2>
          {stats.upcoming_events.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming events</p>
          ) : (
            <ul className="space-y-3">
              {stats.upcoming_events.map((event) => (
                <li key={event.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="font-medium">{event.title}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(event.start_time).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Notes</h2>
          {stats.recent_notes.length === 0 ? (
            <p className="text-gray-500 text-sm">No notes yet</p>
          ) : (
            <ul className="space-y-3">
              {stats.recent_notes.map((note) => (
                <li key={note.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <Link to="/notes" className="font-medium hover:text-jarvis-600">{note.title}</Link>
                  <span className="text-sm text-gray-500">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
