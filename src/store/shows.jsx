import { create } from 'zustand';

export const useShowsStore = create((set) => ({
  list: [],                               // ✅ всегда массив, не undefined
  set: (payload) => set((s) => ({ ...s, ...payload })),
}));