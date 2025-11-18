import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CheckoutForm from '../components/CheckoutForm'
import { useCartStore } from '../store/cart'
import { useAuth } from '../store/auth'
import { useShowsStore } from '../store/shows'
import { DEFAULT_CURRENCY_LABEL, formatCurrency } from '../utils/currency'

const API = import.meta.env.VITE_API_BASE || ''
const USER_TOKEN_KEY = 'user_token'

function getUserToken() {
  let t = localStorage.getItem(USER_TOKEN_KEY)
  if (!t) {
    // crypto.randomUUID доступен в современных браузерах
    t = (crypto?.randomUUID && crypto.randomUUID()) || String(Math.random()).slice(2)
    localStorage.setItem(USER_TOKEN_KEY, t)
  }
  return t
}

function buildOrderSummary({ items, totals, buyer, promo, apiResponse, shows }) {
  const eventId = items[0]?.eventId || null
  const show = (Array.isArray(shows) ? shows : []).find(
    sh => String(sh.id) === String(eventId)
  )
  const primarySessionId = items[0]?.sessionId || items[0]?.eventId
  const session =
    show?.sessions?.find(s => String(s.id) === String(primarySessionId)) ||
    show?.sessions?.[0] ||
    null

  const currency = apiResponse?.currency || totals?.currency || DEFAULT_CURRENCY_LABEL
  const totalsWithCurrency = { ...totals, currency }

  return {
    orderId:
      apiResponse?.order_id ||
      apiResponse?.id ||
      (crypto?.randomUUID && crypto.randomUUID()) ||
      String(Date.now()),
    eventId,
    showTitle: show?.title || 'Событие',
    venueCity: show?.venueCity || '',
    session,
    buyer,
    promo: promo?.code
      ? {
          code: promo.code,
          discountPercent: promo.discountPercent,
        }
      : null,
    totals: totalsWithCurrency,
    when: new Date().toISOString(),
    items: items.map(it => ({
      seat: it.seat,
      price: Number(it.price || 0),
      currency,
      sessionId: it.sessionId || it.eventId,
      session: session
        ? { dateISO: session.dateISO, timeISO: session.timeISO }
        : null,
    })),
  }
}

export default function Checkout() {
  const navigate = useNavigate()

  const totals = useCartStore(s => s.totals)()
  const items  = useCartStore(s => s.items)
  const promo  = useCartStore(s => s.promo)
  const clear  = useCartStore(s => s.clear)
  const shows  = useShowsStore(s => s.list)

  const { token, user } = useAuth()

  const [form, setForm] = useState({ name: '', email: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // автоподстановка имени/почты из профиля
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name: f.name || user.name || '',
        email: f.email || user.email || ''
      }))
    }
  }, [user])

  const handleSubmit = async (valuesFromForm) => {
    setError('')
    setBusy(true)
    try {
      const user_token = getUserToken()

      // один заказ = один event
      const eventId = items[0]?.eventId
      if (!eventId) {
        setBusy(false)
        return alert('Корзина пуста')
      }

      const seat_ids = items.map(i => i.seatId).filter(Boolean)
      if (!seat_ids.length) {
        setBusy(false)
        return alert('Нет выбранных мест')
      }

      const payload = {
        event_id: eventId,
        seat_ids,
        user_token,
        buyer: { name: valuesFromForm.name, email: valuesFromForm.email },
        promo_code: promo?.code || null
      }

      const res = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'order_failed')
      }

      const summary = buildOrderSummary({
        items,
        totals,
        buyer: valuesFromForm,
        promo,
        apiResponse: data,
        shows,
      })
      sessionStorage.setItem('order', JSON.stringify(summary))

      clear()
      // если бэк возвращает order_id — покажем на success
      if (data.order_id) {
        navigate(`/success?order=${encodeURIComponent(data.order_id)}`)
      } else {
        navigate('/success')
      }
    } catch (e) {
      setError(e.message || 'Ошибка оформления заказа')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Оформление</h1>

      <div className="card p-4">
        <CheckoutForm
          initialValues={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          disabled={busy}
        />
        {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
      </div>

      <div className="text-neutral-400 text-sm">
        Итого к оплате: {formatCurrency(totals.total, totals.currency)}
      </div>

      <div className="mt-2 text-xs text-neutral-500">
        Нажимая «Оплатить», вы соглашаетесь с условиями оферты.
      </div>
    </section>
  )
}