import { useMemo } from 'react'
import { formatCurrency } from '../utils/currency'
import { FaInfoCircle } from 'react-icons/fa'

// Преопределенные цвета для разных типов зон
const ZONE_COLORS = {
  'VIP': '#d97706',
  'VIP1': '#d97706',
  'VIP2': '#d97706',
  'FAN': '#ec4899',
  'ФАН': '#ec4899',
  'STANDING': '#ef4444',
  'ТАНЦЕВАЛЬНЫЙ': '#06b6d4',
  'TRIBUNE': '#3b82f6',
  'BALCONY': '#8b5cf6',
  'CHEAP_SEATS': '#10b981',
  'A': '#16a34a',
  'B': '#2563eb',
  'C': '#6366f1',
  'ЛОЖА': '#f59e0b'
}

const ZONE_NAMES = {
  'VIP': 'VIP',
  'VIP1': 'VIP 1',
  'VIP2': 'VIP 2',
  'FAN': 'Фан Зона',
  'ФАН': 'Фан Зона',
  'STANDING': 'Standing',
  'ТАНЦЕВАЛЬНЫЙ': 'Танцевальный Партер',
  'TRIBUNE': 'Tribune',
  'BALCONY': 'Balcony',
  'CHEAP_SEATS': 'Cheap Seats',
  'A': 'Zone A',
  'B': 'Zone B',
  'C': 'Zone C',
  'ЛОЖА': 'Ложа'
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

  // Определяем границы каждой зоны
  const zonesLayout = useMemo(() => {
    return zonesMap.map(zone => {
      const rows = Array.from(zone.rows).sort((a, b) => a - b)
      const cols = Array.from(zone.cols).sort((a, b) => a - b)
      
      // Определяем тип зоны
      const isFan = zone.code.toUpperCase().includes('ФАН') || zone.code.toUpperCase().includes('FAN')
      const isDance = zone.code.toUpperCase().includes('ТАНЦЕВАЛЬНЫЙ') || zone.code.toUpperCase().includes('DANCE')
      const isVip = zone.code.toUpperCase().includes('VIP')
      const isStanding = isFan || isDance || zone.code.toUpperCase().includes('STANDING')
      const isBox = zone.code.toUpperCase().includes('ЛОЖА') || zone.code.toUpperCase().includes('BOX')
      
      // Определяем позицию на схеме на основе номеров рядов и мест
      const avgRow = rows.reduce((a, b) => a + b, 0) / rows.length
      const avgCol = cols.reduce((a, b) => a + b, 0) / cols.length
      
      return {
        ...zone,
        minRow: Math.min(...rows),
        maxRow: Math.max(...rows),
        minCol: Math.min(...cols),
        maxCol: Math.max(...cols),
        rowCount: rows.length,
        colCount: cols.length,
        avgRow,
        avgCol,
        isFan,
        isDance,
        isVip,
        isStanding,
        isBox
      }
    })
  }, [zonesMap])

  // Определяем общие размеры зала
  const venueBounds = useMemo(() => {
    if (zonesLayout.length === 0) return { rows: 0, cols: 0, minRow: 0, minCol: 0, maxRow: 0, maxCol: 0 }
    
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

  // Сортируем зоны для правильного отображения
  const sortedZones = useMemo(() => {
    // Сначала стоячие зоны (ближе к сцене)
    const standing = zonesLayout.filter(z => z.isStanding).sort((a, b) => a.avgRow - b.avgRow)
    // Затем VIP
    const vip = zonesLayout.filter(z => z.isVip).sort((a, b) => a.avgCol - b.avgCol)
    // Затем секции C (ближайшие к сцене сидячие)
    const cSections = zonesLayout.filter(z => z.code.match(/^C/i)).sort((a, b) => {
      const aNum = parseInt(a.code.match(/\d+/)?.[0] || '0')
      const bNum = parseInt(b.code.match(/\d+/)?.[0] || '0')
      return aNum - bNum || a.avgCol - b.avgCol
    })
    // Затем секции A
    const aSections = zonesLayout.filter(z => z.code.match(/^A/i) && !z.isBox).sort((a, b) => {
      const aNum = parseInt(a.code.match(/\d+/)?.[0] || '0')
      const bNum = parseInt(b.code.match(/\d+/)?.[0] || '0')
      return aNum - bNum || a.avgCol - b.avgCol
    })
    // Ложи
    const boxes = zonesLayout.filter(z => z.isBox)
    // Затем секции B (дальние)
    const bSections = zonesLayout.filter(z => z.code.match(/^B/i)).sort((a, b) => {
      const aNum = parseInt(a.code.match(/\d+/)?.[0] || '0')
      const bNum = parseInt(b.code.match(/\d+/)?.[0] || '0')
      return aNum - bNum || a.avgCol - b.avgCol
    })
    // Остальные
    const other = zonesLayout.filter(z => 
      !standing.includes(z) && !vip.includes(z) && !cSections.includes(z) && 
      !aSections.includes(z) && !bSections.includes(z) && !boxes.includes(z)
    )
    
    return { standing, vip, cSections, aSections, boxes, bSections, other }
  }, [zonesLayout])

  // Функция для расчета позиции секции на схеме
  const getSectionPosition = (zone) => {
    if (!venueBounds.rows || !venueBounds.cols) return { top: '50%', left: '50%' }
    
    // Нормализуем позицию (0-100%)
    const rowPercent = ((zone.avgRow - venueBounds.minRow) / venueBounds.rows) * 100
    const colPercent = ((zone.avgCol - venueBounds.minCol) / venueBounds.cols) * 100
    
    return {
      top: `${Math.min(95, Math.max(5, rowPercent))}%`,
      left: `${Math.min(95, Math.max(5, colPercent))}%`
    }
  }

  // Функция для расчета размера секции
  const getSectionSize = (zone) => {
    const rowSpan = zone.rowCount / venueBounds.rows
    const colSpan = zone.colCount / venueBounds.cols
    
    if (zone.isStanding) {
      return { width: '90%', height: '120px', minWidth: '200px' }
    }
    if (zone.isVip) {
      return { width: '45%', height: '80px', minWidth: '180px' }
    }
    if (zone.isBox) {
      return { width: '150px', height: '100px' }
    }
    
    // Для секций A, B, C - размер зависит от количества мест
    const baseSize = Math.max(zone.rowCount, zone.colCount) * 8
    return {
      width: `${Math.max(120, Math.min(200, baseSize))}px`,
      height: `${Math.max(60, Math.min(100, baseSize * 0.6))}px`
    }
  }

  return (
    <div className="space-y-6">
      {/* Сцена */}
      <div className="text-center relative">
        <div className="inline-block px-20 py-6 bg-gradient-to-b from-yellow-600 via-yellow-700 to-yellow-800 border-4 border-yellow-500 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          <div className="relative text-2xl font-black text-white tracking-widest drop-shadow-lg">
            🎤 СЦЕНА 🎤
          </div>
        </div>
        <div className="mt-3 text-xs text-neutral-500 flex items-center justify-center gap-6">
          <span>← Вход 1</span>
          <span>Вход 2 →</span>
        </div>
      </div>

      {/* Схема зала - вид сверху с реальным расположением */}
      <div className="relative bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 rounded-2xl border-2 border-neutral-800 p-8 min-h-[700px]">
        <div className="relative w-full h-full" style={{ minHeight: '600px' }}>
          {/* Фан зона - перед сценой (внизу схемы) */}
          {sortedZones.standing.find(z => z.isFan) && (() => {
            const fanZone = sortedZones.standing.find(z => z.isFan)
            const size = getSectionSize(fanZone)
            return (
              <button
                onClick={() => onZoneSelect(fanZone.code)}
                className="group absolute bottom-4 left-1/2 transform -translate-x-1/2 rounded-2xl border-3 transition-all hover:scale-110 hover:shadow-2xl cursor-pointer z-20"
                style={{
                  ...size,
                  backgroundColor: `${fanZone.color}25`,
                  borderColor: fanZone.color,
                  borderWidth: '3px'
                }}
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-pink-500/40 to-purple-500/40" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
                  <div className="text-lg font-bold text-white mb-1">{fanZone.name}</div>
                  <div className="text-xs text-neutral-300 text-center">
                    {fanZone.availableCount} из {fanZone.totalCount}
                    {fanZone.minPrice > 0 && ` · от ${formatCurrency(fanZone.minPrice)}`}
                  </div>
                </div>
              </button>
            )
          })()}

          {/* Танцевальный партер */}
          {sortedZones.standing.find(z => z.isDance) && (() => {
            const danceZone = sortedZones.standing.find(z => z.isDance)
            const size = getSectionSize(danceZone)
            return (
              <button
                onClick={() => onZoneSelect(danceZone.code)}
                className="group absolute bottom-24 left-1/2 transform -translate-x-1/2 rounded-2xl border-3 transition-all hover:scale-110 hover:shadow-2xl cursor-pointer z-20"
                style={{
                  ...size,
                  backgroundColor: `${danceZone.color}25`,
                  borderColor: danceZone.color,
                  borderWidth: '3px',
                  borderStyle: 'dashed'
                }}
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-cyan-500/40 to-blue-500/40" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
                  <div className="text-base font-bold text-white mb-1">{danceZone.name}</div>
                  <div className="text-xs text-neutral-300 text-center">
                    {danceZone.availableCount} из {danceZone.totalCount}
                    {danceZone.minPrice > 0 && ` · от ${formatCurrency(danceZone.minPrice)}`}
                  </div>
                </div>
              </button>
            )
          })()}

          {/* VIP секции */}
          {sortedZones.vip.map((zone, idx) => {
            const size = getSectionSize(zone)
            const position = idx === 0 
              ? { bottom: '180px', left: '25%', transform: 'translateX(-50%)' }
              : { bottom: '180px', right: '25%', transform: 'translateX(50%)' }
            return (
              <button
                key={zone.code}
                onClick={() => onZoneSelect(zone.code)}
                className="group absolute rounded-xl border-3 transition-all hover:scale-110 hover:shadow-2xl cursor-pointer z-20"
                style={{
                  ...size,
                  ...position,
                  backgroundColor: `${zone.color}30`,
                  borderColor: zone.color,
                  borderWidth: '3px'
                }}
              >
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-orange-500/40 to-yellow-500/40" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-3">
                  <div className="text-sm font-bold text-white">{zone.name}</div>
                  <div className="text-xs text-neutral-300 mt-1">
                    {zone.availableCount}/{zone.totalCount}
                    {zone.minPrice > 0 && ` · ${formatCurrency(zone.minPrice)}`}
                  </div>
                </div>
              </button>
            )
          })}

          {/* Секции C - ближайшие к сцене */}
          {sortedZones.cSections.map((zone, idx) => {
            const size = getSectionSize(zone)
            const position = getSectionPosition(zone)
            // Располагаем секции C полукругом перед VIP
            const angle = (idx / sortedZones.cSections.length) * 180 - 90
            const radius = 150
            const left = 50 + Math.cos(angle * Math.PI / 180) * (radius / 5)
            const bottom = 250 + Math.sin(angle * Math.PI / 180) * (radius / 3)
            
            return (
              <button
                key={zone.code}
                onClick={() => onZoneSelect(zone.code)}
                className="group absolute rounded-lg border-2 transition-all hover:scale-125 hover:shadow-xl cursor-pointer z-10"
                style={{
                  ...size,
                  left: `${left}%`,
                  bottom: `${bottom}px`,
                  backgroundColor: `${zone.color}25`,
                  borderColor: zone.color
                }}
              >
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(135deg, ${zone.color}40, ${zone.color}60)` }}
                />
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-2">
                  <div className="font-bold text-white text-xs">{zone.code}</div>
                  <div className="text-[10px] text-neutral-300 mt-0.5">
                    {zone.totalCount}
                    {zone.minPrice > 0 && ` · ${formatCurrency(zone.minPrice)}`}
                  </div>
                </div>
              </button>
            )
          })}

          {/* Секции A - средний уровень */}
          {sortedZones.aSections.map((zone, idx) => {
            const size = getSectionSize(zone)
            // Располагаем секции A дальше от сцены
            const angle = (idx / sortedZones.aSections.length) * 180 - 90
            const radius = 250
            const left = 50 + Math.cos(angle * Math.PI / 180) * (radius / 5)
            const bottom = 350 + Math.sin(angle * Math.PI / 180) * (radius / 3)
            
            return (
              <button
                key={zone.code}
                onClick={() => onZoneSelect(zone.code)}
                className="group absolute rounded-lg border-2 transition-all hover:scale-125 hover:shadow-xl cursor-pointer z-10"
                style={{
                  ...size,
                  left: `${left}%`,
                  bottom: `${bottom}px`,
                  backgroundColor: `${zone.color}25`,
                  borderColor: zone.color
                }}
              >
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(135deg, ${zone.color}40, ${zone.color}60)` }}
                />
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-2">
                  <div className="font-bold text-white text-xs">{zone.code}</div>
                  <div className="text-[10px] text-neutral-300 mt-0.5">
                    {zone.totalCount}
                    {zone.minPrice > 0 && ` · ${formatCurrency(zone.minPrice)}`}
                  </div>
                </div>
              </button>
            )
          })}

          {/* Ложи */}
          {sortedZones.boxes.map((zone, idx) => {
            const size = getSectionSize(zone)
            return (
              <button
                key={zone.code}
                onClick={() => onZoneSelect(zone.code)}
                className="group absolute rounded-xl border-2 transition-all hover:scale-125 hover:shadow-xl cursor-pointer z-15"
                style={{
                  ...size,
                  left: idx % 2 === 0 ? '30%' : '70%',
                  bottom: '400px',
                  backgroundColor: `${zone.color}30`,
                  borderColor: zone.color
                }}
              >
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(135deg, ${zone.color}50, ${zone.color}70)` }}
                />
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-2">
                  <div className="font-bold text-white text-sm">{zone.name || zone.code}</div>
                  <div className="text-xs text-neutral-300 mt-1">
                    {zone.totalCount}
                    {zone.minPrice > 0 && ` · ${formatCurrency(zone.minPrice)}`}
                  </div>
                </div>
              </button>
            )
          })}

          {/* Секции B - верхний уровень */}
          {sortedZones.bSections.map((zone, idx) => {
            const size = getSectionSize(zone)
            // Располагаем секции B дальше всего от сцены
            const angle = (idx / sortedZones.bSections.length) * 180 - 90
            const radius = 350
            const left = 50 + Math.cos(angle * Math.PI / 180) * (radius / 5)
            const bottom = 450 + Math.sin(angle * Math.PI / 180) * (radius / 3)
            
            return (
              <button
                key={zone.code}
                onClick={() => onZoneSelect(zone.code)}
                className="group absolute rounded-lg border-2 transition-all hover:scale-125 hover:shadow-xl cursor-pointer z-10"
                style={{
                  ...size,
                  left: `${left}%`,
                  bottom: `${bottom}px`,
                  backgroundColor: `${zone.color}25`,
                  borderColor: zone.color
                }}
              >
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(135deg, ${zone.color}40, ${zone.color}60)` }}
                />
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-2">
                  <div className="font-bold text-white text-xs">{zone.code}</div>
                  <div className="text-[10px] text-neutral-300 mt-0.5">
                    {zone.totalCount}
                    {zone.minPrice > 0 && ` · ${formatCurrency(zone.minPrice)}`}
                  </div>
                </div>
              </button>
            )
          })}

          {/* Другие зоны */}
          {sortedZones.other.map((zone, idx) => {
            const size = getSectionSize(zone)
            const position = getSectionPosition(zone)
            return (
              <button
                key={zone.code}
                onClick={() => onZoneSelect(zone.code)}
                className="group absolute rounded-lg border-2 transition-all hover:scale-125 hover:shadow-xl cursor-pointer z-10"
                style={{
                  ...size,
                  ...position,
                  backgroundColor: `${zone.color}25`,
                  borderColor: zone.color
                }}
              >
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(135deg, ${zone.color}40, ${zone.color}60)` }}
                />
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-2">
                  <div className="font-bold text-white text-xs">{zone.name || zone.code}</div>
                  <div className="text-[10px] text-neutral-300 mt-0.5">
                    {zone.totalCount}
                    {zone.minPrice > 0 && ` · ${formatCurrency(zone.minPrice)}`}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {zonesLayout.map(zone => (
            <div
              key={zone.code}
              className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900/50 border border-neutral-800 hover:border-brand-500/50 transition cursor-pointer"
              onClick={() => onZoneSelect(zone.code)}
            >
              <div
                className="w-8 h-8 rounded-lg border-2 flex-shrink-0 flex items-center justify-center font-bold text-sm"
                style={{
                  backgroundColor: `${zone.color}80`,
                  borderColor: zone.color,
                  color: 'white'
                }}
              >
                {zone.code.length > 4 ? zone.code.substring(0, 3) : zone.code}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-neutral-200 text-sm">{zone.name}</div>
                {zone.minPrice > 0 && (
                  <div className="text-xs text-neutral-400">
                    {zone.minPrice === zone.maxPrice
                      ? formatCurrency(zone.minPrice)
                      : `${formatCurrency(zone.minPrice)} - ${formatCurrency(zone.maxPrice)}`
                    }
                  </div>
                )}
                <div className="text-xs text-neutral-500 mt-1">
                  {zone.availableCount} из {zone.totalCount} доступно
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
