import { useMemo, useState, useRef, useEffect } from 'react'
import { formatCurrency } from '../utils/currency'

const ZONE_COLORS = {
  VIP: '#d97706',
  A: '#16a34a',
  B: '#2563eb',
  C: '#6366f1',
  STANDING: '#ef4444',
  BALCONY: '#8b5cf6'
}

const ZONE_NAMES = {
  VIP: 'VIP',
  A: 'Сектор A',
  B: 'Сектор B',
  C: 'Сектор C',
  STANDING: 'Партер',
  BALCONY: 'Балкон'
}

const SEAT_AVAILABLE = '#22c55e'
const SEAT_SOLD = '#4b5563'
const SEAT_SELECTED = '#3b82f6'

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

  const busy = useMemo(
    () => new Set(seats.filter(s => s.status && s.status !== 'available').map(s => `${s.row}-${s.seat}`)),
    [seats]
  )
  const priceByRC = useMemo(
    () => new Map(seats.map(s => [`${s.row}-${s.seat}`, Number(s.price || 0)])),
    [seats]
  )
  const zoneByRC = useMemo(
    () => new Map(seats.map(s => [`${s.row}-${s.seat}`, {
      code: s.zone,
      color: s.zoneColor || zones[s.zone]?.color || ZONE_COLORS[s.zone] || '#6b7280',
      name: s.zoneName || zones[s.zone]?.name || ZONE_NAMES[s.zone] || s.zone
    }])),
    [seats, zones]
  )
  const selectedRC = useMemo(() => new Set(selected.map(s => `${s.row}-${s.col}`)), [selected])

  const handleZoom = (delta) => setZoom(prev => Math.max(0.5, Math.min(2.5, prev + delta)))
  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }
  const handleMouseMove = (e) => {
    if (isPanning) setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
  }
  const handleMouseUp = () => setIsPanning(false)

  useEffect(() => {
    if (!isPanning) return
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isPanning, panStart])

  const grid = []
  for (let r = 1; r <= rows; r++) {
    const rowCells = []
    for (let c = 1; c <= cols; c++) {
      const key = `${r}-${c}`
      const seat = seats.find(s => s.row === r && s.seat === c)
      if (!seat) continue

      const isBusy = busy.has(key)
      const isSel = selectedRC.has(key)
      const price = priceByRC.get(key) ?? 0
      const zoneInfo = zoneByRC.get(key) || { code: '', color: '#6b7280', name: '' }

      let bg = SEAT_AVAILABLE
      if (isBusy) bg = SEAT_SOLD
      else if (isSel) bg = SEAT_SELECTED

      rowCells.push(
        <button
          key={key}
          type="button"
          disabled={isBusy}
          onClick={() => !isBusy && onToggle({ row: r, col: c, price, zone: zoneInfo.code })}
          onMouseEnter={(e) => {
            if (!isBusy) {
              setHoveredSeat({
                row: r, col: c, price, zone: zoneInfo.name, zoneColor: zoneInfo.color
              })
              setHoverPosition({ x: e.clientX, y: e.clientY })
            }
          }}
          onMouseMove={(e) => hoveredSeat && setHoverPosition({ x: e.clientX, y: e.clientY })}
          onMouseLeave={() => setHoveredSeat(null)}
          className={[
            'w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-medium border transition-all',
            isBusy ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-110 hover:z-10 hover:shadow-lg',
            isSel && 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900'
          ].join(' ')}
          style={{
            backgroundColor: bg,
            borderColor: isSel ? '#93c5fd' : (isBusy ? '#374151' : '#16a34a'),
            color: isBusy ? '#9ca3af' : '#fff'
          }}
          aria-label={`Ряд ${r}, место ${c}, ${formatCurrency(price)}`}
        >
          {c}
        </button>
      )
    }
    if (rowCells.length) {
      grid.push(
        <div key={`row-${r}`} className="flex items-center gap-0.5 justify-center">
          <span className="w-6 text-right text-xs text-neutral-500 font-medium mr-1">{r}</span>
          <div className="flex items-center gap-0.5">{rowCells}</div>
        </div>
      )
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-0">
        {/* Zoom controls — компактно */}
        <div className="flex items-center justify-end gap-2 mb-3">
          <button
            type="button"
            onClick={() => handleZoom(0.15)}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 text-sm"
            aria-label="Увеличить"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => handleZoom(-0.15)}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 text-sm"
            aria-label="Уменьшить"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 text-xs"
          >
            Сброс
          </button>
        </div>

        {/* Сцена внизу (взгляд из зала) */}
        <div
          ref={containerRef}
          className="overflow-hidden rounded-xl bg-neutral-900/80 border border-neutral-800 p-4 md:p-6"
          style={{ cursor: isPanning ? 'grabbing' : 'grab', minHeight: '320px' }}
          onMouseDown={handleMouseDown}
        >
          <div
            className="transition-transform duration-150"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            <div className="flex flex-col items-center gap-1 max-w-4xl mx-auto">
              {grid}
            </div>

            {/* Сцена под рядами */}
            <div className="mt-6 mx-auto max-w-2xl rounded-t-lg border-2 border-amber-600/60 bg-gradient-to-t from-amber-950/90 to-neutral-900 py-4 text-center">
              <span className="text-sm font-bold text-amber-200/90 tracking-widest">СЦЕНА</span>
              <p className="text-[10px] text-neutral-500 mt-1">Ряд 1 — ближе к сцене</p>
            </div>
          </div>
        </div>

        {/* Tooltip при наведении */}
        {hoveredSeat && (
          <div
            className="fixed z-50 pointer-events-none py-2 px-3 rounded-lg bg-neutral-900 border border-neutral-700 shadow-xl text-sm"
            style={{
              left: hoverPosition.x,
              top: hoverPosition.y,
              transform: 'translate(-50%, -100%) translateY(-8px)'
            }}
          >
            <div className="font-semibold text-white">
              Ряд {hoveredSeat.row}, место {hoveredSeat.col}
            </div>
            {hoveredSeat.zone && (
              <div className="text-neutral-400 text-xs" style={{ color: hoveredSeat.zoneColor }}>
                {hoveredSeat.zone}
              </div>
            )}
            <div className="text-brand-400 font-bold mt-1">
              {formatCurrency(hoveredSeat.price)}
            </div>
          </div>
        )}
      </div>

      {/* Боковая панель: легенда + подсказка */}
      <aside className="w-full lg:w-56 flex-shrink-0 space-y-4">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Обозначения
          </h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-[#22c55e] border border-green-400/50" />
              <span className="text-neutral-300">Свободно</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-[#4b5563] opacity-70" />
              <span className="text-neutral-300">Занято</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-[#3b82f6] border border-blue-300/50" />
              <span className="text-neutral-300">Ваш выбор</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-neutral-500">
          Нажмите на место, чтобы добавить его. Повторный клик — снять выбор. Итого отобразится внизу экрана.
        </p>
      </aside>
    </div>
  )
}
