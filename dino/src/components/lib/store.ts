import { create } from 'zustand';

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
  updateUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
    set({ user, isAuthenticated: true });
  },
  initialize: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      // Here you could validate the token with your API if needed
      set({ isInitialized: true, isAuthenticated: !!token });
    } else {
      set({ isInitialized: true });
    }
  },
})); 