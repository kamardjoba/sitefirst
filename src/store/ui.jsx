import { create } from 'zustand'
let id=0; export const useUiStore = create((set)=> ({ toasts: [], addToast: (t)=> set((s)=> ({ toasts:[...s.toasts, {id:++id, ...t}] })), removeToast:(id)=> set((s)=> ({ toasts: s.toasts.filter(t=>t.id!==id) })) }))
