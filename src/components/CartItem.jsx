import { useMemo } from 'react'

export default function CartItem({ item, show, onRemove }){
  // derive session by eventId (our sessionId === eventId), fallback to first session
  const session = useMemo(() => {
    const list = show?.sessions || []
    const byId = list.find(s => String(s.id) === String(item.eventId))
    return byId || list[0] || null
  }, [show, item?.eventId])

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
        <div className="font-semibold">{Number(item?.price || 0)} ₽</div>
        <button className="text-neutral-400 hover:text-red-400" onClick={onRemove} aria-label="Удалить">×</button>
      </div>
    </div>
  )
}
