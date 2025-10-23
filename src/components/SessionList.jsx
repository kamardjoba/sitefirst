import { Link } from 'react-router-dom'
export default function SessionList({ show }){
  return (
    <div className="space-y-2">
      {show.sessions.map(s => (
        <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-neutral-800">
          <div className="text-neutral-300">
            <div>{new Date(s.dateISO).toLocaleDateString('ru-RU')} · {s.timeISO}</div>
            <div className="text-sm text-neutral-400">От {Math.round(s.basePrice * s.dynamicFactor)} ₽</div>
          </div>
          <Link className="btn bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-700 hover:to-pink-700" to={`/shows/${show.id}/sessions/${s.id}/seats`}>Выбрать места</Link>
        </div>
      ))}
    </div>
  )
}
