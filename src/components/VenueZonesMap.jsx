import { useMemo } from 'react'
import { formatCurrency } from '../utils/currency'
import { FaInfoCircle } from 'react-icons/fa'

// Преопределенные цвета для разных типов зон
const ZONE_COLORS = {
  'VIP': '#d97706',
  'GOLDEN_CIRCLE': '#fbbf24',
  'STANDING': '#ef4444',
  'TRIBUNE': '#3b82f6',
  'BALCONY': '#8b5cf6',
  'CHEAP_SEATS': '#10b981',
  'A': '#16a34a',
  'B': '#2563eb',
  'C': '#6366f1'
}

const ZONE_NAMES = {
  'VIP': 'VIP',
  'GOLDEN_CIRCLE': 'Golden Circle',
  'STANDING': 'Standing',
  'TRIBUNE': 'Tribune',
  'BALCONY': 'Balcony',
  'CHEAP_SEATS': 'Cheap Seats',
  'A': 'Zone A',
  'B': 'Zone B',
  'C': 'Zone C'
}

export default function VenueZonesMap({ seats, zones, onZoneSelect }) {
  // Группируем места по зонам
  const zonesMap = useMemo(() => {
    const map = new Map()
    
    seats.forEach(seat => {
      const zoneCode = seat.zone
      if (!zoneCode) return
      
      if (!map.has(zoneCode)) {
        const zoneInfo = zones.find(z => z.code === zoneCode) || {}
        map.set(zoneCode, {
          code: zoneCode,
          name: zoneInfo.name || ZONE_NAMES[zoneCode] || zoneCode,
          color: zoneInfo.color || ZONE_COLORS[zoneCode] || '#999999',
          minPrice: zoneInfo.minPrice || 0,
          maxPrice: zoneInfo.maxPrice || 0,
          seats: [],
          availableCount: 0,
          totalCount: 0,
          rows: new Set(),
          cols: new Set()
        })
      }
      
      const zone = map.get(zoneCode)
      zone.seats.push(seat)
      zone.totalCount++
      zone.rows.add(seat.row)
      zone.cols.add(seat.seat)
      
      if (seat.status === 'available') {
        zone.availableCount++
      }
    })
    
    return Array.from(map.values())
  }, [seats, zones])

  // Определяем границы каждой зоны для визуализации
  const zonesLayout = useMemo(() => {
    return zonesMap.map(zone => {
      const rows = Array.from(zone.rows).sort((a, b) => a - b)
      const cols = Array.from(zone.cols).sort((a, b) => a - b)
      
      return {
        ...zone,
        minRow: Math.min(...rows),
        maxRow: Math.max(...rows),
        minCol: Math.min(...cols),
        maxCol: Math.max(...cols),
        rowCount: rows.length,
        colCount: cols.length
      }
    })
  }, [zonesMap])

  // Определяем общие размеры зала
  const venueBounds = useMemo(() => {
    if (zonesLayout.length === 0) return { rows: 0, cols: 0 }
    
    const allRows = zonesLayout.flatMap(z => [z.minRow, z.maxRow])
    const allCols = zonesLayout.flatMap(z => [z.minCol, z.maxCol])
    
    return {
      minRow: Math.min(...allRows),
      maxRow: Math.max(...allRows),
      minCol: Math.min(...allCols),
      maxCol: Math.max(...allCols),
      rows: Math.max(...allRows) - Math.min(...allRows) + 1,
      cols: Math.max(...allCols) - Math.min(...allCols) + 1
    }
  }, [zonesLayout])

  // Проверяем, есть ли стоячие зоны
  const standingZones = zonesLayout.filter(z => 
    z.code.toUpperCase().includes('STANDING') || 
    z.seats.some(s => s.seatType === 'standing')
  )

  // Сидячие зоны
  const seatedZones = zonesLayout.filter(z => !standingZones.includes(z))

  return (
    <div className="space-y-6">
      {/* Сцена */}
      <div className="text-center relative">
        <div className="inline-block px-16 py-5 bg-gradient-to-b from-yellow-600 via-yellow-700 to-yellow-800 border-4 border-yellow-500 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          <div className="relative text-xl font-black text-white tracking-widest drop-shadow-lg">
            🎤 STAGE 🎤
          </div>
        </div>
        <div className="mt-3 text-xs text-neutral-500 flex items-center justify-center gap-4">
          <span>← Вход 1</span>
          <span>Вход 2 →</span>
        </div>
      </div>

      {/* Схема зон */}
      <div className="relative bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 rounded-2xl border-2 border-neutral-800 p-8 min-h-[500px]">
        {/* Сидячие зоны */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {seatedZones.map(zone => (
            <button
              key={zone.code}
              onClick={() => onZoneSelect(zone.code)}
              className="group relative p-6 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-2xl cursor-pointer text-left"
              style={{
                backgroundColor: `${zone.color}15`,
                borderColor: zone.color,
                borderWidth: '2px'
              }}
            >
              {/* Градиентный overlay при hover */}
              <div 
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `linear-gradient(135deg, ${zone.color}20, ${zone.color}40)`
                }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg border-2"
                    style={{
                      backgroundColor: zone.color,
                      borderColor: zone.color,
                      color: 'white'
                    }}
                  >
                    {zone.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-brand-300 transition">
                      {zone.name}
                    </h3>
                    <div className="text-xs text-neutral-400">
                      {zone.rowCount} рядов · {zone.colCount} мест в ряду
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {zone.minPrice > 0 && (
                    <div className="text-sm">
                      <span className="text-neutral-400">Цена: </span>
                      <span className="font-bold text-brand-400">
                        {zone.minPrice === zone.maxPrice
                          ? formatCurrency(zone.minPrice)
                          : `${formatCurrency(zone.minPrice)} - ${formatCurrency(zone.maxPrice)}`
                        }
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Доступно: {zone.availableCount} из {zone.totalCount}</span>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-brand-400 font-medium group-hover:text-brand-300 transition">
                  Нажмите для выбора мест →
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Стоячие зоны */}
        {standingZones.length > 0 && (
          <div className="space-y-4 pt-6 border-t-2 border-neutral-800">
            <h3 className="text-lg font-bold text-neutral-300 mb-4">Стоячие зоны</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {standingZones.map(zone => (
                <button
                  key={zone.code}
                  onClick={() => onZoneSelect(zone.code)}
                  className="group relative p-6 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-2xl cursor-pointer text-left"
                  style={{
                    backgroundColor: `${zone.color}20`,
                    borderColor: zone.color,
                    borderWidth: '2px',
                    borderStyle: 'dashed'
                  }}
                >
                  <div 
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: `linear-gradient(135deg, ${zone.color}30, ${zone.color}50)`
                    }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg border-2"
                        style={{
                          backgroundColor: zone.color,
                          borderColor: zone.color,
                          color: 'white'
                        }}
                      >
                        {zone.code}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-brand-300 transition">
                          {zone.name}
                        </h3>
                        <div className="text-xs text-neutral-400">
                          Стоячие места
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {zone.minPrice > 0 && (
                        <div className="text-sm">
                          <span className="text-neutral-400">Цена: </span>
                          <span className="font-bold text-brand-400">
                            {zone.minPrice === zone.maxPrice
                              ? formatCurrency(zone.minPrice)
                              : `${formatCurrency(zone.minPrice)} - ${formatCurrency(zone.maxPrice)}`
                            }
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span>Доступно: {zone.availableCount} из {zone.totalCount}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-xs text-brand-400 font-medium group-hover:text-brand-300 transition">
                      Нажмите для выбора →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Кнопка "Показать все места" */}
        <div className="mt-8 pt-6 border-t-2 border-neutral-800">
          <button
            onClick={() => onZoneSelect(null)}
            className="w-full p-6 rounded-xl border-2 border-brand-500/50 bg-brand-500/10 hover:bg-brand-500/20 transition-all group"
          >
            <div className="flex items-center justify-center gap-3">
              <FaInfoCircle className="text-brand-400 text-xl" />
              <span className="font-bold text-lg text-white group-hover:text-brand-300 transition">
                Показать все места сразу
              </span>
            </div>
            <p className="text-sm text-neutral-400 mt-2">
              Открыть детальную схему со всеми зонами одновременно
            </p>
          </button>
        </div>
      </div>

      {/* Легенда */}
      <div className="card p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <FaInfoCircle className="text-brand-400" />
          Легенда зон
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {zonesLayout.map(zone => (
            <div
              key={zone.code}
              className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900/50 border border-neutral-800"
            >
              <div
                className="w-8 h-8 rounded-lg border-2 flex-shrink-0 flex items-center justify-center font-bold text-sm"
                style={{
                  backgroundColor: `${zone.color}80`,
                  borderColor: zone.color,
                  color: 'white'
                }}
              >
                {zone.code}
              </div>
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
    </div>
  )
}

