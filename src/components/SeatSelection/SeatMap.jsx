import { useMemo, useState } from 'react'
import SeatRow from './SeatRow'
import { rowNumberToLetter } from '../../utils/seatLabels'

export default function SeatMap({
  seats,
  selectedList,
  onToggleSeat,
  maxSelection = 6,
  zoom = 1,
  onZoomChange,
  priceFilter,
  onAutoSelectBest
}) {
  const [errorMessage, setErrorMessage] = useState('')

  const selectedSet = useMemo(
    () => new Set(selectedList.map(s => `${s.row}-${s.seat}`)),
    [selectedList]
  )

  const seatsWithState = useMemo(() => {
    return seats.map(s => {
      let displayState = 'available'
      if (s.status && s.status !== 'available') displayState = 'occupied'
      else if (String(s.zone || '').toUpperCase().includes('VIP')) displayState = 'premium'
      return { ...s, displayState }
    })
  }, [seats])

  const filteredByPrice = useMemo(() => {
    if (!priceFilter || priceFilter <= 0) return seatsWithState
    return seatsWithState.filter(s => Number(s.price || 0) <= priceFilter)
  }, [seatsWithState, priceFilter])

  const rows = useMemo(() => {
    const byRow = new Map()
    filteredByPrice.forEach(seat => {
      const r = seat.row
      if (!byRow.has(r)) byRow.set(r, [])
      byRow.get(r).push(seat)
    })
    byRow.forEach((rowSeats, r) => {
      rowSeats.sort((a, b) => a.seat - b.seat)
    })
    return Array.from(byRow.entries()).sort((a, b) => a[0] - b[0])
  }, [filteredByPrice])

  const handleSeatToggle = (seat) => {
    const key = `${seat.row}-${seat.seat}`
    if (seat.displayState === 'occupied' || seat.displayState === 'unavailable') {
      setErrorMessage('Это место уже занято')
      setTimeout(() => setErrorMessage(''), 2000)
      return
    }
    if (selectedSet.has(key) || selectedSet.size < maxSelection) {
      setErrorMessage('')
      onToggleSeat?.(seat)
    }
  }

  const handleAutoSelect = () => {
    if (!onAutoSelectBest || rows.length === 0) return
    const available = filteredByPrice.filter(
      s => s.displayState === 'available' || s.displayState === 'premium'
    )
    const cols = available.length ? Math.max(...available.map(s => s.seat)) : 18
    const centerCol = (cols + 1) / 2
    const sorted = [...available].sort((a, b) => {
      const rowDiff = a.row - b.row
      if (rowDiff !== 0) return rowDiff
      const aCenter = Math.abs(a.seat - centerCol)
      const bCenter = Math.abs(b.seat - centerCol)
      return aCenter - bCenter
    })
    const toSelect = sorted.slice(0, maxSelection)
    onAutoSelectBest(toSelect)
  }

  // Группировка рядов по зонам для подписей (VIP, A, B)
  const rowsByZone = useMemo(() => {
    const zoneOrder = []
    const seen = new Set()
    rows.forEach(([rowNum, rowSeats]) => {
      const zone = rowSeats[0]?.zone
      if (zone && !seen.has(zone)) {
        seen.add(zone)
        zoneOrder.push({ zone, rowNum })
      }
    })
    return zoneOrder
  }, [rows])

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onZoomChange?.(Math.min(2, (zoom || 1) + 0.2))}
            className="w-9 h-9 rounded-lg border border-neutral-700 bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 font-medium transition-colors"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => onZoomChange?.(Math.max(0.5, (zoom || 1) - 0.2))}
            className="w-9 h-9 rounded-lg border border-neutral-700 bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 font-medium transition-colors"
          >
            −
          </button>
          <span className="text-sm text-neutral-400 ml-1">Масштаб {Math.round((zoom || 1) * 100)}%</span>
        </div>
        {onAutoSelectBest && (
          <button type="button" onClick={handleAutoSelect} className="btn text-sm py-2">
            Автовыбор лучших мест
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mx-4 mt-2 py-2 px-3 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium border border-red-500/30">
          {errorMessage}
        </div>
      )}

      <div className="p-4 overflow-x-auto overflow-y-auto" style={{ maxHeight: '70vh' }}>
        <div
          className="inline-flex flex-col items-center gap-1.5 transition-transform duration-200 origin-top"
          style={{ transform: `scale(${zoom || 1})` }}
        >
          {/* Сцена — сверху, как в зале */}
          <div className="w-full max-w-2xl py-4 rounded-t-xl bg-gradient-to-b from-amber-950/80 to-neutral-900 border-b-2 border-amber-600/40 text-center">
            <span className="text-sm font-bold tracking-widest text-amber-200/90">СЦЕНА</span>
          </div>

          {/* Ряды одной линией (без шахматного разрыва): сцена → VIP → A → B */}
          {rows.map(([rowNum, rowSeats]) => {
            const zoneLabel = rowsByZone.find(z => z.rowNum === rowNum)
            const rowLabel = rowNumberToLetter(rowNum)
            return (
              <div key={rowNum} className="flex flex-col items-center gap-0.5">
                {zoneLabel && (
                  <div className="w-full max-w-2xl text-center">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      {zoneLabel.zone === 'VIP' ? 'VIP' : `Сектор ${zoneLabel.zone}`}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-center">
                  <SeatRow
                    rowLabel={rowLabel}
                    seats={rowSeats}
                    selectedSet={selectedSet}
                    onSeatToggle={handleSeatToggle}
                    maxSelection={maxSelection}
                    aisleAfter={0}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
