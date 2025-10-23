import { create } from 'zustand'
export const useShowsStore = create((set)=> ({ list: [], set: (patch)=> set(patch) }))
