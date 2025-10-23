import { create } from 'zustand'
export const useVenuesStore = create((set)=> ({ list: [], set: (patch)=> set(patch) }))
