import { formatCurrency } from '../../utils/currency'
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt } from 'react-icons/fa'

export default function BookingSummary({
  eventName,
  dateTime,
  location,
  selectedSeats,
  pricePerTicket,
  total,
  onContinue,
  isLoading
}) {
  const hasSelection = selectedSeats.length > 0

  return (
    <aside className="card overflow-hidden flex flex-col h-fit">
      <div className="p-5 border-b border-neutral-800">
        <h2 className="text-lg font-bold text-white truncate">{eventName || 'Событие'}</h2>
        {dateTime && (
          <div className="flex items-center gap-2 mt-2 text-sm text-neutral-400">
            <FaCalendarAlt className="text-neutral-500 flex-shrink-0" />
            <span>{dateTime}</span>
          </div>
        )}
        {location && (
          <div className="flex items-center gap-2 mt-1 text-sm text-neutral-400">
            <FaMapMarkerAlt className="text-neutral-500 flex-shrink-0" />
            <span>{location}</span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 min-h-0">
        <div className="flex items-center gap-2 text-neutral-300 font-semibold mb-3">
          <FaTicketAlt className="text-brand-500" />
          <span>Выбранные места</span>
        </div>
        {selectedSeats.length === 0 ? (
          <p className="text-sm text-neutral-500">Выберите места на схеме</p>
        ) : (
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {selectedSeats.map((s, i) => (
              <li
                key={i}
                className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-neutral-800/50 border border-neutral-700"
              >
                <span className="text-neutral-300">Ряд {s.rowLabel}, Место {s.seatNumber}</span>
                <span className="font-medium text-white">{formatCurrency(s.price)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-5 border-t border-neutral-800 bg-neutral-800/30 space-y-3">
        {pricePerTicket != null && selectedSeats.length > 0 && (
          <div className="flex justify-between text-sm text-neutral-400">
            <span>Цена за билет</span>
            <span>{formatCurrency(pricePerTicket)}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-2">
          <span className="font-bold text-white">Итого</span>
          <span className="text-xl font-bold text-brand-400">{formatCurrency(total)}</span>
        </div>
        <button
          type="button"
          disabled={!hasSelection || isLoading}
          onClick={onContinue}
          className="btn w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {hasSelection ? `Продолжить · ${formatCurrency(total)}` : 'Продолжить'}
        </button>
      </div>
    </aside>
  )
}
