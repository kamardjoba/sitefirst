import { create } from 'zustand'
export const useCartStore = create((set,get)=> ({
  items: [],
  promo: null,
  add: (payload)=> set((s)=> ({ items: [...s.items, payload] })),
  remove: (idx)=> set((s)=> ({ items: s.items.filter((_,i)=>i!==idx) })),
  clear: ()=> set({ items: [], promo: null }),
  applyPromo: async (code)=> {
    const promos = await fetch('/mocks/promo.json').then(r=>r.json())
    const p = promos.find(pr => pr.code.toLowerCase()===code.toLowerCase() && new Date(pr.validUntilISO)>new Date())
    if(p){ set({ promo: p }) ; return p } else { set({ promo: null }); return null }
  },
  totals: ()=> {
    const s = get()
    const subtotal = s.items.reduce((acc,i)=> acc + (i.price||0), 0)
    const discount = s.promo ? Math.round(subtotal * (s.promo.discountPercent/100)) : 0
    const total = Math.max(0, subtotal - discount)
    return { subtotal, discount, total }
  }
}))
