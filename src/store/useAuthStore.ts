// src/store/useAuthStore.ts
import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initializeAuth: () => () => void;
  signUp: (email: string, pass: string) => Promise<{ error: any }>;
  signIn: (email: string, pass: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  initializeAuth: () => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, loading: false });
    });

    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) throw error;
        set({ session, user: session?.user ?? null, loading: false });
      })
      .catch((error: unknown) => {
        console.error('Failed to restore the authentication session:', error);
        set({ loading: false });
      });

    return () => subscription.unsubscribe();
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));