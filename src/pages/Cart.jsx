import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cart'
import { useShowsStore } from '../store/shows'
import CartItem from '../components/CartItem'
import CartSummary from '../components/CartSummary'

export default function Cart(){
  const items = useCartStore(s=>s.items)
  const remove = useCartStore(s=>s.remove)
  const applyPromo = useCartStore(s=>s.applyPromo)
  const totals = useCartStore(s=>s.totals)()
  const shows = useShowsStore(s=>s.list)
  const showsById = Object.fromEntries(shows.map(s=>[s.id,s]))
  const go = useNavigate()
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Корзина</h1>
      {!items.length && <div className="space-y-3"><p>Пока пусто.</p><Link to="/shows" className="btn inline-block bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-700 hover:to-pink-700">Выбрать билет</Link></div>}
      {!!items.length && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
          {items.map((it,idx)=> (
  <CartItem
    key={idx}
    item={it}
    show={showsById[it.showId] || showsById[it.eventId] || null}
    onRemove={()=>remove(idx)}
  />
))}
          </div>
          <div className="space-y-3">
            <CartSummary subtotal={totals.subtotal} discount={totals.discount} total={totals.total} onApplyPromo={async(code)=>{ await applyPromo(code) }}/>
            <button className="btn w-full bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-700 hover:to-pink-700" onClick={()=>go('/checkout')} disabled={!items.length}>Оформить</button>
          </div>
        </div>
      )}
    </section>
  )
}
