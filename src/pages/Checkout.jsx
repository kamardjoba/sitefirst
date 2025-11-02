import { useNavigate } from 'react-router-dom'
import CheckoutForm from '../components/CheckoutForm'
import { useCartStore } from '../store/cart'
import { useAuth } from '../store/auth'

const USER_TOKEN_KEY = 'user_token'
function getUserToken(){
  let t = localStorage.getItem(USER_TOKEN_KEY)
  if(!t){ t = crypto.randomUUID(); localStorage.setItem(USER_TOKEN_KEY, t) }
  return t
}

export default function Checkout(){
  const totals = useCartStore(s=>s.totals)()
  const items  = useCartStore(s=>s.items)
  const promo  = useCartStore(s=>s.promo)
  const clear  = useCartStore(s=>s.clear)
  const go = useNavigate()

  const { token, user } = useAuth()

useEffect(()=>{
  if(user){
    setForm(f => ({
      ...f,
      name: f.name || user.name || '',
      email: f.email || user.email || ''
    }))
  }
}, [user])



  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Оформление</h1>
      <div className="card p-4">
        <CheckoutForm onSubmit={async (form)=>{
          const API = (import.meta.env.VITE_API_BASE||'')
          const user_token = getUserToken()

          // один заказ = один event
          const eventId = items[0]?.eventId
          if(!eventId){ alert('Корзина пуста'); return }

          const seat_ids = items.map(i=> i.seatId).filter(Boolean)
          if(!seat_ids.length){ alert('Нет выбранных мест'); return }

          const payload = {
            event_id: eventId,
            seat_ids,
            user_token,
            buyer: { name: form.name, email: form.email },
            promo_code: promo?.code || null
          }

          const res = await fetch(`${API}/api/orders`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(payload)
          })

          if(res.ok){
            clear()
            go('/success')
          } else {
            const err = await res.json().catch(()=>({error:'order_failed'}))
            alert('Ошибка оформления: ' + (err.error || 'order_failed'))
          }
        }}/>
      </div>
      <div className="text-neutral-400 text-sm">Итого к оплате: {totals.total} ₽</div>
    </section>
  )
}