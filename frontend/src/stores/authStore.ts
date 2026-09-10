import { create } from 'zustand';
import { getOrCreateSessionId } from '@/lib/session';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  jwt: string | null;
  sessionId: string;
  setUser: (user: User | null, jwt: string | null) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  return {
    user: null,
    jwt: null,
    sessionId: '',
    setUser: (user, jwt) => {
      if (typeof window !== 'undefined') {
        if (jwt) {
          localStorage.setItem('affeto_jwt', jwt);
          localStorage.setItem('affeto_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('affeto_jwt');
          localStorage.removeItem('affeto_user');
        }
      }
      set({ user, jwt });
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('affeto_jwt');
        localStorage.removeItem('affeto_user');
      }
      set({ user: null, jwt: null });
    },
    initAuth: () => {
      if (typeof window !== 'undefined') {
        const jwt = localStorage.getItem('affeto_jwt');
        const userStr = localStorage.getItem('affeto_user');
        const sessionId = getOrCreateSessionId();
        let user: User | null = null;
        if (userStr) {
          try {
            user = JSON.parse(userStr);
          } catch (e) {}
        }
        set({ jwt, user, sessionId });
      }
    },
  };
});
