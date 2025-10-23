export default function Success(){
  const raw = sessionStorage.getItem('order')
  if(!raw) return <div>Нет данных заказа.</div>
  const order = JSON.parse(raw)
  const handlePrint = ()=> {
    const w = window.open('', '_blank')
    const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Квитанция ${order.orderId}</title>
      <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial; padding:24px; background:#0a0a0a; color:#fafafa;} .card{border:1px solid #333; border-radius:12px; padding:16px;}</style>
      </head><body>
      <h1>Квитанция</h1>
      <p>Номер: <strong>${order.orderId}</strong></p>
      <div class="card">
        <h2>Заказ</h2>
        <ul>
          ${order.items.map(i=>`<li>${i.session.dateISO} ${i.session.timeISO} · Ряд ${i.seat.row} Место ${i.seat.col} — ${i.price} ₽</li>`).join('')}
        </ul>
        <p><strong>Итого: ${order.totals.total} ₽</strong></p>
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
        <div className="text-sm text-neutral-400">Дата: {new Date(order.when).toLocaleString('ru-RU')}</div>
        <div className="space-y-1">
          {order.items.map((i,idx)=> <div key={idx}>Ряд {i.seat.row}, место {i.seat.col} — {i.price} ₽</div>)}
        </div>
        <div className="font-semibold">Итого: {order.totals.total} ₽</div>
        <div className="flex gap-3">
          <button className="btn bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-700 hover:to-pink-700" onClick={handlePrint}>Скачать PDF</button>
          <a className="btn" href="/">На главную</a>
        </div>
      </div>
    </section>
  )
}
