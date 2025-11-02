import { useEffect, useState } from 'react'
import { useAuth } from '../store/auth'

export default function Profile(){
  const { token, user, me } = useAuth()
  const [orders, setOrders] = useState([])

  useEffect(()=>{
    (async ()=>{
      if(!user) await me()
      if(token){
        const res = await fetch((import.meta.env.VITE_API_BASE||'') + '/api/my/orders', {
          headers:{ Authorization:`Bearer ${token}` }
        })
        if(res.ok){ setOrders(await res.json()) }
      }
    })()
  }, [token])

  if(!token) return <div className="p-4">Войдите в аккаунт</div>

  return (
    <section className="space-y-6">
      <div className="card p-4">
        <h1 className="text-2xl font-bold">Профиль</h1>
        <div className="text-neutral-300">{user?.email}</div>
      </div>

      <div className="card p-4">
        <h2 className="text-xl font-semibold">Мои заказы</h2>
        {!orders.length ? (
          <div className="text-neutral-400">Пока нет заказов</div>
        ) : (
          <div className="space-y-2">
            {orders.map(o=>(
              <div key={o.id} className="border border-neutral-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{o.title || 'Событие'}</div>
                  <div className="text-sm text-neutral-400">
                    {o.city ? `${o.city} · ` : ''}{o.venueName || ''} · {new Date(o.startsAt).toLocaleString('ru-RU')}
                  </div>
                  <div className="text-sm text-neutral-400">{new Date(o.created_at).toLocaleString('ru-RU')}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{o.total} {o.currency || 'PLN'}</div>
                  <div className="text-xs uppercase text-neutral-400">{o.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}