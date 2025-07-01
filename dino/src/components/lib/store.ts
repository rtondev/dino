import { create } from 'zustand';
import { API_BASE_URL } from './api';

interface User {
  id: number;
  username: string;
  email: string;
  user_type: string;
  age?: number;
  institution?: string;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  login: (user: User, token: string) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({ user: null, isAuthenticated: false });
  },
  updateUser: (user) => set((state) => ({ user: { ...state.user, ...user } as User })),
  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
    set({ user, isAuthenticated: true });
  },
  initialize: async () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const apiUrl = API_BASE_URL;
      if (token) {
        try {
          const response = await fetch(
            apiUrl + '/auth/profile',
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const data = await response.json();
          if (response.ok && data.success && data.data?.user) {
            set({ user: data.data.user, isAuthenticated: true, isInitialized: true });
          } else {
            localStorage.removeItem('token');
            set({ user: null, isAuthenticated: false, isInitialized: true });
          }
        } catch (e) {
          localStorage.removeItem('token');
          set({ user: null, isAuthenticated: false, isInitialized: true });
        }
      } else {
        set({ user: null, isAuthenticated: false, isInitialized: true });
      }
    } else {
      set({ isInitialized: true });
    }
  },
})); 