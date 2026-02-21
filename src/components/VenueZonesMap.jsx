import { useMemo } from 'react'
import { formatCurrency } from '../utils/currency'

const ZONE_COLORS = {
  VIP: '#d97706',
  VIP1: '#d97706',
  VIP2: '#d97706',
  A: '#16a34a',
  B: '#2563eb',
  C: '#6366f1',
  FAN: '#ec4899',
  STANDING: '#ef4444',
  ТАНЦЕВАЛЬНЫЙ: '#3b82f6',
  BALCONY: '#8b5cf6',
  ЛОЖА: '#f59e0b'
}

const ZONE_NAMES = {
  VIP: 'VIP',
  A: 'Зона A',
  B: 'Зона B',
  C: 'Зона C',
  FAN: 'Фан-зона',
  STANDING: 'Партер',
  ТАНЦЕВАЛЬНЫЙ: 'Танцевальный партер',
  BALCONY: 'Балкон',
  ЛОЖА: 'Ложа'
}

export default function VenueZonesMap({ seats, zones, onZoneSelect, venueName }) {
  const zonesWithLayout = useMemo(() => {
    const map = new Map()

    seats.forEach(seat => {
      const code = seat.zone
      if (!code) return

      if (!map.has(code)) {
        const info = zones.find(z => z.code === code) || {}
        map.set(code, {
          code,
          name: info.name || ZONE_NAMES[code] || code,
          color: info.color || ZONE_COLORS[code] || '#6b7280',
          minPrice: info.minPrice ?? 0,
          maxPrice: info.maxPrice ?? 0,
          seats: [],
          rows: new Set(),
          availableCount: 0,
          totalCount: 0
        })
      }

      const z = map.get(code)
      z.seats.push(seat)
      z.rows.add(seat.row)
      z.totalCount++
      if (seat.status === 'available') z.availableCount++
    })

    return Array.from(map.values()).map(z => ({
      ...z,
      minRow: Math.min(...z.rows),
      maxRow: Math.max(...z.rows),
      rowCount: z.rows.size
    })).sort((a, b) => a.minRow - b.minRow)
  }, [seats, zones])

  if (!zonesWithLayout.length) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 text-center text-neutral-400">
        Нет данных о зонах зала
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {/* Заголовок и название площадки */}
      <div className="mb-6 text-center">
        {venueName && (
          <p className="text-neutral-400 text-sm mb-1">{venueName}</p>
        )}
        <p className="text-neutral-500 text-xs">Выберите зону — затем откроется схема мест</p>
      </div>

      {/* Сцена — во всю ширину */}
      <div className="relative mb-2">
        <div
          className="w-full py-6 rounded-t-2xl border-2 border-neutral-600 bg-gradient-to-b from-amber-950/80 via-neutral-900 to-neutral-950 shadow-inner"
          style={{
            borderBottom: '4px solid rgba(251, 191, 36, 0.5)',
            boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3)'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-2xl md:text-3xl font-black text-white/90 tracking-[0.3em] drop-shadow-lg">
              СЦЕНА
            </span>
          </div>
          <div className="flex justify-between px-6 pt-2 text-[10px] text-neutral-500 uppercase tracking-wider">
            <span>Вход</span>
            <span>Вход</span>
          </div>
        </div>
      </div>

      {/* Зоны зала — блоки по порядку рядов (ближе к сцене = выше по экрану) */}
      <div className="rounded-b-2xl border-2 border-t-0 border-neutral-800 bg-neutral-950/80 overflow-hidden">
        <div className="divide-y divide-neutral-800/80">
          {zonesWithLayout.map((zone, index) => (
            <button
              key={zone.code}
              type="button"
              onClick={() => onZoneSelect(zone.code)}
              className="w-full text-left p-6 md:p-8 transition-all hover:bg-white/[0.03] active:scale-[0.99] group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              style={{
                borderLeft: `4px solid ${zone.color}`,
                backgroundColor: `${zone.color}08`
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-xl font-bold border-2"
                  style={{
                    backgroundColor: `${zone.color}20`,
                    borderColor: zone.color,
                    color: zone.color
                  }}
                >
                  {zone.code}
                </div>
                <div>
                  <div className="text-lg font-bold text-white group-hover:text-white">
                    {zone.name}
                  </div>
                  <div className="text-sm text-neutral-400 mt-0.5">
                    Ряды {zone.minRow}–{zone.maxRow} · {zone.totalCount} мест
                    {zone.availableCount < zone.totalCount && (
                      <span className="text-amber-400/90"> · свободно {zone.availableCount}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6">
                {(zone.minPrice > 0 || zone.maxPrice > 0) && (
                  <div className="text-right">
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">Цена</div>
                    <div className="text-lg font-bold" style={{ color: zone.color }}>
                      {zone.minPrice === zone.maxPrice
                        ? formatCurrency(zone.minPrice)
                        : `${formatCurrency(zone.minPrice)} – ${formatCurrency(zone.maxPrice)}`}
                    </div>
                  </div>
                )}
                <div
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all group-hover:scale-105"
                  style={{
                    backgroundColor: `${zone.color}25`,
                    color: zone.color,
                    border: `1px solid ${zone.color}50`
                  }}
                >
                  Выбрать места →
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Кнопка «Все места» */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => onZoneSelect(null)}
          className="w-full p-5 rounded-xl border-2 border-brand-500/50 bg-brand-500/10 hover:bg-brand-500/20 text-white font-medium transition-all flex items-center justify-center gap-3"
        >
          <span>Показать все зоны и места сразу</span>
        </button>
      </div>

      {/* Легенда */}
      <div className="mt-8 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          Зоны зала
        </div>
        <div className="flex flex-wrap gap-3">
          {zonesWithLayout.map(z => (
            <div
              key={z.code}
              className="flex items-center gap-2"
            >
              <div
                className="w-4 h-4 rounded border-2"
                style={{ backgroundColor: `${z.color}60`, borderColor: z.color }}
              />
              <span className="text-sm text-neutral-300">{z.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
