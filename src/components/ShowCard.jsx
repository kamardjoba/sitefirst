import { Link } from 'react-router-dom'

export default function ShowCard({ show = {}, actorsById = {} }){
  const genres = Array.isArray(show.genres) ? show.genres : []
  const cast = Array.isArray(show.cast) ? show.cast : []
  const duration = show.durationMin ?? show.duration ?? ''
  const poster = show.posterUrl || show.poster_url || ''
  const title = show.title || 'Без названия'

  return (
    <div className="card overflow-hidden group">
      <div className="relative">
        {poster ? (
          <img src={poster} alt={title} className="w-full h-56 object-cover" loading="lazy"/>
        ) : (
          <div className="w-full h-56 bg-neutral-800" aria-hidden />
        )}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-t from-black/70 to-transparent" />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-lg">{title}</h3>
        <div className="flex flex-wrap gap-2">
          {genres.map(g=><span key={g} className="tag">{g}</span>)}
        </div>
        <div className="text-sm text-neutral-300">
          Рейтинг: {show.rating ?? '—'}{duration ? ` · ${duration} мин` : ''}
        </div>
        <div className="text-sm text-neutral-400 line-clamp-2">
          Состав: {cast.slice(0,3).map(id=>actorsById[id]?.name).filter(Boolean).join(', ') || '—'}
        </div>
        <Link to={`/shows/${show.id}`} className="btn w-full bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-700 hover:to-pink-700">
          Подробнее
        </Link>
      </div>
    </div>
  )
}
