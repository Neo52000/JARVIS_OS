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
    dashboardAPI.getStats().then((data) => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  }

  if (!stats) {
    return <p className="text-center text-[#7a8ba0] py-20">Failed to load dashboard data.</p>;
  }

  const statCards = [
    { label: 'Contacts', value: stats.total_contacts, icon: Users, color: '#00f0ff', link: '/contacts' },
    { label: 'Tasks (To Do)', value: stats.tasks_by_status.todo || 0, icon: CheckSquare, color: '#ff9100', link: '/tasks' },
    { label: 'Tasks (In Progress)', value: stats.tasks_by_status.in_progress || 0, icon: CheckSquare, color: '#b388ff', link: '/tasks' },
    { label: 'Tasks Due Today', value: stats.tasks_due_today, icon: AlertCircle, color: '#ff3860', link: '/tasks' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-orbitron font-bold text-[#00f0ff] uppercase tracking-wider" style={{ textShadow: '0 0 20px rgba(0,240,255,0.4)' }}>
        Command Center
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link to={card.link} key={card.label} className="card hover:shadow-cyan-glow-sm transition-all text-center">
            <div className="flex flex-col items-center gap-3">
              <card.icon size={28} style={{ color: card.color, filter: `drop-shadow(0 0 8px ${card.color})` }} />
              <div>
                <p
                  className="text-3xl font-orbitron font-black"
                  style={{ color: card.color, textShadow: `0 0 20px ${card.color}` }}
                >
                  {card.value}
                </p>
                <p className="text-xs text-[#7a8ba0] uppercase tracking-wider mt-1">{card.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-sm font-orbitron font-bold text-[#00f0ff] uppercase tracking-wider mb-4 flex items-center gap-2">
            <CalendarDays size={18} /> Upcoming Events
          </h2>
          {stats.upcoming_events.length === 0 ? (
            <p className="text-[#7a8ba0] text-sm">No upcoming events</p>
          ) : (
            <ul className="space-y-3">
              {stats.upcoming_events.map((event) => (
                <li key={event.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="font-medium">{event.title}</span>
                  <span className="text-sm text-[#7a8ba0]">{new Date(event.start_time).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2 className="text-sm font-orbitron font-bold text-[#00f0ff] uppercase tracking-wider mb-4">
            Recent Notes
          </h2>
          {stats.recent_notes.length === 0 ? (
            <p className="text-[#7a8ba0] text-sm">No notes yet</p>
          ) : (
            <ul className="space-y-3">
              {stats.recent_notes.map((note) => (
                <li key={note.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <Link to="/notes" className="font-medium hover:text-[#00f0ff] transition-colors">{note.title}</Link>
                  <span className="text-sm text-[#7a8ba0]">{new Date(note.updated_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
