const ITEMS = [
  { state: 'available', bg: 'bg-emerald-500', border: 'border-emerald-600', label: 'Доступно' },
  { state: 'selected', bg: 'bg-blue-500', border: 'border-blue-600', label: 'Выбрано' },
  { state: 'occupied', bg: 'bg-red-400', border: 'border-red-500', label: 'Занято' },
  { state: 'premium', bg: 'bg-amber-400', border: 'border-amber-500', label: 'Premium' },
  { state: 'unavailable', bg: 'bg-slate-300', border: 'border-slate-400', label: 'Недоступно' }
]

export default function Legend() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Обозначения</h3>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {ITEMS.map(({ state, bg, border, label }) => (
          <div key={state} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg border-2 ${bg} ${border}`} />
            <span className="text-sm text-slate-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
