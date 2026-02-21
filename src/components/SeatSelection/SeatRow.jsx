import Seat from './Seat'

export default function SeatRow({
  rowLabel,
  seats,
  selectedSet,
  onSeatToggle,
  maxSelection,
  aisleAfter = 0
}) {
  const isRowHighlighted = seats.some(s => selectedSet.has(`${s.row}-${s.seat}`))

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5">
      <span
        className={`w-6 sm:w-7 text-right text-sm font-semibold text-slate-600 ${isRowHighlighted ? 'text-blue-600' : ''}`}
      >
        {rowLabel}
      </span>
      <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap justify-center max-w-full">
        {seats.map((seat) => {
          const key = `${seat.row}-${seat.seat}`
          const isSelected = selectedSet.has(key)
          const selectedCount = selectedSet.size
          const disabled = !isSelected && selectedCount >= maxSelection
          return (
            <Seat
              key={key}
              rowLabel={rowLabel}
              seatNumber={seat.seat}
              price={seat.price}
              zoneName={seat.zoneName}
              state={seat.displayState}
              isSelected={isSelected}
              onToggle={() => onSeatToggle(seat)}
              disabled={disabled}
            />
          )
        })}
      </div>
      {aisleAfter > 0 && (
        <div className="w-4 sm:w-6 flex-shrink-0" aria-hidden />
      )}
    </div>
  )
}
