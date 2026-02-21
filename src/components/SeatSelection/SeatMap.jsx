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

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onZoomChange?.(Math.min(2, (zoom || 1) + 0.2))}
            className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => onZoomChange?.(Math.max(0.5, (zoom || 1) - 0.2))}
            className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium"
          >
            −
          </button>
          <span className="text-sm text-slate-500 ml-1">Масштаб {Math.round((zoom || 1) * 100)}%</span>
        </div>
        {onAutoSelectBest && (
          <button
            type="button"
            onClick={handleAutoSelect}
            className="px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            Автовыбор лучших мест
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mx-4 mt-2 py-2 px-3 rounded-lg bg-red-50 text-red-700 text-sm font-medium">
          {errorMessage}
        </div>
      )}

      <div className="p-4 overflow-x-auto overflow-y-auto" style={{ maxHeight: '70vh' }}>
        <div
          className="inline-flex flex-col items-center gap-1.5 transition-transform duration-200 origin-top"
          style={{ transform: `scale(${zoom || 1})` }}
        >
          {/* Сцена */}
          <div className="w-full max-w-2xl py-4 rounded-t-xl bg-slate-800 text-white text-center shadow-inner">
            <span className="text-sm font-bold tracking-widest">СЦЕНА / ЭКРАН</span>
          </div>

          {/* Ряды с проходами: разбиваем по секциям (например после 6 и 13 места) */}
          {rows.map(([rowNum, rowSeats]) => {
            const rowLabel = rowNumberToLetter(rowNum)
            const sections = []
            const aisleIndices = [6, 13]
            let start = 0
            for (const idx of aisleIndices) {
              if (idx <= rowSeats.length) {
                sections.push(rowSeats.slice(start, idx))
                start = idx
              }
            }
            if (start < rowSeats.length) sections.push(rowSeats.slice(start))
            if (sections.length === 0) sections.push(rowSeats)

            return (
              <div key={rowNum} className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
                {sections.map((sectionSeats, idx) => (
                  <SeatRow
                    key={idx}
                    rowLabel={rowLabel}
                    seats={sectionSeats}
                    selectedSet={selectedSet}
                    onSeatToggle={handleSeatToggle}
                    maxSelection={maxSelection}
                    aisleAfter={idx < sections.length - 1 ? 1 : 0}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
