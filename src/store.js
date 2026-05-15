import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
      checkAuth: () => {
        const token = localStorage.getItem('token');
        if (token && !get().isAuthenticated) {
          // Ici tu pourrais vérifier le token avec le backend
          set({ token, isAuthenticated: true });
        }
      }
    }),
    { name: 'auth-storage' }
  )
);