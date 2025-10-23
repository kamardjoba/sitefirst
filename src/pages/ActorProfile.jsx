import { useParams, Link } from 'react-router-dom'
import { useActorsStore } from '../store/actors'
import { useShowsStore } from '../store/shows'

export default function ActorProfile(){
  const { id } = useParams()
  const actor = useActorsStore(s=>s.list.find(a=>String(a.id)===String(id)))
  const shows = useShowsStore(s=>s.list.filter(sh=> actor?.shows.includes(sh.id)))
  if(!actor) return <div>Актёр не найден</div>
  return (
    <section className="space-y-6">
      <div className="card overflow-hidden">
        <img src={actor.avatarUrl} alt={actor.name} className="w-full h-64 object-cover" />
        <div className="p-4 space-y-2">
          <h1 className="text-2xl font-bold">{actor.name}</h1>
          <p className="text-neutral-300">{actor.bio}</p>
          <div className="flex flex-wrap gap-2">{actor.genres.map(g=><span key={g} className="tag">{g}</span>)}</div>
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Постановки</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shows.map(sh=> (
            <div key={sh.id} className="card p-4 space-y-2">
              <div className="font-medium">{sh.title}</div>
              <div className="text-sm text-neutral-400">{sh.genres.join(', ')}</div>
              <Link to={`/shows/${sh.id}`} className="btn w-full bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-700 hover:to-pink-700">Купить билет</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
