// Минимальный устойчивый пикер, совместимый с SeatSelect
export default function SeatPicker({ venue, seats, selected, onToggle }) {
  const rows = Number(venue?.rows || 0)
  const cols = Number(venue?.cols || 0)
  const zones = venue?.zones || {}   // <= защита

  // Словарь занятых: "r-c" -> true
  const busy = new Set(seats.filter(s => s.status && s.status !== 'available')
                           .map(s => `${s.row}-${s.seat}`))

  // Быстрый словарь цен: "r-c" -> price
  const priceByRC = new Map(seats.map(s => [`${s.row}-${s.seat}`, Number(s.price || 0)]))

  // выбранные: "r-c"
  const selectedRC = new Set(selected.map(s => `${s.row}-${s.col}`))

  const grid = []
  for (let r = 1; r <= rows; r++) {
    const rowCells = []
    for (let c = 1; c <= cols; c++) {
      const key = `${r}-${c}`
      const isBusy = busy.has(key)
      const isSel  = selectedRC.has(key)
      const price  = priceByRC.get(key) ?? 0

      rowCells.push(
        <button
          key={key}
          type="button"
          className={[
            "w-7 h-7 m-0.5 rounded text-xs flex items-center justify-center border",
            isBusy ? "bg-neutral-800 border-neutral-700 text-neutral-500 cursor-not-allowed"
                   : isSel ? "bg-pink-600 border-pink-500 text-white"
                           : "bg-neutral-900 border-neutral-700 hover:bg-neutral-800"
          ].join(' ')}
          disabled={isBusy}
          onClick={() => onToggle({ row: r, col: c, price })}
          aria-label={`Ряд ${r}, место ${c}`}
          title={`Ряд ${r}, место ${c}${price ? ` · ${price}` : ''}`}
        >
          {c}
        </button>
      )
    }
    grid.push(
      <div key={`row-${r}`} className="flex items-center">{rowCells}</div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="overflow-auto p-2 border border-neutral-800 rounded-xl">
        {grid}
      </div>

      {/* Простейшая легенда зон: если zones пуст — ничего страшного */}
      {!!Object.keys(zones).length && (
        <div className="text-xs text-neutral-400">
          Зоны: {Object.values(zones).map(z => z.name).join(', ')}
        </div>
      )}
    </div>
  )
}