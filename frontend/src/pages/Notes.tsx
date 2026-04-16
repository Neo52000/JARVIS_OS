import { useEffect, useState, useRef } from 'react';
import { Plus, Search, Pin, Trash2 } from 'lucide-react';
import { notesAPI } from '@/api/endpoints';
import type { Note } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', tags: '' });
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchNotes = () => { setLoading(true); notesAPI.list(search || undefined).then((data) => { setNotes(data); setLoading(false); }); };
  useEffect(() => { fetchNotes(); }, [search]);

  const selectedNote = notes.find((n) => n.id === selectedId);

  const handleSelect = (note: Note) => {
    setSelectedId(note.id);
    setForm({ title: note.title, content: note.content || '', tags: (note.tags || []).join(', ') });
  };

  const handleAutoSave = (field: string, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!selectedId) return;
      await notesAPI.update(selectedId, { title: updated.title, content: updated.content, tags: updated.tags.split(',').map((t) => t.trim()).filter(Boolean) });
      fetchNotes();
    }, 1000);
  };

  const handleCreate = async () => {
    const data = await notesAPI.create({ title: 'Untitled Note', content: '' });
    fetchNotes();
    setSelectedId(data.id);
    setForm({ title: data.title, content: '', tags: '' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    await notesAPI.delete(id);
    if (selectedId === id) { setSelectedId(null); setForm({ title: '', content: '', tags: '' }); }
    fetchNotes();
  };

  const handlePin = async (note: Note) => { await notesAPI.update(note.id, { is_pinned: !note.is_pinned }); fetchNotes(); };

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      <div className="w-80 shrink-0 flex flex-col card !p-0 overflow-hidden">
        <div className="p-3 space-y-2" style={{ borderBottom: '1px solid rgba(0,240,255,0.2)' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-orbitron font-bold text-[#00f0ff] text-xs uppercase tracking-wider">Notes</h2>
            <button onClick={handleCreate} className="p-1.5 text-[#7a8ba0] hover:text-[#00f0ff] rounded-sm transition-colors"><Plus size={18} /></button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7a8ba0]" size={14} />
            <input className="input pl-8 !py-1.5 text-sm" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {loading ? <div className="flex justify-center py-6"><LoadingSpinner size="sm" /></div> : notes.length === 0 ? <p className="text-center text-[#7a8ba0] text-sm py-6">No notes</p> : (
            notes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleSelect(note)}
                className="p-3 cursor-pointer transition-colors hover:bg-[rgba(0,240,255,0.03)]"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  ...(selectedId === note.id ? { background: 'rgba(0,240,255,0.1)', borderLeft: '2px solid #00f0ff' } : {}),
                }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm truncate">{note.title}</h3>
                  <div className="flex gap-1 shrink-0">
                    {note.is_pinned && <Pin size={12} className="text-[#00f0ff]" />}
                    <button onClick={(e) => { e.stopPropagation(); handlePin(note); }} className="p-0.5 text-[#7a8ba0] hover:text-[#00f0ff]"><Pin size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }} className="p-0.5 text-[#7a8ba0] hover:text-[#ff3860]"><Trash2 size={12} /></button>
                  </div>
                </div>
                <p className="text-xs text-[#7a8ba0] mt-1 truncate">{note.content || 'Empty note'}</p>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex-1 card !p-0 flex flex-col overflow-hidden">
        {selectedNote ? (
          <>
            <div className="p-4" style={{ borderBottom: '1px solid rgba(0,240,255,0.2)' }}>
              <input className="w-full text-xl font-bold bg-transparent border-0 outline-none text-[#e0e6ed]" value={form.title} onChange={(e) => handleAutoSave('title', e.target.value)} placeholder="Note title" />
              <input className="w-full text-sm text-[#7a8ba0] bg-transparent border-0 outline-none mt-1" value={form.tags} onChange={(e) => handleAutoSave('tags', e.target.value)} placeholder="Tags (comma-separated)" />
            </div>
            <textarea className="flex-1 p-4 bg-transparent border-0 outline-none resize-none text-[#e0e6ed]" value={form.content} onChange={(e) => handleAutoSave('content', e.target.value)} placeholder="Start writing..." />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#7a8ba0]"><p>Select a note or create a new one</p></div>
        )}
      </div>
    </div>
  );
}
