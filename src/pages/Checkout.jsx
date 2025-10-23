import { useNavigate } from 'react-router-dom'
import CheckoutForm from '../components/CheckoutForm'
import { useCartStore } from '../store/cart'
import { v4 as uuidv4 } from 'uuid'

export default function Checkout(){
  const totals = useCartStore(s=>s.totals)()
  const items = useCartStore(s=>s.items)
  const clear = useCartStore(s=>s.clear)
  const go = useNavigate()
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Оформление</h1>
      <div className="card p-4">
        <CheckoutForm onSubmit={(form)=>{
          const orderId = uuidv4()
          const payload = { orderId, form, items, totals, when: new Date().toISOString() }
          sessionStorage.setItem('order', JSON.stringify(payload))
          clear()
          go('/success')
        }}/>
      </div>
      <div className="text-neutral-400 text-sm">Итого к оплате: {totals.total} ₽</div>
    </section>
  )
}
