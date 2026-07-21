import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // Single-user personal deployment: skip the login screen by signing in
      // with a fixed account. RLS still applies — this only removes the
      // manual login step, it does not weaken data isolation. No-op (falls
      // through to the normal login screen) if the env vars aren't set.
      const autoEmail = import.meta.env.VITE_JARVIS_AUTO_LOGIN_EMAIL;
      const autoPassword = import.meta.env.VITE_JARVIS_AUTO_LOGIN_PASSWORD;
      if (autoEmail && autoPassword) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: autoEmail,
          password: autoPassword,
        });
        if (!error) {
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          supabase.auth.onAuthStateChange((_event, session) => {
            set({ user: session?.user ?? null, isAuthenticated: !!session?.user });
          });
          return;
        }
        console.warn('JARVIS auto-login failed, falling back to manual login:', error.message);
      }
    }

    set({
      user: session?.user ?? null,
      isAuthenticated: !!session?.user,
      isLoading: false,
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
      });
    });
  },

  login: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  register: async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return !!data.session;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  updatePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },
}));
