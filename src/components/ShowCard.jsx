import { Link } from 'react-router-dom'
export default function ShowCard({ show, actorsById }){
  return (
    <div className="card overflow-hidden group">
      <div className="relative">
        <img src={show.posterUrl} alt={show.title} className="w-full h-56 object-cover" loading="lazy"/>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-t from-black/70 to-transparent" />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-lg">{show.title}</h3>
        <div className="flex flex-wrap gap-2">{show.genres.map(g=><span key={g} className="tag">{g}</span>)}</div>
        <div className="text-sm text-neutral-300">Рейтинг: {show.rating} · {show.durationMin} мин</div>
        <div className="text-sm text-neutral-400 line-clamp-2">
          Состав: {show.cast.slice(0,3).map(id=>actorsById[id]?.name).filter(Boolean).join(', ')}
        </div>
        <Link to={`/shows/${show.id}`} className="btn w-full bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-700 hover:to-pink-700">Подробнее</Link>
      </div>
    </div>
  )
}
