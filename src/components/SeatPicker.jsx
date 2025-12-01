import { useMemo } from 'react'
import { formatCurrency } from '../utils/currency'

export default function SeatPicker({ venue, seats, selected, onToggle }) {
  const rows = Number(venue?.rows || 0)
  const cols = Number(venue?.cols || 0)
  const zones = venue?.zones || {}

  // Словарь занятых: "r-c" -> true
  const busy = new Set(seats.filter(s => s.status && s.status !== 'available')
                           .map(s => `${s.row}-${s.seat}`))

  // Быстрый словарь цен: "r-c" -> price
  const priceByRC = new Map(seats.map(s => [`${s.row}-${s.seat}`, Number(s.price || 0)]))

  // Словарь зон: "r-c" -> zone info
  const zoneByRC = new Map(seats.map(s => [`${s.row}-${s.seat}`, {
    code: s.zone,
    color: s.zoneColor || zones[s.zone]?.color || '#999999',
    name: s.zoneName || zones[s.zone]?.name || s.zone
  }]))

  // выбранные: "r-c"
  const selectedRC = new Set(selected.map(s => `${s.row}-${s.col}`))

  // Группируем зоны для легенды
  const zonesForLegend = useMemo(() => {
    const zoneMap = new Map()
    Object.values(zones).forEach(zone => {
      if (zone.code) {
        zoneMap.set(zone.code, {
          code: zone.code,
          name: zone.name || zone.code,
          color: zone.color || '#999999',
          minPrice: zone.minPrice || 0,
          maxPrice: zone.maxPrice || 0
        })
      }
    })
    // Добавляем зоны из мест, если их нет в zones
    seats.forEach(seat => {
      if (seat.zone && !zoneMap.has(seat.zone)) {
        const price = Number(seat.price || 0)
        zoneMap.set(seat.zone, {
          code: seat.zone,
          name: seat.zoneName || seat.zone,
          color: seat.zoneColor || '#999999',
          minPrice: price,
          maxPrice: price
        })
      }
    })
    return Array.from(zoneMap.values())
  }, [zones, seats])

  const grid = []
  for (let r = 1; r <= rows; r++) {
    const rowCells = []
    for (let c = 1; c <= cols; c++) {
      const key = `${r}-${c}`
      const isBusy = busy.has(key)
      const isSel  = selectedRC.has(key)
      const price  = priceByRC.get(key) ?? 0
      const zoneInfo = zoneByRC.get(key) || { code: '', color: '#999999', name: '' }

      // Определяем стили в зависимости от состояния
      let bgColor = zoneInfo.color
      let borderColor = zoneInfo.color
      let textColor = 'white'
      let opacity = '1'

      if (isBusy) {
        bgColor = '#1f2937'
        borderColor = '#374151'
        textColor = '#6b7280'
        opacity = '0.5'
      } else if (isSel) {
        bgColor = '#ec4899'
        borderColor = '#ec4899'
        textColor = 'white'
        opacity = '1'
      } else {
        opacity = '0.8'
      }

      rowCells.push(
        <button
          key={key}
          type="button"
          className={[
            "w-10 h-10 m-0.5 rounded-md text-sm font-medium flex items-center justify-center border-2 transition-all",
            "hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900",
            isBusy ? "cursor-not-allowed" : "cursor-pointer"
          ].join(' ')}
          style={{
            backgroundColor: isBusy ? bgColor : (isSel ? bgColor : `${bgColor}80`),
            borderColor: borderColor,
            color: textColor,
            opacity: isBusy ? 0.5 : 1
          }}
          disabled={isBusy}
          onClick={() => !isBusy && onToggle({ row: r, col: c, price, zone: zoneInfo.code })}
          aria-label={`Ряд ${r}, место ${c}${zoneInfo.name ? `, ${zoneInfo.name}` : ''}${price ? `, ${formatCurrency(price)}` : ''}`}
          title={`Ряд ${r}, место ${c}${zoneInfo.name ? ` · ${zoneInfo.name}` : ''}${price ? ` · ${formatCurrency(price)}` : ''}`}
        >
          {c}
        </button>
      )
    }
    grid.push(
      <div key={`row-${r}`} className="flex items-center gap-1">
        <div className="w-8 text-xs text-neutral-400 text-right pr-2 font-medium">{r}</div>
        <div className="flex-1 flex items-center justify-center">{rowCells}</div>
        <div className="w-8 text-xs text-neutral-400 text-left pl-2 font-medium">{r}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Сцена */}
      <div className="text-center">
        <div className="inline-block px-8 py-3 bg-gradient-to-b from-neutral-800 to-neutral-900 border-2 border-neutral-700 rounded-lg shadow-lg">
          <div className="text-sm font-semibold text-neutral-300">СЦЕНА</div>
        </div>
      </div>

      {/* Схема зала */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="space-y-1 p-4 bg-neutral-900/50 rounded-xl border border-neutral-800">
            {grid}
          </div>
        </div>
      </div>

      {/* Легенда */}
      <div className="space-y-4">
        <div className="text-sm font-semibold text-neutral-300">Легенда</div>
        
        {/* Статусы мест */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span 
              className="w-5 h-5 rounded border-2 inline-block" 
              style={{ backgroundColor: '#16a34a80', borderColor: '#16a34a' }}
              aria-hidden
            />
            <span className="text-neutral-300">Доступно</span>
          </div>
          <div className="flex items-center gap-2">
            <span 
              className="w-5 h-5 rounded border-2 inline-block bg-neutral-800 border-neutral-600 opacity-50" 
              aria-hidden
            />
            <span className="text-neutral-300">Занято</span>
          </div>
          <div className="flex items-center gap-2">
            <span 
              className="w-5 h-5 rounded border-2 inline-block bg-pink-500 border-pink-500" 
              aria-hidden
            />
            <span className="text-neutral-300">Выбрано</span>
          </div>
        </div>

        {/* Зоны с ценами */}
        {zonesForLegend.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-neutral-300">Зоны и цены</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {zonesForLegend.map(zone => (
                <div 
                  key={zone.code} 
                  className="flex items-center gap-3 p-3 rounded-lg border border-neutral-800 bg-neutral-900/50"
                >
                  <div 
                    className="w-6 h-6 rounded border-2 flex-shrink-0" 
                    style={{ 
                      backgroundColor: `${zone.color}80`, 
                      borderColor: zone.color 
                    }}
                    aria-hidden
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-neutral-200">{zone.name}</div>
                    {zone.minPrice > 0 && (
                      <div className="text-xs text-neutral-400">
                        {zone.minPrice === zone.maxPrice 
                          ? formatCurrency(zone.minPrice)
                          : `${formatCurrency(zone.minPrice)} - ${formatCurrency(zone.maxPrice)}`
                        }
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
