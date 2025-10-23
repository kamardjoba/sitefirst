import { create } from 'zustand'
export const useActorsStore = create((set)=> ({ list: [], set: (patch)=> set(patch) }))
