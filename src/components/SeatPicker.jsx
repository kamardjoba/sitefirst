import { useMemo, useState, useRef, useEffect } from 'react'
import { formatCurrency } from '../utils/currency'
import { FaSearchPlus, FaSearchMinus, FaArrowsAlt, FaInfoCircle } from 'react-icons/fa'

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

export default function SeatPicker({ venue, seats, selected, onToggle }) {
  const rows = Number(venue?.rows || 0)
  const cols = Number(venue?.cols || 0)
  const zones = venue?.zones || {}
  const containerRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [hoveredSeat, setHoveredSeat] = useState(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  // Фильтры
  const [priceFilter, setPriceFilter] = useState(null)
  const [zoneFilter, setZoneFilter] = useState(null)
  const [availabilityFilter, setAvailabilityFilter] = useState('all') // all, available, occupied
  const [bestViewFilter, setBestViewFilter] = useState(false)

  // Словарь занятых: "r-c" -> true
  const busy = new Set(seats.filter(s => s.status && s.status !== 'available')
                           .map(s => `${s.row}-${s.seat}`))

  // Быстрый словарь цен: "r-c" -> price
  const priceByRC = new Map(seats.map(s => [`${s.row}-${s.seat}`, Number(s.price || 0)]))

  // Словарь зон: "r-c" -> zone info
  const zoneByRC = new Map(seats.map(s => [`${s.row}-${s.seat}`, {
    code: s.zone,
    color: s.zoneColor || zones[s.zone]?.color || ZONE_COLORS[s.zone] || '#999999',
    name: s.zoneName || zones[s.zone]?.name || ZONE_NAMES[s.zone] || s.zone,
    type: s.seatType || 'seat' // seat, standing, restricted
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
          name: zone.name || ZONE_NAMES[zone.code] || zone.code,
          color: zone.color || ZONE_COLORS[zone.code] || '#999999',
          minPrice: zone.minPrice || 0,
          maxPrice: zone.maxPrice || 0
        })
      }
    })
    seats.forEach(seat => {
      if (seat.zone && !zoneMap.has(seat.zone)) {
        const price = Number(seat.price || 0)
        zoneMap.set(seat.zone, {
          code: seat.zone,
          name: seat.zoneName || ZONE_NAMES[seat.zone] || seat.zone,
          color: seat.zoneColor || ZONE_COLORS[seat.zone] || '#999999',
          minPrice: price,
          maxPrice: price
        })
      }
    })
    return Array.from(zoneMap.values())
  }, [zones, seats])

  // Фильтрация мест
  const filteredSeats = useMemo(() => {
    return seats.filter(seat => {
      const key = `${seat.row}-${seat.seat}`
      const price = priceByRC.get(key) || 0
      const zoneInfo = zoneByRC.get(key)
      
      if (priceFilter && price > priceFilter) return false
      if (zoneFilter && zoneInfo?.code !== zoneFilter) return false
      if (availabilityFilter === 'available' && busy.has(key)) return false
      if (availabilityFilter === 'occupied' && !busy.has(key)) return false
      if (bestViewFilter) {
        // Лучший вид - первые ряды (1-5) и центральные места
        const isCenter = seat.seat > cols * 0.3 && seat.seat < cols * 0.7
        if (seat.row > 5 || !isCenter) return false
      }
      return true
    })
  }, [seats, priceFilter, zoneFilter, availabilityFilter, bestViewFilter, busy, priceByRC, zoneByRC, cols])

  // Обработка зума
  const handleZoom = (delta) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)))
  }

  // Обработка панорамирования
  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isPanning, panStart])

  // Группировка мест по зонам для стоячих зон
  const standingZones = useMemo(() => {
    const standing = new Map()
    seats.forEach(seat => {
      const zoneInfo = zoneByRC.get(`${seat.row}-${seat.seat}`)
      if (zoneInfo?.type === 'standing' || seat.zone?.toUpperCase().includes('STANDING')) {
        if (!standing.has(seat.zone)) {
          standing.set(seat.zone, [])
        }
        standing.get(seat.zone).push(seat)
      }
    })
    return standing
  }, [seats, zoneByRC])

  // Построение сетки мест
  const grid = []
  for (let r = 1; r <= rows; r++) {
    const rowCells = []
    for (let c = 1; c <= cols; c++) {
      const key = `${r}-${c}`
      const seat = seats.find(s => s.row === r && s.seat === c)
      if (!seat && filteredSeats.length > 0) continue // Пропускаем если место не в отфильтрованных
      
      const isBusy = busy.has(key)
      const isSel = selectedRC.has(key)
      const price = priceByRC.get(key) ?? 0
      const zoneInfo = zoneByRC.get(key) || { code: '', color: '#999999', name: '', type: 'seat' }
      const isFiltered = filteredSeats.length === 0 || filteredSeats.some(s => s.row === r && s.seat === c)

      if (!isFiltered) {
        rowCells.push(<div key={key} className="w-10 h-10 m-1" />)
        continue
      }

      // Определяем стили
      let bgColor = zoneInfo.color
      let borderColor = zoneInfo.color
      let textColor = 'white'
      let opacity = 0.7

      if (isBusy) {
        bgColor = '#1f2937'
        borderColor = '#374151'
        textColor = '#6b7280'
        opacity = 0.3
      } else if (isSel) {
        bgColor = '#ec4899'
        borderColor = '#ec4899'
        textColor = 'white'
        opacity = 1
      } else {
        opacity = 0.8
      }

      // Ограниченный обзор
      const isRestricted = zoneInfo.type === 'restricted' || seat?.restricted

      rowCells.push(
        <button
          key={key}
          type="button"
          className={[
            "w-10 h-10 m-1 rounded-full text-xs font-semibold flex items-center justify-center border-2 transition-all relative",
            "hover:scale-150 hover:shadow-2xl hover:z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900",
            isBusy ? "cursor-not-allowed opacity-40" : "cursor-pointer",
            isRestricted ? "opacity-70" : "",
            isSel ? "ring-4 ring-pink-500/50" : ""
          ].join(' ')}
          style={{
            backgroundColor: isBusy ? '#1f2937' : (isSel ? '#ec4899' : `${bgColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`),
            borderColor: isBusy ? '#374151' : (isSel ? '#ec4899' : borderColor),
            color: textColor,
            boxShadow: isSel ? `0 0 25px ${borderColor}90, 0 0 15px ${borderColor}60` : (isBusy ? 'none' : `0 2px 8px ${borderColor}40`)
          }}
          disabled={isBusy}
          onClick={() => !isBusy && onToggle({ row: r, col: c, price, zone: zoneInfo.code })}
          onMouseEnter={(e) => {
            if (!isBusy) {
              setHoveredSeat({ 
                row: r, 
                col: c, 
                price, 
                zone: zoneInfo.name, 
                sector: zoneInfo.code,
                zoneColor: zoneInfo.color,
                isBusy, 
                isRestricted 
              })
              setHoverPosition({ x: e.clientX, y: e.clientY })
            }
          }}
          onMouseMove={(e) => {
            if (hoveredSeat) {
              setHoverPosition({ x: e.clientX, y: e.clientY })
            }
          }}
          onMouseLeave={() => setHoveredSeat(null)}
          aria-label={`Сектор ${zoneInfo.code}, Ряд ${r}, Место ${c}${price ? `, ${formatCurrency(price)}` : ''}`}
        >
          {isRestricted && (
            <span className="absolute -top-1 -right-1 text-[10px] text-yellow-400 font-bold">⚠</span>
          )}
          <span className="text-[10px]">{c}</span>
        </button>
      )
    }
    if (rowCells.length > 0) {
      grid.push(
        <div key={`row-${r}`} className="flex items-center gap-1">
          <div className="w-10 text-xs text-neutral-400 text-right pr-2 font-bold">{r}</div>
          <div className="flex-1 flex items-center justify-center flex-wrap">{rowCells}</div>
          <div className="w-10 text-xs text-neutral-400 text-left pl-2 font-bold">{r}</div>
        </div>
      )
    }
  }

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      {/* Основная область */}
      <div className="flex-1 space-y-4">
        {/* Панель управления */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleZoom(0.1)}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
              title="Увеличить"
            >
              <FaSearchPlus />
            </button>
            <button
              onClick={() => handleZoom(-0.1)}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
              title="Уменьшить"
            >
              <FaSearchMinus />
            </button>
            <button
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
              title="Сбросить"
            >
              <FaArrowsAlt />
            </button>
            <span className="text-sm text-neutral-400">Масштаб: {Math.round(zoom * 100)}%</span>
          </div>
        </div>

        {/* Сцена */}
        <div className="text-center relative">
          <div className="inline-block px-12 py-4 bg-gradient-to-b from-yellow-600 via-yellow-700 to-yellow-800 border-4 border-yellow-500 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            <div className="relative text-lg font-black text-white tracking-widest drop-shadow-lg">
              🎤 STAGE 🎤
            </div>
          </div>
          <div className="mt-2 text-xs text-neutral-500">Входы: ← →</div>
        </div>

        {/* Схема зала с возможностью панорамирования и зума */}
        <div
          ref={containerRef}
          className="overflow-hidden rounded-xl border-2 border-neutral-800 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 p-6 relative"
          style={{
            cursor: isPanning ? 'grabbing' : 'grab',
            maxHeight: '70vh'
          }}
          onMouseDown={handleMouseDown}
        >
          <div
            className="transition-transform duration-200"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            <div className="space-y-1">
              {grid}
            </div>

            {/* Стоячие зоны */}
            {Array.from(standingZones.entries()).map(([zoneCode, zoneSeats]) => {
              const zoneInfo = zonesForLegend.find(z => z.code === zoneCode)
              if (!zoneInfo) return null
              
              return (
                <div
                  key={`standing-${zoneCode}`}
                  className="mt-4 p-6 rounded-xl border-4 cursor-pointer hover:scale-105 transition-all"
                  style={{
                    backgroundColor: `${zoneInfo.color}20`,
                    borderColor: zoneInfo.color,
                    borderStyle: 'dashed'
                  }}
                  onClick={() => {
                    // При клике на стоячую зону можно выбрать первое доступное место
                    const available = zoneSeats.find(s => !busy.has(`${s.row}-${s.seat}`))
                    if (available) {
                      onToggle({
                        row: available.row,
                        col: available.seat,
                        price: priceByRC.get(`${available.row}-${available.seat}`) || 0,
                        zone: zoneCode
                      })
                    }
                  }}
                >
                  <div className="text-center">
                    <div className="font-bold text-lg mb-1" style={{ color: zoneInfo.color }}>
                      {zoneInfo.name}
                    </div>
                    <div className="text-sm text-neutral-400">
                      Стоячие места · {zoneSeats.length} мест
                      {zoneInfo.minPrice > 0 && ` · от ${formatCurrency(zoneInfo.minPrice)}`}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Hover подсказка */}
        {hoveredSeat && !hoveredSeat.isBusy && (
          <div
            className="fixed z-50 bg-gradient-to-br from-neutral-900 to-neutral-950 border-2 border-brand-500 rounded-xl p-4 shadow-2xl pointer-events-none min-w-[200px]"
            style={{
              left: `${hoverPosition.x}px`,
              top: `${hoverPosition.y - 10}px`,
              transform: 'translate(-50%, -100%)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(236,72,153,0.3)'
            }}
          >
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: hoveredSeat.zoneColor || '#999999' }} />
                <div className="font-bold text-white">Сектор: {hoveredSeat.sector || hoveredSeat.zone}</div>
              </div>
              <div className="border-t border-neutral-700 pt-2">
                <div className="text-neutral-300">
                  <span className="font-semibold">Ряд:</span> {hoveredSeat.row}
                </div>
                <div className="text-neutral-300">
                  <span className="font-semibold">Место:</span> {hoveredSeat.col}
                </div>
              </div>
              <div className="border-t border-neutral-700 pt-2">
                <div className="text-brand-400 font-bold text-lg">
                  {formatCurrency(hoveredSeat.price)}
                </div>
              </div>
              {hoveredSeat.isRestricted && (
                <div className="text-yellow-400 text-xs flex items-center gap-1">
                  <span>⚠</span>
                  <span>Ограниченный обзор</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Боковая панель */}
      <div className="w-full lg:w-80 space-y-4">
        {/* Фильтры */}
        <div className="card p-4 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <FaInfoCircle className="text-brand-400" />
            Фильтры
          </h3>

          {/* Фильтр по цене */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Цена до</label>
            <input
              type="number"
              value={priceFilter || ''}
              onChange={(e) => setPriceFilter(e.target.value ? Number(e.target.value) : null)}
              placeholder="Любая"
              className="input w-full"
            />
          </div>

          {/* Фильтр по зоне */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Зона</label>
            <select
              value={zoneFilter || ''}
              onChange={(e) => setZoneFilter(e.target.value || null)}
              className="select w-full"
            >
              <option value="">Все зоны</option>
              {zonesForLegend.map(zone => (
                <option key={zone.code} value={zone.code}>{zone.name}</option>
              ))}
            </select>
          </div>

          {/* Фильтр по доступности */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Доступность</label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="select w-full"
            >
              <option value="all">Все</option>
              <option value="available">Только доступные</option>
              <option value="occupied">Занятые</option>
            </select>
          </div>

          {/* Лучший вид */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="bestView"
              checked={bestViewFilter}
              onChange={(e) => setBestViewFilter(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-700 bg-neutral-800"
            />
            <label htmlFor="bestView" className="text-sm text-neutral-300 cursor-pointer">
              Лучший вид (первые ряды, центр)
            </label>
          </div>
        </div>

        {/* Легенда */}
        <div className="card p-4 space-y-4">
          <h3 className="font-bold text-lg">Легенда</h3>
          
          {/* Статусы */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-5 h-5 rounded-lg border-2 bg-green-500/80 border-green-500" />
              <span className="text-neutral-300">Доступно</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-5 h-5 rounded-lg border-2 bg-neutral-800 border-neutral-600 opacity-50" />
              <span className="text-neutral-300">Занято</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-5 h-5 rounded-lg border-2 bg-pink-500 border-pink-500" />
              <span className="text-neutral-300">Выбрано</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-5 h-5 rounded-lg border-2 bg-yellow-500/80 border-yellow-500 relative">
                <span className="absolute top-0 right-0 text-[8px]">⚠</span>
              </span>
              <span className="text-neutral-300">Ограниченный обзор</span>
            </div>
          </div>

          {/* Зоны */}
          {zonesForLegend.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <div className="text-sm font-semibold text-neutral-400 mb-2">Зоны и цены</div>
              {zonesForLegend.map(zone => (
                <div
                  key={zone.code}
                  className="flex items-center gap-3 p-2 rounded-lg bg-neutral-900/50"
                >
                  <div
                    className="w-6 h-6 rounded border-2 flex-shrink-0"
                    style={{
                      backgroundColor: `${zone.color}80`,
                      borderColor: zone.color
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-neutral-200">{zone.name}</div>
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
          )}
        </div>

        {/* Мини-карта */}
        <div className="card p-4">
          <h3 className="font-bold text-lg mb-3">Мини-карта</h3>
          <div className="relative bg-neutral-900 rounded-lg border border-neutral-800 p-2" style={{ height: '200px' }}>
            <div className="absolute inset-2 bg-neutral-950 rounded border border-neutral-700 overflow-hidden">
              {/* Упрощенная схема для мини-карты */}
              <div className="text-center text-[8px] text-yellow-600 font-bold py-1 border-b border-neutral-700">
                STAGE
              </div>
              <div className="p-1 space-y-0.5">
                {Array.from({ length: Math.min(rows, 10) }).map((_, i) => (
                  <div key={i} className="flex gap-0.5 justify-center">
                    {Array.from({ length: Math.min(cols, 15) }).map((_, j) => {
                      const r = i + 1
                      const c = j + 1
                      const key = `${r}-${c}`
                      const isBusy = busy.has(key)
                      const isSel = selectedRC.has(key)
                      const zoneInfo = zoneByRC.get(key)
                      const color = zoneInfo?.color || '#999999'
                      
                      return (
                        <div
                          key={j}
                          className="w-1.5 h-1.5 rounded"
                          style={{
                            backgroundColor: isSel ? '#ec4899' : (isBusy ? '#374151' : `${color}80`)
                          }}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
