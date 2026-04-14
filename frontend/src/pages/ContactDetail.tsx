import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { contactsAPI } from '@/api/endpoints';
import type { Contact } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', position: '', notes: '' });

  useEffect(() => {
    if (!id) return;
    contactsAPI.get(id).then((data) => {
      setContact(data);
      setForm({ name: data.name, email: data.email || '', phone: data.phone || '', company: data.company || '', position: data.position || '', notes: data.notes || '' });
      setLoading(false);
    });
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    const data = await contactsAPI.update(id, form);
    setContact(data);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!id || !confirm('Delete this contact?')) return;
    await contactsAPI.delete(id);
    navigate('/contacts');
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!contact) return <p className="text-center py-20 text-gray-500">Contact not found</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <button onClick={() => navigate('/contacts')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700"><ArrowLeft size={18} /> Back to Contacts</button>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{contact.name}</h1>
          <div className="flex gap-2">
            <button onClick={() => setEditing(!editing)} className="btn-secondary text-sm">{editing ? 'Cancel' : 'Edit'}</button>
            <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={18} /></button>
          </div>
        </div>
        {editing ? (
          <div className="space-y-3">
            <div><label className="text-sm font-medium">Name</label><input className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Email</label><input className="input mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Phone</label><input className="input mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Company</label><input className="input mt-1" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Position</label><input className="input mt-1" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Notes</label><textarea className="input mt-1" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <button onClick={handleSave} className="btn-primary">Save Changes</button>
          </div>
        ) : (
          <dl className="grid grid-cols-2 gap-4">
            <div><dt className="text-sm text-gray-500">Email</dt><dd>{contact.email || '\u2014'}</dd></div>
            <div><dt className="text-sm text-gray-500">Phone</dt><dd>{contact.phone || '\u2014'}</dd></div>
            <div><dt className="text-sm text-gray-500">Company</dt><dd>{contact.company || '\u2014'}</dd></div>
            <div><dt className="text-sm text-gray-500">Position</dt><dd>{contact.position || '\u2014'}</dd></div>
            <div className="col-span-2"><dt className="text-sm text-gray-500">Notes</dt><dd className="whitespace-pre-wrap">{contact.notes || '\u2014'}</dd></div>
          </dl>
        )}
      </div>
    </div>
  );
}
