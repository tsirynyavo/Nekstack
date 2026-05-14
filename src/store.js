import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        localStorage.setItem('vanquaire_token', token);
        localStorage.setItem('vanquaire_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('vanquaire_token');
        localStorage.removeItem('vanquaire_user');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'vanquaire-storage',
    }
  )
);