import { useMemo } from 'react'
import { formatCurrency } from '../utils/currency'

export default function CartItem({ item, show, onRemove }){
  const session = useMemo(() => {
    const list = show?.sessions || []
    const targetId = item?.sessionId || item?.eventId
    const byId = list.find(s => String(s.id) === String(targetId))
    return byId || list[0] || null
  }, [show, item?.eventId, item?.sessionId])

  const dateText = session?.dateISO
    ? new Date(session.dateISO).toLocaleDateString('ru-RU')
    : ''

  return (
    <div className="flex items-center justify-between border border-neutral-800 rounded-xl p-3">
      <div>
        <div className="font-medium">{show?.title || 'Событие'}</div>
        <div className="text-sm text-neutral-400">
          Ряд {item?.seat?.row} · Место {item?.seat?.col}
          {dateText || session?.timeISO ? (
            <> · {dateText} {session?.timeISO}</>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="font-semibold">{formatCurrency(item?.price)}</div>
        <button className="text-neutral-400 hover:text-red-400" onClick={onRemove} aria-label="Удалить">×</button>
      </div>
    </div>
  )
}
