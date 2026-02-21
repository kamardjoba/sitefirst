import { useMemo } from 'react'
import { formatCurrency } from '../utils/currency'
import { FaChevronRight } from 'react-icons/fa'

const ZONE_COLORS = {
  VIP: '#d97706',
  A: '#16a34a',
  B: '#2563eb',
  C: '#6366f1',
  FAN: '#ec4899',
  STANDING: '#ef4444',
  BALCONY: '#8b5cf6',
  ЛОЖА: '#f59e0b'
}

const ZONE_NAMES = {
  VIP: 'VIP',
  A: 'Сектор A',
  B: 'Сектор B',
  C: 'Сектор C',
  FAN: 'Фан-зона',
  STANDING: 'Партер',
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
    return Array.from(map.values())
      .map(z => ({
        ...z,
        minRow: Math.min(...z.rows),
        maxRow: Math.max(...z.rows)
      }))
      .sort((a, b) => a.minRow - b.minRow)
  }, [seats, zones])

  if (!zonesWithLayout.length) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 text-center text-neutral-400">
        Нет данных о секторах зала
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {venueName && (
        <p className="text-center text-neutral-400 text-sm">{venueName}</p>
      )}

      {/* Визуальная схема зала: сцена + сектора как на билетных сайтах */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 overflow-hidden">
        {/* Сцена */}
        <div className="bg-gradient-to-b from-amber-950/80 to-neutral-900 border-b-2 border-amber-600/40 py-5 px-4 text-center">
          <span className="text-lg font-bold text-amber-200/90 tracking-widest">СЦЕНА</span>
        </div>

        {/* Сектора — карточки как на Eventim/Ticketmaster */}
        <div className="p-4 md:p-6 space-y-3">
          {zonesWithLayout.map(zone => (
            <button
              key={zone.code}
              type="button"
              onClick={() => onZoneSelect(zone.code)}
              className="w-full flex items-center justify-between gap-4 p-4 rounded-xl border-2 transition-all text-left hover:border-opacity-100 hover:bg-white/[0.02] group"
              style={{
                borderColor: `${zone.color}60`,
                backgroundColor: `${zone.color}08`
              }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-lg font-bold border-2"
                  style={{
                    backgroundColor: `${zone.color}20`,
                    borderColor: zone.color,
                    color: zone.color
                  }}
                >
                  {zone.code}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-white truncate">{zone.name}</div>
                  <div className="text-sm text-neutral-400">
                    Ряды {zone.minRow}–{zone.maxRow} · {zone.totalCount} мест
                    {zone.availableCount < zone.totalCount && (
                      <span className="text-emerald-400/90"> · свободно {zone.availableCount}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {(zone.minPrice > 0 || zone.maxPrice > 0) && (
                  <span className="font-bold text-white" style={{ color: zone.color }}>
                    {zone.minPrice === zone.maxPrice
                      ? formatCurrency(zone.minPrice)
                      : `${formatCurrency(zone.minPrice)} – ${formatCurrency(zone.maxPrice)}`}
                  </span>
                )}
                <span
                  className="p-2 rounded-lg transition-transform group-hover:translate-x-1"
                  style={{ backgroundColor: `${zone.color}25`, color: zone.color }}
                >
                  <FaChevronRight className="text-sm" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Показать все места */}
      <button
        type="button"
        onClick={() => onZoneSelect(null)}
        className="w-full py-4 rounded-xl border-2 border-neutral-600 bg-neutral-800/50 hover:bg-neutral-800 text-neutral-200 font-medium transition-all"
      >
        Показать все сектора и места
      </button>
    </div>
  )
}
