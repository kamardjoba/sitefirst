import { create } from 'zustand'
export const useVenuesStore = create((set)=>({ list: [], set: (p)=>set(s=>({...s,...p})) }));