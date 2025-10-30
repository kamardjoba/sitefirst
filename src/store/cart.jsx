import { create } from 'zustand'
import { api } from '../utils/api'

export const useCartStore = create((set,get)=> ({
  items: [],
  promo: null,
  add: (payload)=> set((s)=> ({ items: [...s.items, payload] })),
  remove: (idx)=> set((s)=> ({ items: s.items.filter((_,i)=>i!==idx) })),
  clear: ()=> set({ items: [], promo: null }),
  applyPromo: async (code)=> {
        const res = await fetch((import.meta.env.VITE_API_BASE||'') + '/api/promos/validate', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ code })
        })
        const p = await res.json()
        if(p){
          const normalized = { code: p.code, discountPercent: p.discountPct, validUntilISO: p.validUntil }
          set({ promo: normalized }); return normalized
        } else {
          set({ promo: null }); return null
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
