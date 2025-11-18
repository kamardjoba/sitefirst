import { formatCurrency } from '../utils/currency'

export default function CartSummary({ subtotal, discount, total, currency, onApplyPromo }){
  let promoCodeRef = null
  return (
    <div className="card p-4 space-y-3">
      <div className="flex gap-2">
        <input ref={r=>promoCodeRef=r} className="input" placeholder="Промокод" aria-label="Промокод"/>
        <button className="btn bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-700 hover:to-pink-700" onClick={()=> onApplyPromo(promoCodeRef?.value || '')}>Применить</button>
      </div>
      <div className="text-sm text-neutral-400">Скидка: {formatCurrency(discount, currency)}</div>
      <div className="text-lg font-semibold">Итого: {formatCurrency(total, currency)}</div>
    </div>
  )
}
