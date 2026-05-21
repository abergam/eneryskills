import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:         null,
      accessToken:  null,
      refreshToken: null,

      login: (data) => set({
        user:         data.user,
        accessToken:  data.access,
        refreshToken: data.refresh,
      }),

      logout: () => set({
        user: null,
        accessToken: null,
        refreshToken: null,
      }),

      updateToken: (access) => set({ accessToken: access }),

      updateUser: (user) => set({ user }),

      isAuthenticated: () => !!get().accessToken,
      isAdmin:    () => get().user?.role === 'admin',
      isStagiaire: () => get().user?.role === 'stagiaire',
    }),
    {
      name: 'electroform-auth',
      partialize: (state) => ({
        user:         state.user,
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
