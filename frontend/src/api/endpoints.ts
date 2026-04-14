import client from './client';
import type {
  User,
  Contact,
  Task,
  Event,
  Note,
  DashboardStats,
  ChatMessage,
} from '@/types';

export const authAPI = {
  login: (email: string, password: string) =>
    client.post<{ access_token: string; token_type: string }>('/auth/login', {
      email,
      password,
    }),
  register: (email: string, password: string, full_name: string) =>
    client.post<User>('/auth/register', { email, password, full_name }),
  getMe: () => client.get<User>('/auth/me'),
};

export const contactsAPI = {
  list: (params?: { search?: string; skip?: number; limit?: number }) =>
    client.get<Contact[]>('/contacts', { params }),
  get: (id: string) => client.get<Contact>(`/contacts/${id}`),
  create: (data: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>) =>
    client.post<Contact>('/contacts', data),
  update: (id: string, data: Partial<Contact>) =>
    client.put<Contact>(`/contacts/${id}`, data),
  delete: (id: string) => client.delete(`/contacts/${id}`),
};

export const tasksAPI = {
  list: (params?: { status?: string; priority?: string; skip?: number; limit?: number }) =>
    client.get<Task[]>('/tasks', { params }),
  get: (id: string) => client.get<Task>(`/tasks/${id}`),
  create: (data: { title: string; description?: string; status?: string; priority?: string; due_date?: string }) =>
    client.post<Task>('/tasks', data),
  update: (id: string, data: Partial<Task>) =>
    client.put<Task>(`/tasks/${id}`, data),
  updateStatus: (id: string, status: string) =>
    client.patch<Task>(`/tasks/${id}/status`, { status }),
  delete: (id: string) => client.delete(`/tasks/${id}`),
};

export const eventsAPI = {
  list: (start: string, end: string) =>
    client.get<Event[]>('/events', { params: { start, end } }),
  get: (id: string) => client.get<Event>(`/events/${id}`),
  create: (data: { title: string; start_time: string; end_time: string; description?: string; location?: string; all_day?: boolean }) =>
    client.post<Event>('/events', data),
  update: (id: string, data: Partial<Event>) =>
    client.put<Event>(`/events/${id}`, data),
  delete: (id: string) => client.delete(`/events/${id}`),
};

export const notesAPI = {
  list: (params?: { search?: string; tag?: string; skip?: number; limit?: number }) =>
    client.get<Note[]>('/notes', { params }),
  get: (id: string) => client.get<Note>(`/notes/${id}`),
  create: (data: { title: string; content?: string; tags?: string[]; is_pinned?: boolean }) =>
    client.post<Note>('/notes', data),
  update: (id: string, data: Partial<Note>) =>
    client.put<Note>(`/notes/${id}`, data),
  delete: (id: string) => client.delete(`/notes/${id}`),
};

export const dashboardAPI = {
  getStats: () => client.get<DashboardStats>('/dashboard/stats'),
};

export const aiAPI = {
  chat: (messages: ChatMessage[]) =>
    client.post<{ reply: string; usage: Record<string, number> | null }>(
      '/ai/chat',
      { messages }
    ),
};
