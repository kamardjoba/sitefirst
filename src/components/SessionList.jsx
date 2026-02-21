import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/currency'

export default function SessionList({ show }){
  const sessions = Array.isArray(show?.sessions) ? show.sessions : []
  return (
    <div className="space-y-2">
      {sessions.map(s => (
        <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-neutral-800">
          <div className="text-neutral-300">
            <div>{new Date(s.dateISO).toLocaleDateString('ru-RU')} · {s.timeISO}</div>
            <div className="text-sm text-neutral-400">
              От {formatCurrency(Math.round(s.basePrice * s.dynamicFactor))}
            </div>
          </div>
          <Link className="btn" to={`/shows/${show.id}/seats`}>Выбрать места</Link>
        </div>
      ))}
    </div>
  )
}
