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

  const fetchNotes = () => {
    setLoading(true);
    notesAPI.list({ search: search || undefined }).then((r) => {
      setNotes(r.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchNotes(); }, [search]);

  const selectedNote = notes.find((n) => n.id === selectedId);

  const handleSelect = (note: Note) => {
    setSelectedId(note.id);
    setForm({
      title: note.title,
      content: note.content || '',
      tags: (note.tags || []).join(', '),
    });
  };

  const handleAutoSave = (field: string, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!selectedId) return;
      await notesAPI.update(selectedId, {
        title: updated.title,
        content: updated.content,
        tags: updated.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      fetchNotes();
    }, 1000);
  };

  const handleCreate = async () => {
    const r = await notesAPI.create({ title: 'Untitled Note', content: '' });
    fetchNotes();
    setSelectedId(r.data.id);
    setForm({ title: r.data.title, content: '', tags: '' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    await notesAPI.delete(id);
    if (selectedId === id) { setSelectedId(null); setForm({ title: '', content: '', tags: '' }); }
    fetchNotes();
  };

  const handlePin = async (note: Note) => {
    await notesAPI.update(note.id, { is_pinned: !note.is_pinned });
    fetchNotes();
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      {/* Sidebar */}
      <div className="w-80 shrink-0 flex flex-col card !p-0 overflow-hidden">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Notes</h2>
            <button onClick={handleCreate} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Plus size={18} /></button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input className="input pl-8 !py-1.5 text-sm" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center py-6"><LoadingSpinner size="sm" /></div>
          ) : notes.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-6">No notes</p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleSelect(note)}
                className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 ${
                  selectedId === note.id ? 'bg-jarvis-50 dark:bg-jarvis-900/20 border-l-2 border-l-jarvis-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm truncate">{note.title}</h3>
                  <div className="flex gap-1 shrink-0">
                    {note.is_pinned && <Pin size={12} className="text-jarvis-500" />}
                    <button onClick={(e) => { e.stopPropagation(); handlePin(note); }} className="p-0.5 hover:text-jarvis-500"><Pin size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }} className="p-0.5 hover:text-red-500"><Trash2 size={12} /></button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">{note.content || 'Empty note'}</p>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {note.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 card !p-0 flex flex-col overflow-hidden">
        {selectedNote ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <input
                className="w-full text-xl font-bold bg-transparent border-0 outline-none"
                value={form.title}
                onChange={(e) => handleAutoSave('title', e.target.value)}
                placeholder="Note title"
              />
              <input
                className="w-full text-sm text-gray-500 bg-transparent border-0 outline-none mt-1"
                value={form.tags}
                onChange={(e) => handleAutoSave('tags', e.target.value)}
                placeholder="Tags (comma-separated)"
              />
            </div>
            <textarea
              className="flex-1 p-4 bg-transparent border-0 outline-none resize-none"
              value={form.content}
              onChange={(e) => handleAutoSave('content', e.target.value)}
              placeholder="Start writing..."
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
