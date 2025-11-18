import { create } from 'zustand'
import { api } from '../utils/api'

export const useCartStore = create((set,get)=> ({
  items: [],
  promo: null,
  add: (payload)=> set((s)=> ({ items: [...s.items, payload] })),
  remove: (idx)=> set((s)=> ({ items: s.items.filter((_,i)=>i!==idx) })),
  clear: ()=> set({ items: [], promo: null }),
  applyPromo: async (code)=> {
        if(!code){
          set({ promo: null })
          return null
        }
        try{
          const res = await api.post('/api/promos/validate', { code })
          if(!res.ok) throw new Error('invalid_promo')
          const p = await res.json()
          const discountPercent = Number(p.discountPercent ?? p.discountPct ?? 0)
          if(!discountPercent){
            set({ promo: null })
            return null
          }
          const normalized = {
            code: p.code,
            discountPercent,
            validUntilISO: p.validUntilISO ?? p.validUntil ?? null
          }
          set({ promo: normalized })
          return normalized
        }catch{
          set({ promo: null })
          return null
        }
      },
  totals: ()=> {
    const s = get()
    const subtotal = s.items.reduce((acc,i)=> acc + (i.price||0), 0)
    const discount = s.promo ? Math.round(subtotal * (s.promo.discountPercent/100)) : 0
    const total = Math.max(0, subtotal - discount)
    return { subtotal, discount, total }
  }
}))
