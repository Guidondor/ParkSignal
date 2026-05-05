import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/types';

interface AuthState {
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setIsLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  isLoading: true,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setIsLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ session: null, profile: null, isLoading: false }),
}));
