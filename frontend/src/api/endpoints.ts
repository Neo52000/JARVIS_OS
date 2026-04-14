import { supabase } from '@/lib/supabase';
import type { Contact, Task, Note, Event, DashboardStats } from '@/types';

// Contacts
export const contactsAPI = {
  list: async (search?: string) => {
    let query = supabase.from('contacts').select('*').order('created_at', { ascending: false });
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as Contact[];
  },
  get: async (id: string) => {
    const { data, error } = await supabase.from('contacts').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Contact;
  },
  create: async (contact: Partial<Contact>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('contacts').insert({ ...contact, user_id: user!.id }).select().single();
    if (error) throw error;
    return data as Contact;
  },
  update: async (id: string, contact: Partial<Contact>) => {
    const { data, error } = await supabase.from('contacts').update(contact).eq('id', id).select().single();
    if (error) throw error;
    return data as Contact;
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) throw error;
  },
};

// Tasks
export const tasksAPI = {
  list: async (status?: string, priority?: string) => {
    let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    const { data, error } = await query;
    if (error) throw error;
    return data as Task[];
  },
  create: async (task: Partial<Task>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('tasks').insert({ ...task, user_id: user!.id }).select().single();
    if (error) throw error;
    return data as Task;
  },
  update: async (id: string, task: Partial<Task>) => {
    const { data, error } = await supabase.from('tasks').update(task).eq('id', id).select().single();
    if (error) throw error;
    return data as Task;
  },
  updateStatus: async (id: string, status: string) => {
    const { data, error } = await supabase.from('tasks').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data as Task;
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },
};

// Events
export const eventsAPI = {
  list: async (start: string, end: string) => {
    const { data, error } = await supabase
      .from('events').select('*')
      .lte('start_time', end)
      .gte('end_time', start)
      .order('start_time');
    if (error) throw error;
    return data as Event[];
  },
  create: async (event: Partial<Event>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('events').insert({ ...event, user_id: user!.id }).select().single();
    if (error) throw error;
    return data as Event;
  },
  update: async (id: string, event: Partial<Event>) => {
    const { data, error } = await supabase.from('events').update(event).eq('id', id).select().single();
    if (error) throw error;
    return data as Event;
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
  },
};

// Notes
export const notesAPI = {
  list: async (search?: string, tag?: string) => {
    let query = supabase.from('notes').select('*').order('is_pinned', { ascending: false }).order('updated_at', { ascending: false });
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }
    if (tag) {
      query = query.contains('tags', [tag]);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as Note[];
  },
  create: async (note: Partial<Note>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('notes').insert({ ...note, user_id: user!.id }).select().single();
    if (error) throw error;
    return data as Note;
  },
  update: async (id: string, note: Partial<Note>) => {
    const { data, error } = await supabase.from('notes').update(note).eq('id', id).select().single();
    if (error) throw error;
    return data as Note;
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) throw error;
  },
};

// Dashboard
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const [contactsRes, tasksRes, eventsRes, notesRes] = await Promise.all([
      supabase.from('contacts').select('id', { count: 'exact', head: true }),
      supabase.from('tasks').select('*'),
      supabase.from('events').select('id, title, start_time').gte('start_time', new Date().toISOString()).order('start_time').limit(5),
      supabase.from('notes').select('id, title, updated_at').order('updated_at', { ascending: false }).limit(5),
    ]);

    const tasks = (tasksRes.data || []) as Task[];
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    return {
      total_contacts: contactsRes.count || 0,
      tasks_by_status: {
        todo: tasks.filter(t => t.status === 'todo').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        done: tasks.filter(t => t.status === 'done').length,
      },
      tasks_due_today: tasks.filter(t => t.due_date && t.status !== 'done' && new Date(t.due_date) >= todayStart && new Date(t.due_date) <= todayEnd).length,
      upcoming_events: (eventsRes.data || []) as DashboardStats['upcoming_events'],
      recent_notes: (notesRes.data || []) as DashboardStats['recent_notes'],
    };
  },
};

// AI Chat (calls Supabase Edge Function)
export const aiAPI = {
  chat: async (messages: { role: string; content: string }[]) => {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { messages },
    });
    if (error) throw error;
    return data as { reply: string };
  },
};
