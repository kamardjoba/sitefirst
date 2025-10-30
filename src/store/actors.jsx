import { create } from 'zustand'
export const useActorsStore = create((set)=>({ list: [], set: (p)=>set(s=>({...s,...p})) }));
