const ITEMS = [
  { state: 'available', bg: 'bg-emerald-500', border: 'border-emerald-600', label: 'Доступно' },
  { state: 'selected', bg: 'bg-brand-500', border: 'border-brand-600', label: 'Выбрано' },
  { state: 'occupied', bg: 'bg-red-400', border: 'border-red-500', label: 'Занято' },
  { state: 'premium', bg: 'bg-amber-400', border: 'border-amber-500', label: 'Premium' },
  { state: 'unavailable', bg: 'bg-neutral-600', border: 'border-neutral-500', label: 'Недоступно' }
]

export default function Legend() {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-neutral-300 mb-3">Обозначения</h3>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {ITEMS.map(({ state, bg, border, label }) => (
          <div key={state} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg border-2 ${bg} ${border}`} />
            <span className="text-sm text-neutral-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
