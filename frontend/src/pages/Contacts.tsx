import { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { contactsAPI } from '@/api/endpoints';
import type { Contact } from '@/types';
import Modal from '@/components/Modal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Link } from 'react-router-dom';

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', position: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchContacts = () => {
    setLoading(true);
    contactsAPI.list(search || undefined).then((data) => {
      setContacts(data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchContacts(); }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await contactsAPI.update(editingId, form);
    } else {
      await contactsAPI.create(form);
    }
    setShowModal(false);
    setForm({ name: '', email: '', phone: '', company: '', position: '' });
    setEditingId(null);
    fetchContacts();
  };

  const handleEdit = (contact: Contact) => {
    setForm({ name: contact.name, email: contact.email || '', phone: contact.phone || '', company: contact.company || '', position: contact.position || '' });
    setEditingId(contact.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this contact?')) { await contactsAPI.delete(id); fetchContacts(); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setEditingId(null); setForm({ name: '', email: '', phone: '', company: '', position: '' }); setShowModal(true); }}>
          <Plus size={18} /> Add Contact
        </button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input className="input pl-10" placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {loading ? (
        <div className="flex justify-center py-10"><LoadingSpinner /></div>
      ) : contacts.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No contacts found</p>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Company</th>
                <th className="text-left p-4 font-medium">Phone</th>
                <th className="p-4 font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="p-4"><Link to={`/contacts/${c.id}`} className="text-jarvis-600 hover:underline font-medium">{c.name}</Link></td>
                  <td className="p-4 text-gray-500">{c.email || '\u2014'}</td>
                  <td className="p-4 text-gray-500">{c.company || '\u2014'}</td>
                  <td className="p-4 text-gray-500">{c.phone || '\u2014'}</td>
                  <td className="p-4"><div className="flex gap-2 justify-center">
                    <button onClick={() => handleEdit(c)} className="p-1 hover:text-jarvis-600"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1 hover:text-red-500"><Trash2 size={16} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Contact' : 'New Contact'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="input" placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <input className="input" placeholder="Position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
          <button type="submit" className="btn-primary w-full">{editingId ? 'Update' : 'Create'}</button>
        </form>
      </Modal>
    </div>
  );
}
