import { create } from 'zustand'

// Mode "focus" : masque le menu principal (AppLayout) et le panneau de
// chapitres (CoursPage) pour laisser toute la largeur à la présentation.
export const useUIStore = create((set) => ({
  focusMode: false,
  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
  setFocusMode: (v) => set({ focusMode: v }),
}))
