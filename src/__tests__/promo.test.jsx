import { describe, it, expect } from 'vitest'
import { useCartStore } from '../store/cart'

describe('promo', ()=>{
  it('applies valid promo reduces total', async ()=>{
    const store = useCartStore.getState()
    store.add({ price: 100, seat:{}, showId:1, sessionId:1, session:{} })
    const p = await store.applyPromo('SALE10')
    const { total } = useCartStore.getState().totals()
    expect(p).not.toBeNull()
    expect(total).toBe(90)
  })
})
