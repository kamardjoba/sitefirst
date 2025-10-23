export default function CartItem({ item, show, onRemove }){
  return (
    <div className="flex items-center justify-between border border-neutral-800 rounded-xl p-3">
      <div>
        <div className="font-medium">{show?.title}</div>
        <div className="text-sm text-neutral-400">Ряд {item.seat.row}, место {item.seat.col} · {new Date(item.session.dateISO).toLocaleDateString('ru-RU')} {item.session.timeISO}</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="font-semibold">{item.price} ₽</div>
        <button className="text-neutral-400 hover:text-red-400" onClick={onRemove} aria-label="Удалить">×</button>
      </div>
    </div>
  )
}
