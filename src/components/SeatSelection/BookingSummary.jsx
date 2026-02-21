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
    <aside className="rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden flex flex-col h-fit">
      <div className="p-5 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 truncate">{eventName || 'Событие'}</h2>
        {dateTime && (
          <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
            <FaCalendarAlt className="text-slate-400 flex-shrink-0" />
            <span>{dateTime}</span>
          </div>
        )}
        {location && (
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
            <FaMapMarkerAlt className="text-slate-400 flex-shrink-0" />
            <span>{location}</span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 min-h-0">
        <div className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
          <FaTicketAlt className="text-blue-500" />
          <span>Выбранные места</span>
        </div>
        {selectedSeats.length === 0 ? (
          <p className="text-sm text-slate-500">Выберите места на схеме</p>
        ) : (
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {selectedSeats.map((s, i) => (
              <li
                key={i}
                className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-slate-50"
              >
                <span className="text-slate-700">Ряд {s.rowLabel}, Место {s.seatNumber}</span>
                <span className="font-medium text-slate-800">{formatCurrency(s.price)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
        {pricePerTicket != null && selectedSeats.length > 0 && (
          <div className="flex justify-between text-sm text-slate-600">
            <span>Цена за билет</span>
            <span>{formatCurrency(pricePerTicket)}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-2">
          <span className="font-bold text-slate-800">Итого</span>
          <span className="text-xl font-bold text-blue-600">{formatCurrency(total)}</span>
        </div>
        <button
          type="button"
          disabled={!hasSelection || isLoading}
          onClick={onContinue}
          className="w-full py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none"
        >
          {hasSelection ? `Продолжить · ${formatCurrency(total)}` : 'Продолжить'}
        </button>
      </div>
    </aside>
  )
}
