import { create } from 'zustand';
import type { User } from '@/types';
import { authAPI } from '@/api/endpoints';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: sessionStorage.getItem('jarvis_token'),
  isAuthenticated: !!sessionStorage.getItem('jarvis_token'),
  isLoading: false,

  login: async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    const token = response.data.access_token;
    sessionStorage.setItem('jarvis_token', token);
    set({ token, isAuthenticated: true });
    await get().fetchCurrentUser();
  },

  register: async (email: string, password: string, fullName: string) => {
    await authAPI.register(email, password, fullName);
  },

  logout: () => {
    sessionStorage.removeItem('jarvis_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchCurrentUser: async () => {
    try {
      set({ isLoading: true });
      const response = await authAPI.getMe();
      set({ user: response.data, isLoading: false });
    } catch {
      get().logout();
      set({ isLoading: false });
    }
  },
}));
