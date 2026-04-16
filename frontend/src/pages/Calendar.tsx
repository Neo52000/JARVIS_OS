import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { eventsAPI } from '@/api/endpoints';
import type { Event } from '@/types';
import Modal from '@/components/Modal';
import LoadingSpinner from '@/components/LoadingSpinner';

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year: number, month: number) { return new Date(year, month, 1).getDay(); }
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', start_time: '', end_time: '', location: '' });

  const fetchEvents = () => {
    setLoading(true);
    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    eventsAPI.list(start, end).then((data) => { setEvents(data); setLoading(false); });
  };

  useEffect(() => { fetchEvents(); }, [year, month]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setForm({ title: '', description: '', start_time: `${dateStr}T09:00`, end_time: `${dateStr}T10:00`, location: '' });
    setShowModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await eventsAPI.create({ title: form.title, description: form.description || undefined, start_time: new Date(form.start_time).toISOString(), end_time: new Date(form.end_time).toISOString(), location: form.location || undefined });
    setShowModal(false);
    fetchEvents();
  };

  const getEventsForDay = (day: number) => events.filter((e) => { const d = new Date(e.start_time); return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year; });

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-orbitron font-bold text-[#00f0ff] uppercase tracking-wider" style={{ textShadow: '0 0 20px rgba(0,240,255,0.4)' }}>Calendar</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setForm({ title: '', description: '', start_time: '', end_time: '', location: '' }); setShowModal(true); }}><Plus size={18} /> Add Event</button>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 text-[#7a8ba0] hover:text-[#00f0ff] rounded-sm transition-colors"><ChevronLeft size={20} /></button>
          <h2 className="text-lg font-orbitron font-bold text-[#00f0ff] uppercase tracking-wider">{MONTH_NAMES[month]} {year}</h2>
          <button onClick={nextMonth} className="p-2 text-[#7a8ba0] hover:text-[#00f0ff] rounded-sm transition-colors"><ChevronRight size={20} /></button>
        </div>
        {loading ? <div className="flex justify-center py-10"><LoadingSpinner /></div> : (
          <>
            <div className="grid grid-cols-7 gap-px mb-1">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                <div key={d} className="text-center text-xs font-orbitron text-[#00f0ff] uppercase tracking-wider py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px rounded-sm overflow-hidden" style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.2)' }}>
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="h-24" style={{ background: '#0a0e17' }} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                return (
                  <div
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className="h-24 p-1 cursor-pointer transition-colors hover:bg-[rgba(0,240,255,0.05)]"
                    style={{
                      background: '#0d1321',
                      ...(isToday ? { boxShadow: 'inset 0 0 0 2px #00f0ff' } : {}),
                    }}
                  >
                    <span className={`text-sm font-medium ${isToday ? 'text-[#00f0ff]' : 'text-[#e0e6ed]'}`}>{day}</span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <div key={ev.id} className="text-xs px-1 rounded-sm truncate" style={{ background: 'rgba(0,240,255,0.15)', color: '#00f0ff' }}>{ev.title}</div>
                      ))}
                      {dayEvents.length > 3 && <div className="text-xs text-[#7a8ba0]">+{dayEvents.length - 3} more</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Event">
        <form onSubmit={handleCreate} className="space-y-3">
          <input className="input" placeholder="Event title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className="input" placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-[#7a8ba0] uppercase tracking-wider">Start</label><input className="input mt-1" type="datetime-local" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required /></div>
            <div><label className="text-xs font-semibold text-[#7a8ba0] uppercase tracking-wider">End</label><input className="input mt-1" type="datetime-local" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} required /></div>
          </div>
          <input className="input" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <button type="submit" className="btn-primary w-full">Create Event</button>
        </form>
      </Modal>
    </div>
  );
}
