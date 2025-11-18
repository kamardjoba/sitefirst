import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useCartStore } from '../store/cart'

describe('promo', ()=>{
  beforeEach(()=>{
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        code: 'SALE10',
        discountPercent: 10,
        validUntilISO: '2025-12-31T23:59:59.000Z',
      }),
    })
    useCartStore.setState({ items: [], promo: null })
  })

  afterEach(()=>{
    vi.restoreAllMocks()
    useCartStore.setState({ items: [], promo: null })
  })

  it('applies valid promo reduces total', async ()=>{
    const store = useCartStore.getState()
    store.add({ price: 100, seat:{}, showId:1, sessionId:1, session:{} })
    const p = await store.applyPromo('SALE10')
    const { total, discount } = useCartStore.getState().totals()
    expect(p).not.toBeNull()
    expect(discount).toBe(10)
    expect(total).toBe(90)
  })
})
