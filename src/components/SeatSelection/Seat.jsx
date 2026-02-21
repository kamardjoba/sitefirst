import { useState } from 'react'
import { formatCurrency } from '../../utils/currency'

const STATES = {
  available: { bg: 'bg-emerald-500', border: 'border-emerald-600', hover: 'hover:bg-emerald-600 hover:shadow-md', label: 'Доступно' },
  selected: { bg: 'bg-brand-500', border: 'border-brand-600', hover: '', label: 'Выбрано' },
  occupied: { bg: 'bg-red-400/80', border: 'border-red-500', hover: 'cursor-not-allowed', label: 'Занято' },
  premium: { bg: 'bg-amber-400', border: 'border-amber-500', hover: 'hover:bg-amber-500 hover:shadow-md', label: 'Premium' },
  unavailable: { bg: 'bg-neutral-600', border: 'border-neutral-500', hover: 'cursor-not-allowed', label: 'Недоступно' }
}

export default function Seat({
  rowLabel,
  seatNumber,
  price,
  zoneName,
  state = 'available',
  isSelected,
  onToggle,
  disabled
}) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const canToggle = (state === 'available' || state === 'premium') && !disabled
  const visualState = isSelected ? 'selected' : state
  const style = STATES[visualState] || STATES.available

  const handleClick = () => {
    if (!canToggle) return
    onToggle?.()
  }

  const handleMouseEnter = (e) => {
    if (state === 'occupied' || state === 'unavailable') return
    setShowTooltip(true)
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top })
  }

  const handleMouseLeave = () => setShowTooltip(false)

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        disabled={!canToggle}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          w-8 h-8 sm:w-9 sm:h-9 rounded-lg border-2 flex items-center justify-center text-xs font-semibold text-white
          transition-all duration-200 select-none
          ${style.bg} ${style.border} ${style.hover}
          ${canToggle ? 'cursor-pointer active:scale-95 hover:scale-105' : ''}
          ${isSelected ? 'ring-2 ring-brand-400 ring-offset-2 ring-offset-neutral-900 shadow-lg scale-105' : ''}
        `}
        aria-label={`Ряд ${rowLabel}, место ${seatNumber}, ${formatCurrency(price)}`}
      >
        {seatNumber}
      </button>
      {showTooltip && canToggle && (
        <div
          className="fixed z-50 py-2 px-3 rounded-lg bg-slate-800 text-white text-sm shadow-xl whitespace-nowrap pointer-events-none -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 8
          }}
        >
          <div className="font-medium">Ряд {rowLabel}, Место {seatNumber}</div>
          {zoneName && <div className="text-neutral-400 text-xs">{zoneName}</div>}
          <div className="text-brand-400 font-semibold mt-0.5">{formatCurrency(price)}</div>
        </div>
      )}
    </div>
  )
}
