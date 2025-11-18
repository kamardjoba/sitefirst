import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { DEFAULT_CURRENCY_LABEL, formatCurrency } from '../utils/currency'

export default function Success(){
  const location = useLocation()
  const raw = typeof window !== 'undefined' ? sessionStorage.getItem('order') : null
  const order = useMemo(() => {
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }, [raw])
  const fallbackOrderId = new URLSearchParams(location.search).get('order')

  if(!order){
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Оплата завершена</h1>
        <div className="card p-4 space-y-3">
          <p>Мы зарегистрировали оплату, но не нашли детали заказа в текущей сессии.</p>
          {fallbackOrderId && (
            <p className="text-sm text-neutral-400">
              Номер вашего заказа: <strong>{fallbackOrderId}</strong>. Сохраните его для обращения в поддержку.
            </p>
          )}
          <Link className="btn w-fit" to="/shows">Вернуться к афише</Link>
        </div>
      </section>
    )
  }

  const orderCurrency = order?.totals?.currency || order?.items?.[0]?.currency || DEFAULT_CURRENCY_LABEL

  const handlePrint = ()=> {
    const w = window.open('', '_blank')
    if(!w) return
    const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Квитанция ${order.orderId}</title>
      <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial; padding:24px; background:#0a0a0a; color:#fafafa;} .card{border:1px solid #333; border-radius:12px; padding:16px;}</style>
      </head><body>
      <h1>Квитанция</h1>
      <p>Номер: <strong>${order.orderId}</strong></p>
      <div class="card">
        <h2>Заказ</h2>
        <ul>
          ${(order.items || []).map(i=>{
            const sessionText = i.session?.dateISO ? `${i.session.dateISO} ${i.session.timeISO || ''}` : ''
            return `<li>${sessionText} · Ряд ${i.seat?.row ?? '—'} Место ${i.seat?.col ?? '—'} — ${formatCurrency(i.price, i.currency || orderCurrency)}</li>`
          }).join('')}
        </ul>
        <p><strong>Итого: ${formatCurrency(order.totals?.total ?? 0, orderCurrency)}</strong></p>
      </div>
      <script>window.print();</script>
      </body></html>`
    w.document.write(html)
    w.document.close()
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Оплата успешна</h1>
      <div className="card p-4 space-y-2">
        <div>Номер квитанции: <strong>{order.orderId}</strong></div>
        <div className="text-sm text-neutral-400">
          Дата: {order.when ? new Date(order.when).toLocaleString('ru-RU') : '—'}
        </div>
        <div className="space-y-1">
          {(order.items || []).map((i,idx)=> (
            <div key={idx}>
              Ряд {i.seat?.row ?? '—'}, место {i.seat?.col ?? '—'} — {formatCurrency(i.price, i.currency || orderCurrency)}
            </div>
          ))}
        </div>
        <div className="font-semibold">Итого: {formatCurrency(order.totals?.total ?? 0, orderCurrency)}</div>
        <div className="flex gap-3">
          <button className="btn bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-700 hover:to-pink-700" onClick={handlePrint}>Скачать PDF</button>
          <Link className="btn" to="/">На главную</Link>
        </div>
      </div>
    </section>
  )
}
