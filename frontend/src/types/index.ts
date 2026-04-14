export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  position: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  all_day: boolean;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  tags: string[] | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_contacts: number;
  tasks_by_status: Record<string, number>;
  tasks_due_today: number;
  upcoming_events: { id: string; title: string; start_time: string }[];
  recent_notes: { id: string; title: string; updated_at: string }[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
