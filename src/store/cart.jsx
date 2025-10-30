import { create } from 'zustand'
import { api } from '../utils/api'

export const useCartStore = create((set,get)=> ({
  items: [],
  promo: null,
  add: (payload)=> set((s)=> ({ items: [...s.items, payload] })),
  remove: (idx)=> set((s)=> ({ items: s.items.filter((_,i)=>i!==idx) })),
  clear: ()=> set({ items: [], promo: null }),
  applyPromo: async (code)=> {
        const p = await api.post('/api/promos/validate', { code }).then(r=>r.json())
        if(p){ set({ promo: { code: p.code, discountPercent: p.discountPercent, validUntilISO: p.validUntil } }); return p }
        set({ promo: null }); return null
      },
  totals: ()=> {
    const s = get()
    const subtotal = s.items.reduce((acc,i)=> acc + (i.price||0), 0)
    const discount = s.promo ? Math.round(subtotal * (s.promo.discountPercent/100)) : 0
    const total = Math.max(0, subtotal - discount)
    return { subtotal, discount, total }
  }
}))
