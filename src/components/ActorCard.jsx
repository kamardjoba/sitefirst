import { Link } from 'react-router-dom'

export default function ActorCard({ actor, showsById }){
  const genres = Array.isArray(actor?.genres) ? actor.genres : []
  const shows  = Array.isArray(actor?.shows)  ? actor.shows  : []

  return (
    <div className="card overflow-hidden group">
      <div className="relative">
        {actor?.avatarUrl ? (
          <img src={actor.avatarUrl} alt={actor?.name || ''} className="w-full h-48 object-cover" loading="lazy"/>
        ) : (
          <div className="w-full h-48 bg-neutral-800" />
        )}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-t from-black/70 to-transparent" />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-lg">{actor?.name || 'Без имени'}</h3>
        <p className="text-sm text-neutral-300 line-clamp-2">{actor?.bio || ''}</p>
        <div className="flex flex-wrap gap-2">
          {genres.slice(0,3).map(g => <span key={g} className="tag">{g}</span>)}
        </div>
        <div className="text-sm text-neutral-400">
          Топ: {shows.slice(0,2).map(id => (showsById?.[id]?.title)).filter(Boolean).join(', ')}
        </div>
        <Link to={`/actors/${actor?.id}`} className="btn w-full bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-700 hover:to-pink-700">
          Профиль
        </Link>
      </div>
    </div>
  )
}
