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
        <h1 className="text-2xl font-bold">Calendar</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setForm({ title: '', description: '', start_time: '', end_time: '', location: '' }); setShowModal(true); }}><Plus size={18} /> Add Event</button>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><ChevronLeft size={20} /></button>
          <h2 className="text-lg font-semibold">{MONTH_NAMES[month]} {year}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><ChevronRight size={20} /></button>
        </div>
        {loading ? <div className="flex justify-center py-10"><LoadingSpinner /></div> : (
          <>
            <div className="grid grid-cols-7 gap-px mb-1">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="bg-gray-50 dark:bg-gray-800 h-24" />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                return (
                  <div key={day} onClick={() => handleDayClick(day)} className={`bg-white dark:bg-gray-800 h-24 p-1 cursor-pointer hover:bg-jarvis-50 dark:hover:bg-jarvis-900/20 ${isToday ? 'ring-2 ring-inset ring-jarvis-500' : ''}`}>
                    <span className={`text-sm font-medium ${isToday ? 'text-jarvis-600' : ''}`}>{day}</span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 3).map((ev) => <div key={ev.id} className="text-xs bg-jarvis-100 dark:bg-jarvis-900/40 text-jarvis-700 dark:text-jarvis-300 px-1 rounded truncate">{ev.title}</div>)}
                      {dayEvents.length > 3 && <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>}
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
            <div><label className="text-sm font-medium">Start</label><input className="input mt-1" type="datetime-local" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required /></div>
            <div><label className="text-sm font-medium">End</label><input className="input mt-1" type="datetime-local" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} required /></div>
          </div>
          <input className="input" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <button type="submit" className="btn-primary w-full">Create Event</button>
        </form>
      </Modal>
    </div>
  );
}
