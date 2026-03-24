import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CLIENT';
  phone?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  checkAuth: () => void;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
      checkAuth: () => {
        const user = get().user;
        if (user) {
          set({ isAuthenticated: true, isLoading: false });
        } else {
          set({ isAuthenticated: false, isLoading: false });
        }
      },
      fetchWithAuth: async (url: string, options: RequestInit = {}) => {
        const user = get().user;
        
        if (!user) {
          throw new Error('Not authenticated');
        }

        const headers = {
          ...options.headers,
          'x-user-id': user.id,
        };

        return fetch(url, {
          ...options,
          headers,
        });
      },
    }),
    {
      name: 'atom-medz-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Export a non-persisted version for server-side
export const useAuthStoreWithoutPersist = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
  checkAuth: () => {
    // No-op for server-side
  },
  fetchWithAuth: async () => {
    throw new Error('Not implemented on server');
  },
}));
